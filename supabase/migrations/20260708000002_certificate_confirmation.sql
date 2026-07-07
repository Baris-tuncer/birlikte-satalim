-- Yer Gösterme Belgesi — Müşteri Onay Sistemi

-- Onay alanları
ALTER TABLE showing_certificates
  ADD COLUMN confirmation_token UUID DEFAULT gen_random_uuid() NOT NULL,
  ADD COLUMN confirmed_at TIMESTAMPTZ;

CREATE UNIQUE INDEX idx_certificates_token
  ON showing_certificates (confirmation_token);

-- Public RPC: Belge görüntüle (token ile, TC maskeli)
CREATE OR REPLACE FUNCTION get_certificate_by_token(p_token UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'id', id,
    'agent_name', (SELECT name FROM users WHERE id = sc.agent_id),
    'agent_company', (SELECT company_name FROM users WHERE id = sc.agent_id),
    'agent_license', (SELECT license_number FROM users WHERE id = sc.agent_id),
    'agent_phone', (SELECT phone FROM users WHERE id = sc.agent_id),
    'client_name', client_name,
    'client_tc_masked', '***' || RIGHT(client_tc, 4),
    'city', city,
    'district', district,
    'neighborhood', neighborhood,
    'address_detail', address_detail,
    'property_type', property_type,
    'transaction_type', transaction_type,
    'ada', ada,
    'parsel', parsel,
    'showing_date', showing_date,
    'showing_time', showing_time,
    'notes', notes,
    'confirmed_at', confirmed_at,
    'created_at', created_at
  )
  FROM showing_certificates sc
  WHERE confirmation_token = p_token;
$$ LANGUAGE sql SECURITY DEFINER;

-- Public RPC: Belge onayla (token ile)
CREATE OR REPLACE FUNCTION confirm_certificate(p_token UUID)
RETURNS JSON AS $$
  UPDATE showing_certificates
  SET confirmed_at = now()
  WHERE confirmation_token = p_token
    AND confirmed_at IS NULL
  RETURNING json_build_object('success', true, 'confirmed_at', confirmed_at);
$$ LANGUAGE sql SECURITY DEFINER;
