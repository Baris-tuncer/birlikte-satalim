// Supabase Edge Function: revenuecat-webhook
// RevenueCat server-to-server webhook — abonelik durumu değişikliklerini yakalar.
//
// Kurulum:
// 1. RevenueCat Dashboard → Project → Integrations → Webhooks
// 2. URL: https://YOUR-PROJECT.supabase.co/functions/v1/revenuecat-webhook
// 3. Authorization header: Bearer <REVENUECAT_WEBHOOK_SECRET>
// 4. Secret ayarla:
//    supabase secrets set REVENUECAT_WEBHOOK_SECRET=your-webhook-secret

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RevenueCatEvent {
  type: string;
  app_user_id: string;
  expiration_at_ms?: number;
  product_id?: string;
  entitlement_ids?: string[];
}

interface WebhookBody {
  api_version: string;
  event: RevenueCatEvent;
}

Deno.serve(async (req) => {
  try {
    // Webhook secret doğrulama
    const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
    if (webhookSecret) {
      const authHeader = req.headers.get('authorization');
      if (authHeader !== `Bearer ${webhookSecret}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const body: WebhookBody = await req.json();
    const event = body.event;
    const userId = event.app_user_id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'No user ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let newStatus: string | null = null;

    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION':
      case 'PRODUCT_CHANGE':
        newStatus = 'active';
        break;

      case 'CANCELLATION':
      case 'EXPIRATION':
      case 'BILLING_ISSUE':
        newStatus = 'expired';
        break;

      case 'SUBSCRIBER_ALIAS':
      case 'TRANSFER':
        // Kullanıcı birleştirme — güncelleme gerekmez
        break;

      default:
        // Bilinmeyen event tipi — logla ama hata döndürme
        console.log(`Unknown RevenueCat event type: ${event.type}`);
        break;
    }

    if (newStatus) {
      const { error } = await supabase
        .from('users')
        .update({ subscription_status: newStatus })
        .eq('id', userId);

      if (error) {
        console.error(`Failed to update user ${userId}:`, error);
        return new Response(
          JSON.stringify({ error: 'Database update failed' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, event_type: event.type, new_status: newStatus }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
