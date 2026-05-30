ALTER TABLE public.landlord_properties
  ADD COLUMN IF NOT EXISTS tenant_name text,
  ADD COLUMN IF NOT EXISTS tenant_email text,
  ADD COLUMN IF NOT EXISTS tenancy_start_date date;