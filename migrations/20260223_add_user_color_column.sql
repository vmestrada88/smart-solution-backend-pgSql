-- Ensure User color column exists (legacy DB dumps may miss it)
-- Safe to run multiple times
DO $$
BEGIN
  IF to_regclass('public."Users"') IS NOT NULL THEN
    ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS color VARCHAR(50);
  END IF;

  IF to_regclass('public.users') IS NOT NULL THEN
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS color VARCHAR(50);
  END IF;
END $$;
