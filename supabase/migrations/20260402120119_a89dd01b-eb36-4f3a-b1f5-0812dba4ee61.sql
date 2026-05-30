-- Create early access invites table
CREATE TABLE public.early_access_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'tester',
  token TEXT NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  invited_by UUID NOT NULL,
  redeemed BOOLEAN NOT NULL DEFAULT false,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_early_access_email ON public.early_access_invites (email);

ALTER TABLE public.early_access_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages invites"
  ON public.early_access_invites
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Owner can read own invites"
  ON public.early_access_invites
  FOR SELECT
  TO authenticated
  USING (invited_by = auth.uid());

CREATE POLICY "Owner can insert invites"
  ON public.early_access_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Anon can read by token"
  ON public.early_access_invites
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can redeem invite"
  ON public.early_access_invites
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);