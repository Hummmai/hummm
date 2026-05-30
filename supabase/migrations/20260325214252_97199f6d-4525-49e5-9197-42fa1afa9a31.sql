
-- Create a public view excluding sensitive columns
CREATE VIEW public.property_listings_public
WITH (security_invoker = on) AS
  SELECT id, address, postcode, property_type, bedrooms, bathrooms, sqft,
         asking_price, ai_suggested_price, ai_confidence, description,
         photo_urls, status, market_rightmove, market_zoopla,
         market_social, market_virtual_tour, valuation_ref, created_at
  FROM public.property_listings;

-- Replace the open anon SELECT policy with one that denies direct table access
DROP POLICY "Anyone can read listings" ON public.property_listings;

CREATE POLICY "Anon cannot read listings directly"
  ON public.property_listings
  FOR SELECT
  TO anon
  USING (false);
