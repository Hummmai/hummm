CREATE TABLE public.waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  interests text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert waitlist signups"
  ON public.waitlist_signups
  FOR INSERT
  TO anon
  WITH CHECK (
    email IS NOT NULL AND email <> '' AND
    full_name IS NOT NULL AND full_name <> ''
  );

CREATE POLICY "Service role manages waitlist"
  ON public.waitlist_signups
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);