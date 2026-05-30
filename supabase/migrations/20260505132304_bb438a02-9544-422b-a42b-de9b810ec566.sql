
-- AI Tenant Referencing
CREATE TABLE public.tenant_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_user_id uuid NOT NULL,
  listing_id uuid,
  property_address text,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text,
  applicant_dob date,
  address_history jsonb DEFAULT '[]'::jsonb,
  employment_status text,
  annual_income integer,
  proposed_rent integer,
  status text NOT NULL DEFAULT 'pending',
  -- AI report
  risk_score integer,
  recommendation text,
  credit_score integer,
  affordability_ratio numeric,
  fraud_flag boolean DEFAULT false,
  aml_flag boolean DEFAULT false,
  sanctions_flag boolean DEFAULT false,
  right_to_rent_status text,
  income_verified boolean DEFAULT false,
  red_flags jsonb DEFAULT '[]'::jsonb,
  positives jsonb DEFAULT '[]'::jsonb,
  report_json jsonb,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords manage own references" ON public.tenant_references
  FOR ALL TO authenticated
  USING (landlord_user_id = auth.uid())
  WITH CHECK (landlord_user_id = auth.uid());

CREATE POLICY "Service role manages references" ON public.tenant_references
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER update_tenant_references_updated_at
  BEFORE UPDATE ON public.tenant_references
  FOR EACH ROW EXECUTE FUNCTION public.update_ai_conversations_updated_at();

-- Rent Collection setup
CREATE TABLE public.rent_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_user_id uuid NOT NULL,
  listing_id uuid,
  reference_id uuid,
  property_address text NOT NULL,
  tenant_name text NOT NULL,
  tenant_email text NOT NULL,
  monthly_rent integer NOT NULL,
  frequency text NOT NULL DEFAULT 'monthly',
  collection_day integer NOT NULL DEFAULT 1,
  start_date date NOT NULL,
  end_date date,
  payment_method text NOT NULL DEFAULT 'standing_order',
  bank_account_last4 text,
  status text NOT NULL DEFAULT 'active',
  next_payment_date date,
  total_collected integer NOT NULL DEFAULT 0,
  arrears_amount integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rent_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords manage own collections" ON public.rent_collections
  FOR ALL TO authenticated
  USING (landlord_user_id = auth.uid())
  WITH CHECK (landlord_user_id = auth.uid());

CREATE POLICY "Service role manages collections" ON public.rent_collections
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER update_rent_collections_updated_at
  BEFORE UPDATE ON public.rent_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_ai_conversations_updated_at();

-- Individual payments / ledger
CREATE TABLE public.rent_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.rent_collections(id) ON DELETE CASCADE,
  landlord_user_id uuid NOT NULL,
  due_date date NOT NULL,
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  paid_at timestamptz,
  paid_amount integer,
  late_days integer DEFAULT 0,
  chase_count integer DEFAULT 0,
  last_chased_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords manage own payments" ON public.rent_payments
  FOR ALL TO authenticated
  USING (landlord_user_id = auth.uid())
  WITH CHECK (landlord_user_id = auth.uid());

CREATE POLICY "Service role manages payments" ON public.rent_payments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_rent_payments_collection ON public.rent_payments(collection_id);
CREATE INDEX idx_tenant_references_landlord ON public.tenant_references(landlord_user_id);
CREATE INDEX idx_rent_collections_landlord ON public.rent_collections(landlord_user_id);
