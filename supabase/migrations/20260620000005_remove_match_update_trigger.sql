-- Match UPDATE trigger'ını kaldır
-- Kabul/red bildirimi artık uygulama kodu tarafından doğrudan edge function çağrısıyla yapılıyor
-- Bu, duplicate bildirim sorununu önler

DROP TRIGGER IF EXISTS on_match_update ON matches;
DROP FUNCTION IF EXISTS notify_match_update();
