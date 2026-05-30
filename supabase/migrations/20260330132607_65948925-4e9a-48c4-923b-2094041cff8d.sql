
CREATE TABLE public.negotiate_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_link text NOT NULL,
  property_address text,
  postcode text,
  goal text NOT NULL DEFAULT 'buy',
  package text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'submitted',
  ai_actions_log jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.negotiate_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own negotiations"
  ON public.negotiate_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own negotiations"
  ON public.negotiate_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own negotiations"
  ON public.negotiate_requests FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages negotiations"
  ON public.negotiate_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
