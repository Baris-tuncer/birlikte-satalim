-- Avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Herkes okuyabilir
CREATE POLICY "Avatars public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Kullanıcı kendi avatar'ını yükleyebilir
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Kullanıcı kendi avatar'ını güncelleyebilir
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
