// Supabase Edge Function: delete-account
// Kullanıcı hesabını ve tüm ilişkili verileri siler.
// Apple App Store ve Google Play Store zorunluluğu.
//
// Çağrılır: Uygulama içinden supabase.functions.invoke('delete-account')
// JWT token ile kimlik doğrulama yapılır.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    // JWT'den kullanıcı ID'sini al
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Yetkilendirme gerekli' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Kullanıcının JWT'sini doğrula
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz oturum' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    // Service role client ile verileri sil
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Kullanıcının users tablosundaki ID'sini bul
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', userId)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Kullanıcı profili bulunamadı' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const profileId = profile.id;

    // 2. İlişkili verileri sil/güncelle
    // İlanları DELETED yap
    await supabase
      .from('listings')
      .update({ status: 'DELETED' })
      .eq('agent_id', profileId);

    // Talepleri DELETED yap
    await supabase
      .from('buyer_demands')
      .update({ status: 'DELETED' })
      .eq('agent_id', profileId);

    // Push token'ları sil
    await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', profileId);

    // Bildirimleri sil
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', profileId);

    // Eşleşmeleri sil (hem requester hem target olarak)
    await supabase
      .from('matches')
      .delete()
      .or(`requester_id.eq.${profileId},target_id.eq.${profileId}`);

    // 3. Users tablosundan profili sil
    await supabase
      .from('users')
      .delete()
      .eq('id', profileId);

    // 4. Storage'dan avatar'ı sil
    await supabase.storage
      .from('avatars')
      .remove([`${userId}/avatar.jpg`, `${userId}/avatar.jpeg`, `${userId}/avatar.png`]);

    // 5. Auth kullanıcısını sil
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('Auth user delete error:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Hesap silinirken hata oluştu' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Hesap başarıyla silindi' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Delete account error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
