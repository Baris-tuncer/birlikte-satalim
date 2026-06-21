// Supabase Edge Function: match-response-push
// Esleme kabul/red edildiginde talep edene push bildirim gonderir.
//
// Webhook ayarlari:
//    - Table: matches
//    - Events: UPDATE
//    - URL: https://YOUR-PROJECT.supabase.co/functions/v1/match-response-push
//    - Header: Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>

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
    status: string;
  };
  old_record: {
    status: string;
  } | null;
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();

    // Sadece status degisiklikleri icin (PENDING -> ACCEPTED/REJECTED)
    if (payload.type !== 'UPDATE' || payload.table !== 'matches') {
      return new Response(JSON.stringify({ message: 'Ignored' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const match = payload.record;
    const oldStatus = payload.old_record?.status;

    // Sadece PENDING'den ACCEPTED veya REJECTED'a gecisleri dinle
    if (oldStatus !== 'PENDING' || (match.status !== 'ACCEPTED' && match.status !== 'REJECTED')) {
      return new Response(JSON.stringify({ message: 'Not a status change' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Yanit verenin adini al
    const { data: responder } = await supabase
      .from('users')
      .select('name')
      .eq('id', match.target_id)
      .single();

    const responderName = responder?.name ?? 'Bir emlakçı';
    const isAccepted = match.status === 'ACCEPTED';

    const title = isAccepted
      ? `${responderName} talebinizi kabul etti!`
      : `Eşleşme talebi reddedildi`;
    const body = isAccepted
      ? `Artık iletişim bilgilerini görüntüleyebilir ve doğrudan iletişime geçebilirsiniz.`
      : `${responderName} eşleşme talebinizi reddetti. Diğer ilanları incelemeye devam edebilirsiniz.`;

    // Bildirim kaydini her zaman yaz (token olmasa bile)
    await supabase.from('notifications').insert({
      user_id: match.requester_id,
      title,
      body,
      type: isAccepted ? 'match_accepted' : 'match_rejected',
      reference_id: match.id,
      status: 'sent',
    });

    // Talep edenin push token'larini al (bildirim requester'a gider)
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', match.requester_id);

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Notification saved, no push tokens' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
