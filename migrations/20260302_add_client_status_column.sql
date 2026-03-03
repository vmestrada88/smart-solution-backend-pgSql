ALTER TABLE "Clients"
ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) NOT NULL DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'clients_status_check'
  ) THEN
    ALTER TABLE "Clients"
    ADD CONSTRAINT clients_status_check
    CHECK ("status" IN ('prospect', 'active', 'inactive'));
  END IF;
END $$;