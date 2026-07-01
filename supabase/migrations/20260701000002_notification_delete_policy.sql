-- Kullanıcıların kendi bildirimlerini silmesine izin ver
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
