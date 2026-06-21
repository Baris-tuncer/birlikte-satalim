-- Yetki belgesi numarasını unique yap
-- Aynı belge numarasıyla birden fazla hesap oluşturulmasını engeller
-- Sadece dolu değerler kontrol edilir (NULL ve boş string hariç)

CREATE UNIQUE INDEX idx_users_license_number_unique
  ON users (license_number)
  WHERE license_number IS NOT NULL AND license_number != '';
