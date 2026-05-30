
-- Cache for area-insights API responses (TfL, police.uk, gov.uk, EA flood)
CREATE TABLE IF NOT EXISTS public.area_insights_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  postcode text,
  payload jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS area_insights_cache_key_idx ON public.area_insights_cache (cache_key);
CREATE INDEX IF NOT EXISTS area_insights_cache_fetched_idx ON public.area_insights_cache (fetched_at);

ALTER TABLE public.area_insights_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages area insights cache"
  ON public.area_insights_cache FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- Anyone may read cached area insights (no PII, purely public geographic data)
CREATE POLICY "Anyone can read area insights cache"
  ON public.area_insights_cache FOR SELECT
  TO anon, authenticated USING (true);

-- Composite Hummingbird Intelligence Score persisted with each audit
ALTER TABLE public.saved_audits
  ADD COLUMN IF NOT EXISTS intelligence_score jsonb;
