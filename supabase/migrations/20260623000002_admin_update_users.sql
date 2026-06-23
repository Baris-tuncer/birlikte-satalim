-- Admin kullanıcıların diğer kullanıcıların profillerini güncellemesine izin ver
-- (lisans onayı vb. için gerekli)

CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND is_admin = true
    )
  );
