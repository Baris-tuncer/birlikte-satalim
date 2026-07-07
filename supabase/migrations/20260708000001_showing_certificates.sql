-- Yer Gösterme Belgesi (Property Showing Certificate)
CREATE TABLE IF NOT EXISTS showing_certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Müşteri bilgileri
  client_name     TEXT NOT NULL,
  client_tc       TEXT NOT NULL,
  client_phone    TEXT,

  -- Taşınmaz bilgileri
  city            TEXT NOT NULL,
  district        TEXT NOT NULL,
  neighborhood    TEXT,
  address_detail  TEXT,
  property_type   property_type NOT NULL,
  transaction_type transaction_type NOT NULL,
  ada             TEXT,
  parsel          TEXT,

  -- Gösterim bilgileri
  showing_date    DATE NOT NULL,
  showing_time    TEXT,

  -- Notlar
  notes           TEXT,

  -- Meta
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_certificates_agent ON showing_certificates (agent_id);
CREATE INDEX idx_certificates_date ON showing_certificates (showing_date DESC);

-- updated_at trigger (mevcut fonksiyonu kullan)
CREATE TRIGGER update_certificates_updated_at
  BEFORE UPDATE ON showing_certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE showing_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates" ON showing_certificates
  FOR SELECT TO authenticated
  USING (agent_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own certificates" ON showing_certificates
  FOR INSERT TO authenticated
  WITH CHECK (agent_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own certificates" ON showing_certificates
  FOR UPDATE TO authenticated
  USING (agent_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own certificates" ON showing_certificates
  FOR DELETE TO authenticated
  USING (agent_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
