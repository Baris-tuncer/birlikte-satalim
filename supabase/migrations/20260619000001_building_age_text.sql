-- Bina yaşı alanını integer'dan text'e çevir (aralık olarak saklanacak: "6-10", "31+" vb.)
ALTER TABLE listings ALTER COLUMN building_age TYPE TEXT USING building_age::TEXT;
