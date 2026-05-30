CREATE TABLE public.ai_valuations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  postcode TEXT,
  property_type TEXT,
  bedrooms TEXT,
  bathrooms TEXT,
  sqft TEXT,
  unique_features TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  valuation_low INTEGER,
  valuation_high INTEGER,
  confidence INTEGER,
  report_json JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_valuations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage valuations"
  ON public.ai_valuations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert valuations"
  ON public.ai_valuations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read valuations by id"
  ON public.ai_valuations
  FOR SELECT
  TO anon
  USING (true);