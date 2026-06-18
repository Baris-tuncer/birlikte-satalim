-- ═══════════════════════════════════════════════════════
-- Beraber Satalım — Veritabanı Şeması
-- Supabase PostgreSQL
-- ═══════════════════════════════════════════════════════

-- ─── ENUM'LAR ─────────────────────────────────────────

CREATE TYPE transaction_type AS ENUM ('SALE', 'RENT');
CREATE TYPE property_type AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'LAND');
CREATE TYPE license_status AS ENUM ('none', 'pending', 'approved', 'rejected');
CREATE TYPE listing_status AS ENUM ('ACTIVE', 'PAUSED', 'SOLD', 'RENTED', 'DELETED');
CREATE TYPE demand_status AS ENUM ('ACTIVE', 'FULFILLED', 'EXPIRED', 'DELETED');
CREATE TYPE match_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');
CREATE TYPE match_type AS ENUM ('LISTING', 'DEMAND');

-- ─── USERS ────────────────────────────────────────────

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id         UUID UNIQUE NOT NULL,  -- references auth.users.id
  email           TEXT UNIQUE,            -- E-posta adresi
  phone           TEXT,                   -- Telefon (opsiyonel)
  name            TEXT,
  company_name    TEXT,
  avatar_url      TEXT,
  license_status  license_status DEFAULT 'none' NOT NULL,
  license_image_url TEXT,
  license_number  TEXT,             -- Yetki belgesi sertifika numarasi
  license_reviewed_at TIMESTAMPTZ,
  license_reviewed_by UUID,
  is_active       BOOLEAN DEFAULT true NOT NULL,
  is_admin        BOOLEAN DEFAULT false NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- auth.users kayıt olduğunda otomatik profil oluştur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, phone, name, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'company_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ─── LISTINGS (Mülk Portföyü) ────────────────────────

CREATE TABLE listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  property_type   property_type NOT NULL,

  -- Konum (kör — açık adres yok)
  district        TEXT NOT NULL,
  neighborhood    TEXT,

  -- Mülk detayları
  room_count      TEXT,             -- "3+1", "2+0", "Stüdyo"
  net_area        INTEGER,          -- m²
  gross_area      INTEGER,          -- m²
  floor           INTEGER,
  total_floors    INTEGER,
  building_age    INTEGER,
  has_parking     BOOLEAN,
  has_elevator    BOOLEAN,
  heating_type    TEXT,

  -- Fiyat
  price           BIGINT NOT NULL,  -- TL

  -- Meta
  description     TEXT,
  status          listing_status DEFAULT 'ACTIVE' NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_listings_filter ON listings (district, property_type, transaction_type);
CREATE INDEX idx_listings_agent ON listings (agent_id);
CREATE INDEX idx_listings_status ON listings (status);

-- ─── BUYER DEMANDS (Alıcı Talep Havuzu) ──────────────

CREATE TABLE buyer_demands (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  property_type   property_type NOT NULL,

  -- Konum tercihi
  district        TEXT NOT NULL,
  neighborhoods   TEXT[] DEFAULT '{}',  -- Tercih edilen mahalleler

  -- Bütçe aralığı
  min_budget      BIGINT NOT NULL,
  max_budget      BIGINT NOT NULL,

  -- Mülk tercihleri
  min_rooms       TEXT,             -- Minimum oda: "2+1"
  min_area        INTEGER,          -- Minimum m²
  max_floor       INTEGER,          -- Maksimum kat

  -- Notlar
  notes           TEXT,

  -- Meta
  status          demand_status DEFAULT 'ACTIVE' NOT NULL,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_demands_filter ON buyer_demands (district, property_type, transaction_type);
CREATE INDEX idx_demands_agent ON buyer_demands (agent_id);
CREATE INDEX idx_demands_status ON buyer_demands (status);

-- ─── MATCHES (Eşleşmeler) ────────────────────────────

CREATE TABLE matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Neyle eşleşiyor
  match_type      match_type NOT NULL,
  listing_id      UUID REFERENCES listings(id) ON DELETE SET NULL,
  demand_id       UUID REFERENCES buyer_demands(id) ON DELETE SET NULL,

  -- Durum
  status          match_status DEFAULT 'PENDING' NOT NULL,
  message         TEXT,
  responded_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Tekrar talep engelle
  UNIQUE (requester_id, target_id, listing_id),
  UNIQUE (requester_id, target_id, demand_id)
);

CREATE INDEX idx_matches_target ON matches (target_id, status);
CREATE INDEX idx_matches_requester ON matches (requester_id);

-- ─── NEIGHBORHOOD PRICES (Mahalle Fiyat Endeksi) ─────

CREATE TABLE neighborhood_prices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district        TEXT NOT NULL,
  neighborhood    TEXT NOT NULL,
  property_type   property_type NOT NULL,
  avg_price_per_sqm INTEGER NOT NULL,  -- TL/m²
  sample_size     INTEGER,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_by      UUID,

  UNIQUE (district, neighborhood, property_type)
);

-- ─── UPDATED_AT OTOMATİK GÜNCELLEME ──────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_demands_updated_at
  BEFORE UPDATE ON buyer_demands FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── PILOT VERİ: Kadıköy Mahalle Fiyatları ───────────

INSERT INTO neighborhood_prices (district, neighborhood, property_type, avg_price_per_sqm, sample_size) VALUES
  ('Kadıköy', 'Caferağa',      'RESIDENTIAL', 95000,  45),
  ('Kadıköy', 'Moda',          'RESIDENTIAL', 110000, 38),
  ('Kadıköy', 'Fenerbahçe',    'RESIDENTIAL', 105000, 52),
  ('Kadıköy', 'Göztepe',       'RESIDENTIAL', 72000,  67),
  ('Kadıköy', 'Kozyatağı',     'RESIDENTIAL', 68000,  71),
  ('Kadıköy', 'Bostancı',      'RESIDENTIAL', 78000,  43),
  ('Kadıköy', 'Suadiye',       'RESIDENTIAL', 88000,  35),
  ('Kadıköy', 'Erenköy',       'RESIDENTIAL', 75000,  48),
  ('Kadıköy', 'Caddebostan',   'RESIDENTIAL', 98000,  41),
  ('Kadıköy', 'Acıbadem',      'RESIDENTIAL', 65000,  55),
  ('Kadıköy', 'Fikirtepe',     'RESIDENTIAL', 55000,  62),
  ('Kadıköy', 'Caferağa',      'COMMERCIAL',  120000, 12),
  ('Kadıköy', 'Moda',          'COMMERCIAL',  135000, 8),
  ('Kadıköy', 'Kozyatağı',     'COMMERCIAL',  85000,  15),
  ('Kadıköy', 'Bostancı',      'COMMERCIAL',  92000,  10);

-- ─── RLS (Row Level Security) POLİTİKALARI ───────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_prices ENABLE ROW LEVEL SECURITY;

-- Users: Herkes onaylı kullanıcıları okuyabilir, sadece kendini güncelleyebilir
CREATE POLICY "Users are viewable by authenticated users"
  ON users FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE TO authenticated
  USING (auth_id = auth.uid());

-- Listings: Onaylı kullanıcılar görebilir, sadece kendi ilanlarını yönetebilir
CREATE POLICY "Listings are viewable by authenticated users"
  ON listings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own listings"
  ON listings FOR INSERT TO authenticated
  WITH CHECK (agent_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE TO authenticated
  USING (agent_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Buyer Demands: Aynı mantık
CREATE POLICY "Demands are viewable by authenticated users"
  ON buyer_demands FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own demands"
  ON buyer_demands FOR INSERT TO authenticated
  WITH CHECK (agent_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own demands"
  ON buyer_demands FOR UPDATE TO authenticated
  USING (agent_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Matches: Sadece taraflar görebilir
CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT TO authenticated
  USING (
    requester_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR target_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can insert match requests"
  ON matches FOR INSERT TO authenticated
  WITH CHECK (requester_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Target can update match status"
  ON matches FOR UPDATE TO authenticated
  USING (target_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Neighborhood Prices: Herkes okuyabilir
CREATE POLICY "Neighborhood prices are viewable by all"
  ON neighborhood_prices FOR SELECT TO authenticated
  USING (true);

-- ═══════════════════════════════════════════════════════
-- BİLDİRİM SİSTEMİ
-- ═══════════════════════════════════════════════════════

CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'read', 'digest');

-- ─── NOTIFICATIONS ──────────────────────────────────

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  type            TEXT NOT NULL,  -- 'new_listing', 'new_demand', 'match_update'
  reference_id    UUID,           -- listing_id veya demand_id
  status          notification_status DEFAULT 'pending' NOT NULL,
  sent_at         TIMESTAMPTZ,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_notifications_user ON notifications (user_id, status);
CREATE INDEX idx_notifications_created ON notifications (created_at);

-- ─── RATE LIMITING ──────────────────────────────────

CREATE TABLE notification_rate_limits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sent_count      INTEGER DEFAULT 0 NOT NULL,
  window_start    TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- ─── PUSH TOKENS ────────────────────────────────────

CREATE TABLE push_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token           TEXT NOT NULL,
  platform        TEXT NOT NULL,  -- 'ios', 'android'
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, token)
);

-- ─── RLS: Bildirimler ───────────────────────────────

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage own push tokens"
  ON push_tokens FOR ALL TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
