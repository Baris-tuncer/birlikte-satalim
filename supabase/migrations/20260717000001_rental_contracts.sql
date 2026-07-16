-- Kira kontratı tablosu
CREATE TABLE IF NOT EXISTS rental_contracts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id        UUID REFERENCES listings(id) ON DELETE SET NULL,

  -- Kiraya veren
  landlord_name     TEXT NOT NULL,
  landlord_tc       TEXT NOT NULL,
  landlord_address  TEXT,
  landlord_phone    TEXT,

  -- Kiracı
  tenant_name       TEXT NOT NULL,
  tenant_tc         TEXT NOT NULL,
  tenant_address    TEXT,
  tenant_phone      TEXT,

  -- Taşınmaz
  property_address  TEXT NOT NULL,
  property_type     TEXT,
  room_count        TEXT,
  square_meters     TEXT,

  -- Kira koşulları
  rent_amount       TEXT NOT NULL,
  deposit_amount    TEXT,
  payment_day       TEXT NOT NULL,
  start_date        TEXT NOT NULL,
  end_date          TEXT NOT NULL,
  increase_rate     TEXT,

  -- Ek bilgiler
  aidat_amount      TEXT,
  aidat_payer       TEXT,
  special_terms     TEXT,

  -- Kefil
  guarantor_name    TEXT,
  guarantor_tc      TEXT,
  guarantor_phone   TEXT,

  -- Onay
  confirmation_token UUID DEFAULT gen_random_uuid() NOT NULL,
  confirmed_at      TIMESTAMPTZ,

  -- Meta
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_rental_contracts_agent ON rental_contracts (agent_id);
CREATE INDEX idx_rental_contracts_created ON rental_contracts (created_at DESC);
CREATE UNIQUE INDEX idx_rental_contracts_token ON rental_contracts (confirmation_token);

-- updated_at trigger
CREATE TRIGGER update_rental_contracts_updated_at
  BEFORE UPDATE ON rental_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE rental_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rental contracts" ON rental_contracts
  FOR SELECT TO authenticated
  USING (agent_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own rental contracts" ON rental_contracts
  FOR INSERT TO authenticated
  WITH CHECK (agent_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own rental contracts" ON rental_contracts
  FOR UPDATE TO authenticated
  USING (agent_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own rental contracts" ON rental_contracts
  FOR DELETE TO authenticated
  USING (agent_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Public RPC: Kontratı görüntüle (token ile, TC maskeli)
CREATE OR REPLACE FUNCTION get_rental_contract_by_token(p_token UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'id', id,
    'agent_name', (SELECT name FROM users WHERE id = rc.agent_id),
    'agent_company', (SELECT company_name FROM users WHERE id = rc.agent_id),
    'agent_license', (SELECT license_number FROM users WHERE id = rc.agent_id),
    'agent_phone', (SELECT phone FROM users WHERE id = rc.agent_id),
    'landlord_name', landlord_name,
    'landlord_tc_masked', '***' || RIGHT(landlord_tc, 4),
    'landlord_address', landlord_address,
    'landlord_phone', landlord_phone,
    'tenant_name', tenant_name,
    'tenant_tc_masked', '***' || RIGHT(tenant_tc, 4),
    'tenant_address', tenant_address,
    'tenant_phone', tenant_phone,
    'property_address', property_address,
    'property_type', property_type,
    'room_count', room_count,
    'square_meters', square_meters,
    'rent_amount', rent_amount,
    'deposit_amount', deposit_amount,
    'payment_day', payment_day,
    'start_date', start_date,
    'end_date', end_date,
    'increase_rate', increase_rate,
    'aidat_amount', aidat_amount,
    'aidat_payer', aidat_payer,
    'special_terms', special_terms,
    'guarantor_name', guarantor_name,
    'guarantor_tc_masked', CASE WHEN guarantor_tc IS NOT NULL THEN '***' || RIGHT(guarantor_tc, 4) ELSE NULL END,
    'guarantor_phone', guarantor_phone,
    'confirmed_at', confirmed_at,
    'created_at', created_at
  )
  FROM rental_contracts rc
  WHERE confirmation_token = p_token;
$$ LANGUAGE sql SECURITY DEFINER;

-- Public RPC: Kontratı onayla (token ile)
CREATE OR REPLACE FUNCTION confirm_rental_contract(p_token UUID)
RETURNS JSON AS $$
  UPDATE rental_contracts
  SET confirmed_at = now()
  WHERE confirmation_token = p_token
    AND confirmed_at IS NULL
  RETURNING json_build_object('success', true, 'confirmed_at', confirmed_at);
$$ LANGUAGE sql SECURITY DEFINER;
