-- Dashboard'da oluşturulmuş duplicate webhook trigger'larını kaldır.
-- pg_net trigger'larımız (migrations ile oluşturulan) zaten yeterli.
-- Dashboard webhook'ları aynı event'leri tekrar tetikleyerek çift bildirim gönderiyor.

DO $$
DECLARE
  _trig RECORD;
  _known_triggers text[] := ARRAY[
    -- pg_net bildirim trigger'ları
    'on_match_insert',
    'on_match_update',
    'on_listing_insert',
    'on_demand_insert',
    'on_license_approved',
    -- updated_at trigger'ları
    'update_users_updated_at',
    'update_listings_updated_at',
    'update_demands_updated_at',
    -- auth trigger
    'on_auth_user_created',
    -- app_config trigger
    'update_app_config_updated_at'
  ];
BEGIN
  -- matches tablosundaki fazla trigger'ları kaldır
  FOR _trig IN
    SELECT tgname FROM pg_trigger
    WHERE tgrelid = 'public.matches'::regclass
    AND NOT tgisinternal
    AND tgname != ALL(_known_triggers)
  LOOP
    RAISE NOTICE 'Dropping duplicate trigger on matches: %', _trig.tgname;
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.matches', _trig.tgname);
  END LOOP;

  -- listings tablosundaki fazla trigger'ları kaldır
  FOR _trig IN
    SELECT tgname FROM pg_trigger
    WHERE tgrelid = 'public.listings'::regclass
    AND NOT tgisinternal
    AND tgname != ALL(_known_triggers)
  LOOP
    RAISE NOTICE 'Dropping duplicate trigger on listings: %', _trig.tgname;
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.listings', _trig.tgname);
  END LOOP;

  -- buyer_demands tablosundaki fazla trigger'ları kaldır
  FOR _trig IN
    SELECT tgname FROM pg_trigger
    WHERE tgrelid = 'public.buyer_demands'::regclass
    AND NOT tgisinternal
    AND tgname != ALL(_known_triggers)
  LOOP
    RAISE NOTICE 'Dropping duplicate trigger on buyer_demands: %', _trig.tgname;
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.buyer_demands', _trig.tgname);
  END LOOP;

  -- users tablosundaki fazla trigger'ları kaldır
  FOR _trig IN
    SELECT tgname FROM pg_trigger
    WHERE tgrelid = 'public.users'::regclass
    AND NOT tgisinternal
    AND tgname != ALL(_known_triggers)
  LOOP
    RAISE NOTICE 'Dropping duplicate trigger on users: %', _trig.tgname;
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.users', _trig.tgname);
  END LOOP;
END;
$$;

-- Dashboard hook kayıtlarını temizle (tablo varsa)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'supabase_functions' AND table_name = 'hooks'
  ) THEN
    EXECUTE 'DELETE FROM supabase_functions.hooks WHERE hook_table_id IN (
      ''public.matches''::regclass,
      ''public.listings''::regclass,
      ''public.buyer_demands''::regclass,
      ''public.users''::regclass
    )';
  END IF;
END;
$$;
