-- Engelli email adresleri tablosu
CREATE TABLE IF NOT EXISTS blocked_emails (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blocked_emails ENABLE ROW LEVEL SECURITY;

-- Anon kullanıcılar okuyabilsin (kayıt/giriş kontrolü için)
CREATE POLICY "Anon can read blocked_emails" ON blocked_emails
  FOR SELECT USING (true);

-- İlk engelli email
INSERT INTO blocked_emails (email, reason)
VALUES ('ethaneast2022@gmail.com', 'Yetkisiz erişim - kapalı test döneminde');
