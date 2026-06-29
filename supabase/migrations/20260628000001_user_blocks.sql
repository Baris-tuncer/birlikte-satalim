-- Kullanıcı engelleme tablosu (Apple Guideline 1.2 - UGC)
CREATE TABLE IF NOT EXISTS user_blocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Index
CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);

-- RLS
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi engellemelerini görebilir
CREATE POLICY "users_view_own_blocks" ON user_blocks
  FOR SELECT USING (blocker_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Kullanıcı engelleme ekleyebilir
CREATE POLICY "users_insert_blocks" ON user_blocks
  FOR INSERT WITH CHECK (blocker_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Kullanıcı kendi engellemelerini kaldırabilir
CREATE POLICY "users_delete_own_blocks" ON user_blocks
  FOR DELETE USING (blocker_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
