-- Abonelik sistemi için users tablosuna alanlar ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial';
-- Değerler: 'trial', 'active', 'expired'

ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- Mevcut kullanıcılar için: kayıt tarihi + 90 gün
UPDATE users SET trial_ends_at = created_at + interval '90 days' WHERE trial_ends_at IS NULL;

-- Yeni kullanıcılar için trigger: otomatik trial_ends_at ata
CREATE OR REPLACE FUNCTION set_trial_ends_at()
RETURNS trigger AS $$
BEGIN
  IF NEW.trial_ends_at IS NULL THEN
    NEW.trial_ends_at := NEW.created_at + interval '90 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_trial_ends_at ON users;
CREATE TRIGGER trg_set_trial_ends_at
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_trial_ends_at();
