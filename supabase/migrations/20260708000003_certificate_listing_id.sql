-- Yer gösterme belgesini ilana bağla
ALTER TABLE showing_certificates
  ADD COLUMN listing_id UUID REFERENCES listings(id) ON DELETE SET NULL;

CREATE INDEX idx_certificates_listing ON showing_certificates (listing_id);
