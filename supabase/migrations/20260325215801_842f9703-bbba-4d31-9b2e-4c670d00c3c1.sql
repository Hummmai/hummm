
CREATE POLICY "Authenticated users can read own listings"
  ON public.property_listings
  FOR SELECT
  TO authenticated
  USING (email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text);
