
-- Funnel events
CREATE TABLE public.revenue_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'valuation_completed','deep_audit_completed','negotiate_viewed',
    'negotiate_started','negotiate_purchased','pro_subscribed'
  )),
  property_address TEXT,
  property_price INTEGER,
  fair_value INTEGER,
  source TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX revenue_events_email_created_idx ON public.revenue_events (email, created_at DESC);
CREATE INDEX revenue_events_user_idx ON public.revenue_events (user_id, created_at DESC);
CREATE INDEX revenue_events_type_idx ON public.revenue_events (event_type, created_at DESC);

GRANT SELECT, INSERT ON public.revenue_events TO authenticated;
GRANT INSERT ON public.revenue_events TO anon;
GRANT ALL ON public.revenue_events TO service_role;

ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own revenue events"
  ON public.revenue_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR email = public.auth_user_email());

CREATE POLICY "Anyone can insert revenue events"
  ON public.revenue_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role full revenue events"
  ON public.revenue_events FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Follow-up email dedup log
CREATE TABLE public.revenue_followup_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('nurture_24h','nurture_72h')),
  related_event_id UUID REFERENCES public.revenue_events(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email, stage, related_event_id)
);

GRANT SELECT ON public.revenue_followup_log TO authenticated;
GRANT ALL ON public.revenue_followup_log TO service_role;

ALTER TABLE public.revenue_followup_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages followup log"
  ON public.revenue_followup_log FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
