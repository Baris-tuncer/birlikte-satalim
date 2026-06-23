-- pg_cron etkinlestir
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- PENDING eşleşmeleri 30 gün sonra otomatik EXPIRED yap
-- Her gece 03:00 (UTC) çalışır
SELECT cron.schedule(
  'expire-pending-matches',
  '0 3 * * *',
  $$UPDATE matches SET status = 'EXPIRED' WHERE status = 'PENDING' AND created_at < now() - interval '30 days'$$
);
