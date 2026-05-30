
-- Fix inconsistent USING/WITH CHECK on valuations update policy
DROP POLICY "Users can update own valuations" ON public.ai_valuations;

CREATE POLICY "Users can update own valuations"
  ON public.ai_valuations
  FOR UPDATE
  TO authenticated
  USING (
    email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text
  )
  WITH CHECK (
    email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text
  );
