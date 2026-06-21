-- Expertise area columns for users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS expertise_city TEXT DEFAULT 'İstanbul',
  ADD COLUMN IF NOT EXISTS expertise_districts TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS expertise_neighborhoods JSONB DEFAULT '{}';

-- GIN index for array queries
CREATE INDEX IF NOT EXISTS idx_users_expertise_districts
  ON users USING GIN (expertise_districts);
