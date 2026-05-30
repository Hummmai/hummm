
CREATE TABLE public.seller_offers_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_address TEXT NOT NULL,
  offer_amount NUMERIC NOT NULL,
  offered_by TEXT,
  offer_date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  counter_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.seller_offers_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own offers" ON public.seller_offers_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own offers" ON public.seller_offers_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own offers" ON public.seller_offers_log
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own offers" ON public.seller_offers_log
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
