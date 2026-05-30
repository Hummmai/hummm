
CREATE TABLE public.uk_estate_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  address TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  notes TEXT,
  source_url TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.uk_estate_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view agents"
ON public.uk_estate_agents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role manages agents data"
ON public.uk_estate_agents FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE INDEX idx_uk_estate_agents_name ON public.uk_estate_agents (agent_name);
CREATE INDEX idx_uk_estate_agents_email ON public.uk_estate_agents (email);
