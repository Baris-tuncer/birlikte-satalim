-- Database webhooks for push notifications
-- pg_net extension kullanarak edge function'ları tetikler

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ─── MATCH INSERT → send-push ────────────────────────

CREATE OR REPLACE FUNCTION notify_match_insert()
RETURNS trigger AS $$
DECLARE
  _url text := 'https://rjhhrcoorayrqwotfqbc.supabase.co/functions/v1/send-push';
  _key text := current_setting('request.jwt.claims', true)::json->>'role';
BEGIN
  PERFORM net.http_post(
    url := _url,
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaGhyY29vcmF5cnF3b3RmcWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgwNTE2OCwiZXhwIjoyMDk3MzgxMTY4fQ.CbDZBYt_EZ3cwQA0ufDqJbSwRM-XvXtwnYDZeUKi820"}'::jsonb,
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'matches',
      'record', row_to_json(NEW)::jsonb
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_match_insert ON matches;
CREATE TRIGGER on_match_insert
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_match_insert();

-- ─── MATCH UPDATE → match-response-push ──────────────

CREATE OR REPLACE FUNCTION notify_match_update()
RETURNS trigger AS $$
DECLARE
  _url text := 'https://rjhhrcoorayrqwotfqbc.supabase.co/functions/v1/match-response-push';
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := _url,
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaGhyY29vcmF5cnF3b3RmcWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgwNTE2OCwiZXhwIjoyMDk3MzgxMTY4fQ.CbDZBYt_EZ3cwQA0ufDqJbSwRM-XvXtwnYDZeUKi820"}'::jsonb,
    body := jsonb_build_object(
      'type', 'UPDATE',
      'table', 'matches',
      'record', row_to_json(NEW)::jsonb,
      'old_record', row_to_json(OLD)::jsonb
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_match_update ON matches;
CREATE TRIGGER on_match_update
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_match_update();

-- ─── LISTING INSERT → auto-match-notify ─────────────

CREATE OR REPLACE FUNCTION notify_listing_insert()
RETURNS trigger AS $$
DECLARE
  _url text := 'https://rjhhrcoorayrqwotfqbc.supabase.co/functions/v1/auto-match-notify';
BEGIN
  PERFORM net.http_post(
    url := _url,
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaGhyY29vcmF5cnF3b3RmcWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgwNTE2OCwiZXhwIjoyMDk3MzgxMTY4fQ.CbDZBYt_EZ3cwQA0ufDqJbSwRM-XvXtwnYDZeUKi820"}'::jsonb,
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'listings',
      'record', row_to_json(NEW)::jsonb
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_listing_insert ON listings;
CREATE TRIGGER on_listing_insert
  AFTER INSERT ON listings
  FOR EACH ROW
  EXECUTE FUNCTION notify_listing_insert();

-- ─── DEMAND INSERT → auto-match-notify ──────────────

CREATE OR REPLACE FUNCTION notify_demand_insert()
RETURNS trigger AS $$
DECLARE
  _url text := 'https://rjhhrcoorayrqwotfqbc.supabase.co/functions/v1/auto-match-notify';
BEGIN
  PERFORM net.http_post(
    url := _url,
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaGhyY29vcmF5cnF3b3RmcWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgwNTE2OCwiZXhwIjoyMDk3MzgxMTY4fQ.CbDZBYt_EZ3cwQA0ufDqJbSwRM-XvXtwnYDZeUKi820"}'::jsonb,
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'buyer_demands',
      'record', row_to_json(NEW)::jsonb
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_demand_insert ON buyer_demands;
CREATE TRIGGER on_demand_insert
  AFTER INSERT ON buyer_demands
  FOR EACH ROW
  EXECUTE FUNCTION notify_demand_insert();
