
-- Create a security definer function to get the current user's email
CREATE OR REPLACE FUNCTION public.auth_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;

-- Drop and recreate the broken RLS policies on ai_valuations
DROP POLICY IF EXISTS "Users can read own valuations" ON public.ai_valuations;
CREATE POLICY "Users can read own valuations"
  ON public.ai_valuations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR email = public.auth_user_email());

DROP POLICY IF EXISTS "Users can update own valuations" ON public.ai_valuations;
CREATE POLICY "Users can update own valuations"
  ON public.ai_valuations FOR UPDATE
  TO authenticated
  USING (email = public.auth_user_email())
  WITH CHECK (email = public.auth_user_email());

-- Fix same issue on property_listings
DROP POLICY IF EXISTS "Authenticated users can read own listings" ON public.property_listings;
CREATE POLICY "Authenticated users can read own listings"
  ON public.property_listings FOR SELECT
  TO authenticated
  USING (email = public.auth_user_email());
