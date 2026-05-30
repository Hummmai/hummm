
CREATE TABLE public.early_access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  access_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.early_access_requests ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role manages requests"
  ON public.early_access_requests FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Authenticated owner can read all requests
CREATE POLICY "Owner can read all requests"
  ON public.early_access_requests FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'rpe976@gmail.com');

-- Owner can update (approve/reject)
CREATE POLICY "Owner can update requests"
  ON public.early_access_requests FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'rpe976@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'rpe976@gmail.com');

-- Owner can insert
CREATE POLICY "Owner can insert requests"
  ON public.early_access_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'rpe976@gmail.com');

-- Owner can delete
CREATE POLICY "Owner can delete requests"
  ON public.early_access_requests FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'rpe976@gmail.com');

-- Anon can look up by access code (for code redemption)
CREATE POLICY "Anon can read by access code"
  ON public.early_access_requests FOR SELECT
  TO anon
  USING (access_code IS NOT NULL AND status = 'approved');

-- Anon can also read by access code when authenticated
CREATE POLICY "Authenticated can read by access code"
  ON public.early_access_requests FOR SELECT
  TO authenticated
  USING (access_code IS NOT NULL AND status = 'approved');
