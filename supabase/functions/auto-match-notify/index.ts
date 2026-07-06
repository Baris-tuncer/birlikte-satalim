// Supabase Edge Function: auto-match-notify
// Yeni ilan veya talep olusturuldugunda uygun kullanicilara push bildirim gonderir.
//
// Tetiklenir:
// 1. listings tablosuna INSERT → uygun buyer_demands sahiplerine bildirim
// 2. buyer_demands tablosuna INSERT → uygun listings sahiplerine bildirim

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface WebhookPayload {
  type: 'INSERT';
  table: 'listings' | 'buyer_demands';
  record: Record<string, unknown>;
}

// Son 5 dakikada aynı (user_id, type, reference_id) ile bildirim gönderilip gönderilmediğini kontrol et
async function filterAlreadyNotified(
  supabase: ReturnType<typeof createClient>,
  userIds: string[],
  type: string,
  referenceId: string,
): Promise<string[]> {
  if (userIds.length === 0) return [];
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from('notifications')
    .select('user_id')
    .in('user_id', userIds)
    .eq('type', type)
    .eq('reference_id', referenceId)
    .gte('created_at', fiveMinAgo);
  const alreadyNotified = new Set((existing ?? []).map((n: { user_id: string }) => n.user_id));
  return userIds.filter((uid) => !alreadyNotified.has(uid));
}

async function sendPushMessages(
  supabase: ReturnType<typeof createClient>,
  tokens: { user_id: string; token: string }[],
  title: string,
  body: string,
  data: Record<string, unknown>,
) {
  if (!tokens || tokens.length === 0) return;
  const messages = tokens.map((t) => ({
    to: t.token,
    title,
    body,
    sound: 'default' as const,
    data,
    channelId: 'default',
    priority: 'high' as const,
  }));
  const expoResponse = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(Deno.env.get('EXPO_ACCESS_TOKEN')
        ? { Authorization: `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}` }
        : {}),
    },
    body: JSON.stringify(messages),
  });
  const result = await expoResponse.json();

  // Gecersiz token'lari temizle
  if (result.data && Array.isArray(result.data)) {
    const invalidTokens: string[] = [];
    result.data.forEach((ticket: { status: string; details?: { error?: string } }, i: number) => {
      if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
        invalidTokens.push(messages[i].to);
      }
    });
    if (invalidTokens.length > 0) {
      await supabase.from('push_tokens').delete().in('token', invalidTokens);
    }
  }
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();

    if (payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Ignored' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (payload.table === 'listings') {
      const listing = payload.record;
      const agentId = listing.agent_id as string;
      const city = (listing.city as string) || 'İstanbul';
      const district = listing.district as string;
      const transactionType = listing.transaction_type as string;
      const propertyType = listing.property_type as string;
      const price = listing.price as number;
      const neighborhood = listing.neighborhood as string | null;
      const roomCount = listing.room_count as string | null;

      const locationText = neighborhood ? `${neighborhood}, ${district}` : district;
      const typeText = transactionType === 'SALE' ? 'satılık' : 'kiralık';
      const priceVal = price ? `${(price / 1000000).toFixed(1)}M TL` : '';
      const roomText = roomCount ? ` ${roomCount}` : '';
      const propText = propertyType === 'RESIDENTIAL' ? 'konut' : (propertyType === 'COMMERCIAL' ? 'ticari' : 'arsa');

      let demandUserIds: string[] = [];

      // 1. Uygun talepleri bul ve bildir
      const { data: demands } = await supabase
        .from('buyer_demands')
        .select('id, agent_id, district, neighborhoods')
        .eq('status', 'ACTIVE')
        .eq('city', city)
        .eq('district', district)
        .eq('transaction_type', transactionType)
        .eq('property_type', propertyType)
        .lte('min_budget', price)
        .gte('max_budget', price)
        .neq('agent_id', agentId);

      if (demands && demands.length > 0) {
        const matchingDemands = demands.filter((d) => {
          const dn = (d.neighborhoods as string[]) ?? [];
          if (dn.length === 0) return true;
          if (!neighborhood) return true;
          return dn.includes(neighborhood);
        });

        if (matchingDemands.length > 0) {
          const allDemandUserIds = [...new Set(matchingDemands.map((d) => d.agent_id))];
          // Son 5 dk içinde aynı bildirim gönderilmiş kullanıcıları çıkar
          demandUserIds = await filterAlreadyNotified(supabase, allDemandUserIds, 'auto_match_listing', listing.id as string);

          if (demandUserIds.length > 0) {
            const { data: tokens } = await supabase
              .from('push_tokens')
              .select('user_id, token')
              .in('user_id', demandUserIds);

            const title = `Talebinize uygun${roomText} ${typeText} ${propText}`;
            const body = `${locationText}'da${priceVal ? ` ${priceVal} fiyatla` : ''} yeni ilan eklendi. Hemen inceleyin!`;

            await sendPushMessages(supabase, tokens ?? [], title, body, { listingId: listing.id, type: 'auto_match_listing' });

            await supabase.from('notifications').insert(
              demandUserIds.map((uid) => ({
                user_id: uid, title, body,
                type: 'auto_match_listing',
                reference_id: listing.id as string,
                status: 'sent',
              }))
            );
          }
        }
      }

      // 2. Uzmanlık bölgesi bildirimi — talep bildirimi olsun olmasın her zaman çalışır
      const { data: experts } = await supabase
        .from('users')
        .select('id')
        .eq('expertise_city', city)
        .contains('expertise_districts', [district])
        .neq('id', agentId);

      if (experts && experts.length > 0) {
        // Talep bildirimi zaten almış kullanıcıları hariç tut + dedup
        const candidateIds = experts
          .map((e: { id: string }) => e.id)
          .filter((eid: string) => !demandUserIds.includes(eid));
        const expertIds = await filterAlreadyNotified(supabase, candidateIds, 'expertise_listing', listing.id as string);

        if (expertIds.length > 0) {
          const { data: expertTokens } = await supabase
            .from('push_tokens')
            .select('user_id, token')
            .in('user_id', expertIds);

          const expertTitle = `Bölgenizde yeni${roomText} ${typeText} ${propText}`;
          const expertBody = `${locationText}'da${priceVal ? ` ${priceVal} fiyatla` : ''} yeni ilan eklendi. Uzmanlık bölgenize uygun!`;

          await sendPushMessages(supabase, expertTokens ?? [], expertTitle, expertBody, { listingId: listing.id, type: 'expertise_listing' });

          await supabase.from('notifications').insert(
            expertIds.map((uid: string) => ({
              user_id: uid,
              title: expertTitle,
              body: expertBody,
              type: 'expertise_listing',
              reference_id: listing.id as string,
              status: 'sent',
            }))
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true, demandMatches: demandUserIds.length, experts: experts?.length ?? 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } else if (payload.table === 'buyer_demands') {
      const demand = payload.record;
      const agentId = demand.agent_id as string;
      const city = (demand.city as string) || 'İstanbul';
      const district = demand.district as string;
      const transactionType = demand.transaction_type as string;
      const propertyType = demand.property_type as string;
      const minBudget = demand.min_budget as number;
      const maxBudget = demand.max_budget as number;
      const neighborhoods = (demand.neighborhoods as string[]) ?? [];

      const typeText = transactionType === 'SALE' ? 'satılık' : 'kiralık';
      const propText = propertyType === 'RESIDENTIAL' ? 'konut' : (propertyType === 'COMMERCIAL' ? 'ticari' : 'arsa');
      const budgetText = maxBudget ? ` (${(minBudget / 1000000).toFixed(1)}-${(maxBudget / 1000000).toFixed(1)}M TL)` : '';

      let listingUserIds: string[] = [];

      // 1. Uygun ilanları bul ve bildir
      const { data: listings } = await supabase
        .from('listings')
        .select('id, agent_id, district, neighborhood')
        .eq('status', 'ACTIVE')
        .eq('city', city)
        .eq('district', district)
        .eq('transaction_type', transactionType)
        .eq('property_type', propertyType)
        .gte('price', minBudget)
        .lte('price', maxBudget)
        .neq('agent_id', agentId);

      if (listings && listings.length > 0) {
        const matchingListings = listings.filter((l) => {
          if (neighborhoods.length === 0) return true;
          const ln = l.neighborhood as string | null;
          if (!ln) return true;
          return neighborhoods.includes(ln);
        });

        if (matchingListings.length > 0) {
          const allListingUserIds = [...new Set(matchingListings.map((l) => l.agent_id))];
          listingUserIds = await filterAlreadyNotified(supabase, allListingUserIds, 'auto_match_demand', demand.id as string);

          if (listingUserIds.length > 0) {
            const { data: tokens } = await supabase
              .from('push_tokens')
              .select('user_id, token')
              .in('user_id', listingUserIds);

            const title = `İlanınıza uygun yeni ${typeText} talebi`;
            const body = `${district}'da ${typeText} ${propText} arayan bir müşteri var${budgetText}. İlanınız bu talebe uygun!`;

            await sendPushMessages(supabase, tokens ?? [], title, body, { demandId: demand.id, type: 'auto_match_demand' });

            await supabase.from('notifications').insert(
              listingUserIds.map((uid) => ({
                user_id: uid, title, body,
                type: 'auto_match_demand',
                reference_id: demand.id as string,
                status: 'sent',
              }))
            );
          }
        }
      }

      // 2. Uzmanlık bölgesi bildirimi — ilan bildirimi olsun olmasın her zaman çalışır
      const { data: experts } = await supabase
        .from('users')
        .select('id')
        .eq('expertise_city', city)
        .contains('expertise_districts', [district])
        .neq('id', agentId);

      if (experts && experts.length > 0) {
        const candidateIds = experts
          .map((e: { id: string }) => e.id)
          .filter((eid: string) => !listingUserIds.includes(eid));
        const expertIds = await filterAlreadyNotified(supabase, candidateIds, 'expertise_demand', demand.id as string);

        if (expertIds.length > 0) {
          const { data: expertTokens } = await supabase
            .from('push_tokens')
            .select('user_id, token')
            .in('user_id', expertIds);

          const expertTitle = `Bölgenizde yeni ${typeText} ${propText} talebi`;
          const expertBody = `${district}'da ${typeText} ${propText} arayan bir müşteri var${budgetText}. Uzmanlık bölgenize uygun!`;

          await sendPushMessages(supabase, expertTokens ?? [], expertTitle, expertBody, { demandId: demand.id, type: 'expertise_demand' });

          await supabase.from('notifications').insert(
            expertIds.map((uid: string) => ({
              user_id: uid,
              title: expertTitle,
              body: expertBody,
              type: 'expertise_demand',
              reference_id: demand.id as string,
              status: 'sent',
            }))
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true, listingMatches: listingUserIds.length, experts: experts?.length ?? 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Unknown table' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Auto-match notification error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
