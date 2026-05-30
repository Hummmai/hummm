
CREATE TABLE public.negotiation_loop_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  audit_id UUID REFERENCES public.saved_audits(id) ON DELETE SET NULL,
  property_url TEXT,
  property_address TEXT,
  asking_price NUMERIC,
  fair_value NUMERIC,
  target_price NUMERIC,
  current_offer NUMERIC,
  currency TEXT DEFAULT 'GBP',
  agent_name TEXT,
  agent_email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  sentiment TEXT,
  last_ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_neg_loop_threads_user ON public.negotiation_loop_threads(user_id, updated_at DESC);
ALTER TABLE public.negotiation_loop_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loop threads select own" ON public.negotiation_loop_threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "loop threads insert own" ON public.negotiation_loop_threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "loop threads update own" ON public.negotiation_loop_threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "loop threads delete own" ON public.negotiation_loop_threads FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_neg_loop_threads_updated_at
  BEFORE UPDATE ON public.negotiation_loop_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_neg_conv_updated_at();

CREATE TABLE public.negotiation_loop_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.negotiation_loop_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('in','out')),
  channel TEXT NOT NULL DEFAULT 'paste' CHECK (channel IN ('paste','email','inbox','note')),
  body TEXT NOT NULL,
  sentiment TEXT,
  suggested_replies JSONB,
  recommended_offer NUMERIC,
  ai_summary TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_neg_loop_turns_thread ON public.negotiation_loop_turns(thread_id, created_at);
ALTER TABLE public.negotiation_loop_turns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loop turns select own" ON public.negotiation_loop_turns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "loop turns insert own" ON public.negotiation_loop_turns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "loop turns update own" ON public.negotiation_loop_turns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "loop turns delete own" ON public.negotiation_loop_turns FOR DELETE USING (auth.uid() = user_id);
