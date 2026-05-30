
-- 1. early_access_invites: replace broad anon policies with token-scoped RPCs

DROP POLICY IF EXISTS "Anon can read by token" ON public.early_access_invites;
DROP POLICY IF EXISTS "Anon can redeem invite" ON public.early_access_invites;

-- Secure RPC: redeem an invite by token. Returns email on success.
CREATE OR REPLACE FUNCTION public.redeem_invite(p_token text)
RETURNS TABLE(email text, role text, redeemed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.early_access_invites%ROWTYPE;
BEGIN
  IF p_token IS NULL OR length(p_token) < 8 THEN
    RETURN;
  END IF;

  SELECT * INTO v_invite FROM public.early_access_invites WHERE token = p_token;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF NOT v_invite.redeemed THEN
    UPDATE public.early_access_invites
       SET redeemed = true, redeemed_at = now()
     WHERE id = v_invite.id;
  END IF;

  RETURN QUERY SELECT v_invite.email, v_invite.role, true;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_invite(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_invite(text) TO anon, authenticated;


-- 2. early_access_requests: remove broad reads, add per-user scope + RPC for code lookup

DROP POLICY IF EXISTS "Anon can read by access code" ON public.early_access_requests;
DROP POLICY IF EXISTS "Authenticated can read by access code" ON public.early_access_requests;

CREATE POLICY "Users can read own request by email"
ON public.early_access_requests
FOR SELECT
TO authenticated
USING (email = public.auth_user_email());

-- Secure RPC: verify an access code. Returns email if a matching approved row exists.
CREATE OR REPLACE FUNCTION public.verify_access_code(p_code text)
RETURNS TABLE(email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_code IS NULL OR length(p_code) < 4 THEN
    RETURN;
  END IF;
  RETURN QUERY
    SELECT r.email FROM public.early_access_requests r
    WHERE r.access_code = upper(p_code) AND r.status = 'approved'
    LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_access_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_access_code(text) TO anon, authenticated;


-- 3. listing-photos storage bucket: require authenticated uploads scoped to user folder

DROP POLICY IF EXISTS "Anyone can upload listing photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload listing photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'listing-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own listing photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'listing-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own listing photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'listing-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
