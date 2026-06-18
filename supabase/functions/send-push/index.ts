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

    // Hedef kullanicinin push token'larini al
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', match.target_id);

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No push tokens found' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Talep edenin adini al
    const { data: requester } = await supabase
      .from('users')
      .select('name, company_name')
      .eq('id', match.requester_id)
      .single();

    const requesterName = requester?.name ?? 'Bir emlakçı';
    const isListing = match.match_type === 'LISTING';

    const title = isListing
      ? 'Yeni Eşleşme Talebi'
      : 'Portföy Eşleşme Talebi';

    const body = isListing
      ? `${requesterName} ilanınızla ilgileniyor.`
      : `${requesterName} talebiniz için portföyünden eşleşme gönderiyor.`;

    // Expo Push API'ye gonder
    const messages = tokens.map((t: { token: string }) => ({
      to: t.token,
      title,
      body,
      sound: 'default',
      data: { matchId: match.id },
      channelId: 'default',
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

    // Bildirim kaydini notifications tablosuna yaz
    await supabase.from('notifications').insert({
      user_id: match.target_id,
      title,
      body,
      type: 'match_request',
      reference_id: match.id,
      status: 'sent',
    });

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
