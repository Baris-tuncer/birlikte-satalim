-- Mock kullanıcıları işaretlemek için is_mock kolonu
ALTER TABLE users ADD COLUMN is_mock BOOLEAN DEFAULT false NOT NULL;
