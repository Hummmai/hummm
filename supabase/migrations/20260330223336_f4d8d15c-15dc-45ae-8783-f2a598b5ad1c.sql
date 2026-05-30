
-- Landlord properties portfolio table
CREATE TABLE public.landlord_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  address text NOT NULL,
  postcode text,
  property_type text DEFAULT 'house',
  bedrooms integer DEFAULT 2,
  current_rent integer,
  ai_market_rent integer,
  epc_rating text DEFAULT 'D',
  epc_expiry date,
  gas_cert_valid boolean DEFAULT false,
  gas_cert_expiry date,
  electrical_cert_valid boolean DEFAULT false,
  electrical_cert_expiry date,
  tenancy_type text DEFAULT 'fixed' CHECK (tenancy_type IN ('fixed','periodic','vacant')),
  tenancy_end_date date,
  decent_homes_compliant boolean DEFAULT true,
  written_statement_served boolean DEFAULT false,
  compliance_status text DEFAULT 'amber' CHECK (compliance_status IN ('green','amber','red')),
  last_rent_increase date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.landlord_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own properties" ON public.landlord_properties
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own properties" ON public.landlord_properties
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own properties" ON public.landlord_properties
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own properties" ON public.landlord_properties
  FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Service role manages landlord properties" ON public.landlord_properties
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Tenant requests (pet, repair, etc.)
CREATE TABLE public.tenant_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_user_id uuid NOT NULL,
  property_id uuid REFERENCES public.landlord_properties(id) ON DELETE CASCADE NOT NULL,
  request_type text NOT NULL DEFAULT 'pet' CHECK (request_type IN ('pet','repair','other')),
  tenant_name text,
  tenant_email text,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','in_progress')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  deadline_at timestamptz NOT NULL DEFAULT (now() + interval '28 days'),
  responded_at timestamptz,
  response_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tenant requests" ON public.tenant_requests
  FOR SELECT TO authenticated USING (landlord_user_id = auth.uid());
CREATE POLICY "Users can insert own tenant requests" ON public.tenant_requests
  FOR INSERT TO authenticated WITH CHECK (landlord_user_id = auth.uid());
CREATE POLICY "Users can update own tenant requests" ON public.tenant_requests
  FOR UPDATE TO authenticated USING (landlord_user_id = auth.uid()) WITH CHECK (landlord_user_id = auth.uid());
CREATE POLICY "Service role manages tenant requests" ON public.tenant_requests
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Landlord document vault
CREATE TABLE public.landlord_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid REFERENCES public.landlord_properties(id) ON DELETE CASCADE,
  document_type text NOT NULL DEFAULT 'other',
  file_name text NOT NULL,
  file_url text NOT NULL,
  expires_at date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.landlord_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own documents" ON public.landlord_documents
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own documents" ON public.landlord_documents
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own documents" ON public.landlord_documents
  FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Service role manages landlord documents" ON public.landlord_documents
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Storage bucket for landlord documents
INSERT INTO storage.buckets (id, name, public) VALUES ('landlord-documents', 'landlord-documents', false);

CREATE POLICY "Users can upload own landlord docs" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'landlord-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can read own landlord docs" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'landlord-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own landlord docs" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'landlord-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
