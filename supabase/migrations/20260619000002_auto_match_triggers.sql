-- Otomatik esleme bildirimi: yeni ilan veya talep olusturulunca
-- eslesen kullanicilara push bildirim gonderir.

-- Trigger fonksiyonu: listings INSERT
CREATE OR REPLACE FUNCTION notify_auto_match_listing()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://rjhhrcoorayrqwotfqbc.supabase.co/functions/v1/auto-match-notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'record', row_to_json(NEW),
      'type', 'INSERT',
      'table', 'listings'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_listing_created_auto_match
  AFTER INSERT ON listings
  FOR EACH ROW
  EXECUTE FUNCTION notify_auto_match_listing();

-- Trigger fonksiyonu: buyer_demands INSERT
CREATE OR REPLACE FUNCTION notify_auto_match_demand()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://rjhhrcoorayrqwotfqbc.supabase.co/functions/v1/auto-match-notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'record', row_to_json(NEW),
      'type', 'INSERT',
      'table', 'buyer_demands'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_demand_created_auto_match
  AFTER INSERT ON buyer_demands
  FOR EACH ROW
  EXECUTE FUNCTION notify_auto_match_demand();
