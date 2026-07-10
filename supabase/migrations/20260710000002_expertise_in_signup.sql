-- Kayıt sırasında expertise alanlarını metadata'dan oku
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _districts text[];
  _raw_districts text;
BEGIN
  -- metadata'dan expertise_districts JSON string'ini oku ve text array'e çevir
  _raw_districts := NEW.raw_user_meta_data->>'expertise_districts';
  IF _raw_districts IS NOT NULL AND _raw_districts != '' THEN
    SELECT array_agg(elem::text)
    INTO _districts
    FROM jsonb_array_elements_text(_raw_districts::jsonb) AS elem;
  ELSE
    _districts := '{}';
  END IF;

  INSERT INTO public.users (auth_id, email, phone, name, company_name, expertise_city, expertise_districts)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'company_name',
    COALESCE(NEW.raw_user_meta_data->>'expertise_city', 'İstanbul'),
    _districts
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
