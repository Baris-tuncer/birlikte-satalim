-- Talep formuna bina yaşı aralıkları ekle (multi-select)
ALTER TABLE buyer_demands ADD COLUMN IF NOT EXISTS building_ages TEXT[];
