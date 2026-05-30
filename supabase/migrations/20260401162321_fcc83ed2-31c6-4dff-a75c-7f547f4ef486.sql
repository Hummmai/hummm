
ALTER TABLE public.saved_audits
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS key_features text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS epc_rating text,
  ADD COLUMN IF NOT EXISTS agent_name text,
  ADD COLUMN IF NOT EXISTS listed_date text,
  ADD COLUMN IF NOT EXISTS scraped_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS humm_fair_value_high integer,
  ADD COLUMN IF NOT EXISTS rental_yield_estimate numeric,
  ADD COLUMN IF NOT EXISTS sqft integer;
