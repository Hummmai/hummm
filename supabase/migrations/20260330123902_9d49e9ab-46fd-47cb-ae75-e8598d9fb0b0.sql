
-- Create AML checks table
CREATE TABLE public.aml_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.property_listings(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  address text NOT NULL,
  postcode text,
  document_type text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  notes text
);

ALTER TABLE public.aml_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert aml checks"
  ON public.aml_checks
  FOR INSERT
  TO anon
  WITH CHECK (status = 'pending');

CREATE POLICY "Service role manages aml checks"
  ON public.aml_checks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add aml_status column to property_listings
ALTER TABLE public.property_listings
  ADD COLUMN IF NOT EXISTS aml_status text DEFAULT 'not_started';
