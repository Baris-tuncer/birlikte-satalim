-- Webhook: matches INSERT -> send-push Edge Function
CREATE OR REPLACE FUNCTION notify_new_match()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://rjhhrcoorayrqwotfqbc.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'record', row_to_json(NEW),
      'type', 'INSERT',
      'table', 'matches'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_match_created
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_match();

-- Webhook: matches UPDATE -> match-response-push Edge Function
CREATE OR REPLACE FUNCTION notify_match_response()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'PENDING' AND NEW.status IN ('ACCEPTED', 'REJECTED') THEN
    PERFORM net.http_post(
      url := 'https://rjhhrcoorayrqwotfqbc.supabase.co/functions/v1/match-response-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW),
        'old_record', row_to_json(OLD),
        'type', 'UPDATE',
        'table', 'matches'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_match_response
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_match_response();
