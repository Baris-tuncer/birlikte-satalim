-- Admin kullanıcılar tüm şikayetleri görebilsin
CREATE POLICY "Admins can view all reports" ON content_reports
  FOR SELECT USING (
    auth.uid() IN (SELECT auth_id FROM users WHERE is_admin = true)
  );

-- Admin kullanıcılar şikayet durumunu güncelleyebilsin
CREATE POLICY "Admins can update reports" ON content_reports
  FOR UPDATE USING (
    auth.uid() IN (SELECT auth_id FROM users WHERE is_admin = true)
  );
