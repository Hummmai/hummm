
CREATE TABLE public.negotiation_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  property_address text NOT NULL,
  property_price integer,
  listing_type text NOT NULL DEFAULT 'sale',
  max_budget integer,
  buyer_status text DEFAULT 'chain-free',
  status text NOT NULL DEFAULT 'strategy_drafted',
  ai_draft_subject text,
  ai_draft_body text,
  ai_summary text,
  counter_options jsonb DEFAULT '[]'::jsonb,
  agent_reply text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.negotiation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own negotiations" ON public.negotiation_messages
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own negotiations" ON public.negotiation_messages
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update own negotiations" ON public.negotiation_messages
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages all" ON public.negotiation_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.negotiation_messages;
