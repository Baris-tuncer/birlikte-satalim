-- Kentsel Dönüşüm mülk tipi ve ada/parsel alanları

-- 1. property_type enum'a URBAN_RENEWAL ekle
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'URBAN_RENEWAL';

-- 2. listings tablosuna ada ve parsel kolonları ekle
ALTER TABLE listings ADD COLUMN IF NOT EXISTS ada TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS parsel TEXT;
