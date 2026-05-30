
-- Tighten anon INSERT on ai_valuations: require email and address
DROP POLICY "Anyone can insert valuations" ON public.ai_valuations;
CREATE POLICY "Anon can insert valuations with required fields"
  ON public.ai_valuations
  FOR INSERT
  TO anon
  WITH CHECK (
    email IS NOT NULL AND email <> '' AND
    address IS NOT NULL AND address <> '' AND
    status = 'pending' AND
    user_id IS NULL
  );

-- Tighten anon INSERT on property_listings: require address
DROP POLICY "Anyone can submit a listing" ON public.property_listings;
CREATE POLICY "Anon can submit listing with required fields"
  ON public.property_listings
  FOR INSERT
  TO anon
  WITH CHECK (
    address IS NOT NULL AND address <> '' AND
    status = 'pending'
  );
