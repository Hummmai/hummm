
-- Seller plans: tracks which plan a seller chose
CREATE TABLE public.seller_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  valuation_id uuid REFERENCES public.ai_valuations(id) ON DELETE SET NULL,
  plan_type text NOT NULL DEFAULT 'ai_only',
  status text NOT NULL DEFAULT 'active',
  address text NOT NULL,
  postcode text,
  asking_price integer,
  matched_agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seller_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own seller plans" ON public.seller_plans
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own seller plans" ON public.seller_plans
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own seller plans" ON public.seller_plans
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages seller plans" ON public.seller_plans
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seller offers: tracks offers received on a seller's property
CREATE TABLE public.seller_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_plan_id uuid NOT NULL REFERENCES public.seller_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  buyer_name text,
  offer_amount integer NOT NULL,
  buyer_status text DEFAULT 'unknown',
  proof_of_funds boolean DEFAULT false,
  dip_confirmed boolean DEFAULT false,
  ai_analysis text,
  ai_recommendation text,
  ai_counter_amount integer,
  ai_response_draft text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seller_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own offers" ON public.seller_offers
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own offers" ON public.seller_offers
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own offers" ON public.seller_offers
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages offers" ON public.seller_offers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Viewing slots: seller availability calendar
CREATE TABLE public.viewing_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_plan_id uuid NOT NULL REFERENCES public.seller_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  slot_start timestamptz NOT NULL,
  slot_end timestamptz NOT NULL,
  buyer_name text,
  buyer_email text,
  status text NOT NULL DEFAULT 'available',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.viewing_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own viewing slots" ON public.viewing_slots
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own viewing slots" ON public.viewing_slots
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own viewing slots" ON public.viewing_slots
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own viewing slots" ON public.viewing_slots
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Service role manages viewing slots" ON public.viewing_slots
  FOR ALL TO service_role USING (true) WITH CHECK (true);
