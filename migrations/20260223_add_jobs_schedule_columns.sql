-- Ensure legacy Jobs table includes scheduling columns expected by current backend
-- Safe to run multiple times
ALTER TABLE public."Jobs" ADD COLUMN IF NOT EXISTS "startTime" TIMESTAMPTZ;
ALTER TABLE public."Jobs" ADD COLUMN IF NOT EXISTS "endTime" TIMESTAMPTZ;
ALTER TABLE public."Jobs" ADD COLUMN IF NOT EXISTS "assignedTo" INTEGER[];
ALTER TABLE public."Jobs" ADD COLUMN IF NOT EXISTS "status" VARCHAR(32) DEFAULT 'scheduled';

UPDATE public."Jobs"
SET "startTime" = COALESCE("startTime", date),
    "endTime" = COALESCE("endTime", date),
    "status" = COALESCE("status", 'scheduled');
