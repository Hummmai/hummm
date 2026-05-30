CREATE TABLE public.saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  postcode text NOT NULL,
  radius_miles integer NOT NULL DEFAULT 5,
  listing_type text NOT NULL DEFAULT 'sale',
  min_price integer,
  max_price integer,
  bedrooms integer,
  property_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  label text
);

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own searches"
  ON public.saved_searches FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own searches"
  ON public.saved_searches FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own searches"
  ON public.saved_searches FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role manages saved searches"
  ON public.saved_searches FOR ALL TO service_role
  USING (true) WITH CHECK (true);