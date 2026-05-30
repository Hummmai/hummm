
-- viewing_requests table for buyer-seller bridge
CREATE TABLE public.viewing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_plan_id uuid NOT NULL REFERENCES public.seller_plans(id) ON DELETE CASCADE,
  buyer_user_id uuid NOT NULL,
  property_address text NOT NULL,
  availability text[] NOT NULL DEFAULT '{}',
  buyer_position text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  proposed_time timestamptz,
  buyer_email text,
  buyer_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.viewing_requests ENABLE ROW LEVEL SECURITY;

-- Buyers can insert their own requests
CREATE POLICY "Buyers can insert own requests"
  ON public.viewing_requests FOR INSERT TO authenticated
  WITH CHECK (buyer_user_id = auth.uid());

-- Buyers can read own requests
CREATE POLICY "Buyers can read own requests"
  ON public.viewing_requests FOR SELECT TO authenticated
  USING (buyer_user_id = auth.uid());

-- Sellers can read requests for their plans
CREATE POLICY "Sellers can read requests for their plans"
  ON public.viewing_requests FOR SELECT TO authenticated
  USING (seller_plan_id IN (
    SELECT id FROM public.seller_plans WHERE user_id = auth.uid()
  ));

-- Sellers can update requests for their plans
CREATE POLICY "Sellers can update requests for their plans"
  ON public.viewing_requests FOR UPDATE TO authenticated
  USING (seller_plan_id IN (
    SELECT id FROM public.seller_plans WHERE user_id = auth.uid()
  ))
  WITH CHECK (seller_plan_id IN (
    SELECT id FROM public.seller_plans WHERE user_id = auth.uid()
  ));

-- Service role manages all
CREATE POLICY "Service role manages viewing requests"
  ON public.viewing_requests FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.viewing_requests;
