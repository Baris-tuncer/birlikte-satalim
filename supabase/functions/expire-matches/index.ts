// Supabase Edge Function: expire-matches
// 30 günden eski PENDING eşleşmeleri otomatik EXPIRED yapar.
// Supabase Dashboard → Database → Extensions → pg_cron veya harici cron ile tetiklenir.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (_req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('matches')
      .update({ status: 'EXPIRED' })
      .eq('status', 'PENDING')
      .lt('created_at', thirtyDaysAgo.toISOString())
      .select('id');

    if (error) {
      console.error('Expire matches error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const expiredCount = data?.length ?? 0;
    console.log(`Expired ${expiredCount} pending matches`);

    return new Response(
      JSON.stringify({ success: true, expired: expiredCount }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Expire matches error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
