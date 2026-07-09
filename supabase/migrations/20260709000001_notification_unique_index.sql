-- Aynı kullanıcıya aynı tip ve referansla birden fazla bildirim gitmesini önle.
-- Race condition: pg_net trigger aynı anda 2 HTTP request atıyor,
-- ikisi de dedup kontrolünü geçiyor ve duplike bildirim oluşuyor.
-- Bu unique index ile INSERT sırasında veritabanı seviyesinde engellenir.

CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_no_duplicate
  ON notifications (user_id, type, reference_id);
