-- Listings ve buyer_demands tablolarina city kolonu ekle
ALTER TABLE listings ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'İstanbul' NOT NULL;
ALTER TABLE buyer_demands ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'İstanbul' NOT NULL;

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings (city);
CREATE INDEX IF NOT EXISTS idx_demands_city ON buyer_demands (city);
