-- 30 günden eski PENDING eşleşmeleri otomatik EXPIRED yapan cron job
-- Her gece 03:00 (UTC) çalışır

SELECT cron.schedule(
  'expire-pending-matches',
  '0 3 * * *',
  $$UPDATE matches SET status = 'EXPIRED' WHERE status = 'PENDING' AND created_at < now() - interval '30 days'$$
);
