
-- 1. uk_estate_agents: restrict to service_role only (remove broad authenticated read access to scraped agent contact details)
DROP POLICY IF EXISTS "Authenticated users can view agents" ON public.uk_estate_agents;
REVOKE SELECT ON public.uk_estate_agents FROM authenticated, anon;

-- 2. revenue_events: remove the open INSERT policy; only service_role may insert (via revenue-orchestrator)
DROP POLICY IF EXISTS "Anyone can insert revenue events" ON public.revenue_events;
REVOKE INSERT ON public.revenue_events FROM anon, authenticated;

-- 3. audit_usage: prevent users from rewriting their own counter; use SECURITY DEFINER RPC to increment only
DROP POLICY IF EXISTS "Users can update own usage" ON public.audit_usage;
DROP POLICY IF EXISTS "Users can insert own usage" ON public.audit_usage;
REVOKE INSERT, UPDATE ON public.audit_usage FROM authenticated, anon;

CREATE OR REPLACE FUNCTION public.increment_audit_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_month text := to_char(now(), 'YYYY-MM');
  v_new_count integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.audit_usage (user_id, month, audit_count)
  VALUES (v_user, v_month, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    audit_count = public.audit_usage.audit_count + 1,
    updated_at = now()
  RETURNING audit_count INTO v_new_count;

  RETURN v_new_count;
END;
$$;

-- Ensure the unique constraint exists for the ON CONFLICT target
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.audit_usage'::regclass
      AND conname = 'audit_usage_user_month_unique'
  ) THEN
    ALTER TABLE public.audit_usage
      ADD CONSTRAINT audit_usage_user_month_unique UNIQUE (user_id, month);
  END IF;
END $$;

GRANT EXECUTE ON FUNCTION public.increment_audit_count() TO authenticated;

-- 4. Realtime: enable RLS on realtime.messages and deny anonymous channel subscriptions.
-- Authenticated users may join channels; per-row delivery for postgres_changes is still
-- gated by each table's own RLS, and broadcast is restricted to authenticated callers.
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can use realtime" ON realtime.messages;
CREATE POLICY "Authenticated can use realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);
