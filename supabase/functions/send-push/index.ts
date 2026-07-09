// Supabase Edge Function: send-push
// Yeni match olusturuldugunda hedef kullaniciya push bildirim gonderir.
//
// Kullanim:
// 1. Supabase Dashboard → Database → Webhooks → yeni webhook olustur:
//    - Table: matches
//    - Events: INSERT
//    - URL: https://YOUR-PROJECT.supabase.co/functions/v1/send-push
//    - Header: Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
//
// 2. Edge Function deploy:
//    supabase functions deploy send-push --project-ref YOUR_PROJECT_REF
//
// 3. Secret ayarla:
//    supabase secrets set EXPO_ACCESS_TOKEN=your-expo-access-token

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    requester_id: string;
    target_id: string;
    match_type: 'LISTING' | 'DEMAND';
    listing_id?: string;
    demand_id?: string;
    message?: string;
    status: string;
  };
  old_record: Record<string, unknown> | null;
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();

    // Sadece yeni eslesmeler icin bildirim gonder
    if (payload.type !== 'INSERT' || payload.table !== 'matches') {
      return new Response(JSON.stringify({ message: 'Ignored' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const match = payload.record;

    // Supabase client (service role)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Talep edenin adini al
    const { data: requester } = await supabase
      .from('users')
      .select('name, company_name')
      .eq('id', match.requester_id)
      .single();

    const requesterName = requester?.name ?? 'Bir danışman';
    const isListing = match.match_type === 'LISTING';

    // İlan/talep detaylarını al
    let detailText = '';
    if (isListing && match.listing_id) {
      const { data: listing } = await supabase
        .from('listings')
        .select('district, neighborhood, property_type, room_count, transaction_type')
        .eq('id', match.listing_id)
        .single();
      if (listing) {
        const loc = listing.neighborhood ? `${listing.neighborhood}, ${listing.district}` : listing.district;
        const type = listing.transaction_type === 'SALE' ? 'satılık' : 'kiralık';
        const room = listing.room_count ? ` ${listing.room_count}` : '';
        detailText = ` (${loc} -${room} ${type})`;
      }
    } else if (match.demand_id) {
      const { data: demand } = await supabase
        .from('buyer_demands')
        .select('district, property_type, transaction_type')
        .eq('id', match.demand_id)
        .single();
      if (demand) {
        const type = demand.transaction_type === 'SALE' ? 'satılık' : 'kiralık';
        detailText = ` (${demand.district} - ${type})`;
      }
    }

    const title = isListing
      ? `${requesterName} ilanınızla iş birliği yapmak istiyor`
      : `${requesterName} portföyünden bir ilan önerdi`;

    const body = isListing
      ? `Müşterisi için ilanınızı${detailText} talep ediyor. Talebi inceleyip kabul edebilirsiniz.`
      : `Talebiniz${detailText} için portföyünden bir ilan önerdi. Talebi inceleyip kabul edebilirsiniz.`;

    // Dedup: aynı match için son 5 dk içinde bildirim gönderilmiş mi?
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', match.target_id)
      .eq('type', 'match_request')
      .eq('reference_id', match.id)
      .gte('created_at', fiveMinAgo)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Duplicate notification skipped' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ÖNCE DB'ye yaz — duplike ise sessizce atla
    const { data: inserted } = await supabase.from('notifications').upsert({
      user_id: match.target_id,
      title,
      body,
      type: 'match_request',
      reference_id: match.id,
      status: 'sent',
    }, { onConflict: 'user_id,type,reference_id', ignoreDuplicates: true })
    .select('id');

    // Eğer insert edilmediyse (duplike), push gönderme
    if (!inserted || inserted.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Duplicate notification skipped' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hedef kullanicinin push token'larini al
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', match.target_id);

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Notification saved, no push tokens' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // SONRA push gönder
    const messages = tokens.map((t: { token: string }) => ({
      to: t.token,
      title,
      body,
      sound: 'default',
      data: { matchId: match.id },
      channelId: 'default',
      priority: 'high',
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

    return new Response(
      JSON.stringify({ success: true, tickets: result.data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Push notification error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
