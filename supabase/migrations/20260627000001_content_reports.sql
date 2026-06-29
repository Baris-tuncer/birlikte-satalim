-- İçerik bildirme tablosu (Apple Guideline 1.2 uyumu)
CREATE TABLE IF NOT EXISTS content_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('LISTING', 'DEMAND')),
  content_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason IN ('MISLEADING', 'INAPPROPRIATE', 'SPAM', 'OTHER')),
  description text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi bildirdikleri raporları görebilsin
CREATE POLICY "Users can view own reports" ON content_reports
  FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = reporter_id));

-- Kullanıcılar yeni rapor oluşturabilsin
CREATE POLICY "Users can create reports" ON content_reports
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = reporter_id));

-- Aynı kullanıcı aynı içeriği tekrar bildiremesin
CREATE UNIQUE INDEX idx_unique_report ON content_reports (reporter_id, content_type, content_id);
