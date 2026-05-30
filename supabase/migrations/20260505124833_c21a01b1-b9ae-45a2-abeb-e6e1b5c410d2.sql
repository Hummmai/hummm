
-- Add listing intent + live status counters to property_listings
ALTER TABLE public.property_listings
  ADD COLUMN IF NOT EXISTS listing_intent text NOT NULL DEFAULT 'sale',
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS strategy jsonb,
  ADD COLUMN IF NOT EXISTS listing_copy text,
  ADD COLUMN IF NOT EXISTS enquiries_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS viewings_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS offers_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS live_status text NOT NULL DEFAULT 'draft';

-- Allow authenticated users to manage their own listings via user_id
DROP POLICY IF EXISTS "Users can insert own listings" ON public.property_listings;
CREATE POLICY "Users can insert own listings"
  ON public.property_listings FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can read own listings by uid" ON public.property_listings;
CREATE POLICY "Users can read own listings by uid"
  ON public.property_listings FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR email = auth_user_email());

DROP POLICY IF EXISTS "Users can update own listings" ON public.property_listings;
CREATE POLICY "Users can update own listings"
  ON public.property_listings FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
