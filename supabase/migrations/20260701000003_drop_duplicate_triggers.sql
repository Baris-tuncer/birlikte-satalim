-- Eski auto-match trigger'ları kaldır (20260619000002 migration'ından kalan)
-- Bu trigger'lar 20260620000004'teki yeni trigger'larla aynı işi yapıyor
-- ve her INSERT'te auto-match-notify'ın 2 kere çağrılmasına neden oluyor.

DROP TRIGGER IF EXISTS on_listing_created_auto_match ON listings;
DROP TRIGGER IF EXISTS on_demand_created_auto_match ON buyer_demands;

-- Eski fonksiyonları da kaldır (artık kullanılmıyor)
DROP FUNCTION IF EXISTS notify_auto_match_listing();
DROP FUNCTION IF EXISTS notify_auto_match_demand();
