// Supabase Edge Function: license-approved-push
// Kullanicinin yetki belgesi onaylandiginda push bildirim gonderir.
// Trigger: users tablosunda license_status 'pending' → 'approved' degistiginde

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface WebhookPayload {
  type: 'UPDATE';
  table: string;
  record: {
    id: string;
    name: string;
    license_status: string;
  };
  old_record: {
    id: string;
    license_status: string;
  };
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();

    // Sadece users tablosundaki license_status degisiklikleri
    if (payload.table !== 'users' || payload.type !== 'UPDATE') {
      return new Response(JSON.stringify({ message: 'Ignored' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const oldStatus = payload.old_record?.license_status;
    const newStatus = payload.record?.license_status;

    // Sadece pending → approved gecisinde bildirim gonder
    if (oldStatus !== 'pending' || newStatus !== 'approved') {
      return new Response(JSON.stringify({ message: 'Not a license approval' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = payload.record.id;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const title = 'Yetki Belgeniz Onaylandı';
    const body = 'Tebrikler! Yetki belgeniz onaylandı, kimliğiniz doğrulandı.';

    // Bildirim kaydini yaz
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      body,
      type: 'license_approved',
      status: 'sent',
    });

    // Push token'larini al
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId);

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Notification saved, no push tokens' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Expo Push API'ye gonder
    const messages = tokens.map((t: { token: string }) => ({
      to: t.token,
      title,
      body,
      sound: 'default',
      data: { type: 'license_approved' },
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
    console.error('License approved push error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
