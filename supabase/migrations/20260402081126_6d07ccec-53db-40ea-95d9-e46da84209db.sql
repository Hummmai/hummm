CREATE TABLE public.report_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID REFERENCES public.saved_audits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  field_name TEXT,
  user_comment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.report_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own reports" ON public.report_issues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own reports" ON public.report_issues
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role manages reports" ON public.report_issues
  FOR ALL TO service_role USING (true) WITH CHECK (true);