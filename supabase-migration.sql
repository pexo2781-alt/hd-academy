-- HDL Supabase migration: add slot column to saves table
-- Run in Supabase Dashboard → SQL Editor

-- 1. Add slot column
ALTER TABLE public.saves
  ADD COLUMN IF NOT EXISTS slot int NOT NULL DEFAULT 1;

-- 2. Drop the single-user constraint
ALTER TABLE public.saves
  DROP CONSTRAINT IF EXISTS saves_user_id_key;

-- 3. Add compound unique constraint
ALTER TABLE public.saves
  ADD CONSTRAINT saves_user_id_slot_key UNIQUE (user_id, slot);

-- Done. RLS policies still work — no changes needed.
