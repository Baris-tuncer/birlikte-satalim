-- ═══════════════════════════════════════════════════════
-- App Config — Uygulama ayarlari (oranlar, limitler vb.)
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS app_config (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_by  UUID REFERENCES users(id) ON DELETE SET NULL
);

-- updated_at otomatik guncelleme (mevcut fonksiyon)
CREATE TRIGGER update_app_config_updated_at
  BEFORE UPDATE ON app_config FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── RLS ──────────────────────────────────────────────
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "config_select" ON app_config
  FOR SELECT TO authenticated USING (true);

-- Sadece adminler guncelleyebilir
CREATE POLICY "config_update" ON app_config
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "config_insert" ON app_config
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = true)
  );

-- ─── Varsayilan veriler ────────────────────────────────
INSERT INTO app_config (key, value, description) VALUES
  (
    'tapu_harci',
    '{"alici_oran": 0.02, "satici_oran": 0.02, "doner_sermaye": 3500}'::jsonb,
    'Tapu harci oranlari ve doner sermaye bedeli (TL)'
  ),
  (
    'kredi_faiz',
    '{"varsayilan_aylik_oran": 0.0279, "min_vade": 12, "max_vade": 120}'::jsonb,
    'Konut kredisi varsayilan faiz orani ve vade araligi'
  );
