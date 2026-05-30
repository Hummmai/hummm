
-- Mortgage leads table
CREATE TABLE public.mortgage_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text,
  email text NOT NULL,
  phone text,
  property_address text,
  postcode text,
  has_dip boolean DEFAULT false,
  dip_file_url text,
  deposit_amount integer,
  property_price integer,
  term_years integer DEFAULT 25,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mortgage_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own mortgage leads"
  ON public.mortgage_leads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own mortgage leads"
  ON public.mortgage_leads FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own mortgage leads"
  ON public.mortgage_leads FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages mortgage leads"
  ON public.mortgage_leads FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Storage bucket for DIP uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('dip-documents', 'dip-documents', false);

-- DIP storage policies
CREATE POLICY "Users can upload own DIP"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dip-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read own DIP"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'dip-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
