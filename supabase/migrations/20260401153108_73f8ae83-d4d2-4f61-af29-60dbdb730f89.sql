CREATE TABLE public.saved_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_url TEXT NOT NULL,
  address TEXT,
  postcode TEXT,
  asking_price INTEGER,
  currency TEXT DEFAULT 'GBP',
  humm_fair_value INTEGER,
  ai_score INTEGER,
  score_breakdown JSONB,
  bedrooms INTEGER,
  bathrooms INTEGER,
  property_type TEXT,
  images TEXT[] DEFAULT '{}'::TEXT[],
  floorplan TEXT,
  risks TEXT[] DEFAULT '{}'::TEXT[],
  opportunities TEXT[] DEFAULT '{}'::TEXT[],
  recent_sales JSONB DEFAULT '[]'::JSONB,
  renovation_suggestions JSONB DEFAULT '[]'::JSONB,
  report_json JSONB,
  status TEXT NOT NULL DEFAULT 'audited',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved audits"
  ON public.saved_audits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved audits"
  ON public.saved_audits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved audits"
  ON public.saved_audits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved audits"
  ON public.saved_audits FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages saved audits"
  ON public.saved_audits FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_saved_audits_user_id ON public.saved_audits (user_id);
CREATE INDEX idx_saved_audits_created_at ON public.saved_audits (created_at DESC);