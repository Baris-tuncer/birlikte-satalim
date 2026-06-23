-- License approval push notification trigger
-- Kullanicinin license_status'u pending → approved oldugunda push bildirim gonderir

CREATE OR REPLACE FUNCTION notify_license_approved()
RETURNS trigger AS $$
DECLARE
  _url text := 'https://rjhhrcoorayrqwotfqbc.supabase.co/functions/v1/license-approved-push';
BEGIN
  -- Sadece license_status degisikligi
  IF OLD.license_status IS NOT DISTINCT FROM NEW.license_status THEN
    RETURN NEW;
  END IF;

  -- Sadece pending → approved gecisi
  IF OLD.license_status != 'pending' OR NEW.license_status != 'approved' THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := _url,
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaGhyY29vcmF5cnF3b3RmcWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgwNTE2OCwiZXhwIjoyMDk3MzgxMTY4fQ.CbDZBYt_EZ3cwQA0ufDqJbSwRM-XvXtwnYDZeUKi820"}'::jsonb,
    body := jsonb_build_object(
      'type', 'UPDATE',
      'table', 'users',
      'record', row_to_json(NEW)::jsonb,
      'old_record', row_to_json(OLD)::jsonb
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_license_approved ON users;
CREATE TRIGGER on_license_approved
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_license_approved();
