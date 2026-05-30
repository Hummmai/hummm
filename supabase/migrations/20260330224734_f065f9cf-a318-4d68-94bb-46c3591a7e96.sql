
CREATE TABLE public.landlord_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid REFERENCES public.landlord_properties(id) ON DELETE SET NULL,
  template_type text NOT NULL DEFAULT 'apt',
  title text NOT NULL DEFAULT '',
  prescribed_clauses text NOT NULL DEFAULT '',
  special_clauses text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  tenant_name text,
  tenant_email text,
  signed_by_landlord_at timestamptz,
  signed_by_tenant_at timestamptz,
  landlord_ip text,
  tenant_ip text,
  landlord_signature text,
  tenant_signature text,
  tenant_initials text,
  pet_agreement boolean DEFAULT false,
  certificate_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.landlord_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own contracts" ON public.landlord_contracts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own contracts" ON public.landlord_contracts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own contracts" ON public.landlord_contracts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own contracts" ON public.landlord_contracts FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Service role manages contracts" ON public.landlord_contracts FOR ALL TO service_role USING (true) WITH CHECK (true);
