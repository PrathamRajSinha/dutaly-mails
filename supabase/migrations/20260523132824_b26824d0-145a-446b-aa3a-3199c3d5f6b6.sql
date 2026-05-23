-- 1. Coupons: drop overly permissive SELECT policy. Only edge functions (service role) read coupons.
DROP POLICY IF EXISTS "Authenticated users read coupons" ON public.coupons;

-- 2. user_subscriptions: drop user-facing INSERT/UPDATE policies (privilege escalation).
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;

-- 3. Storage: add missing UPDATE policy for email-attachments bucket scoped to owning user.
CREATE POLICY "Users can update their own attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'email-attachments'
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'email-attachments'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 4. Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated.
-- These are only invoked by edge functions (service role) or triggers.
REVOKE EXECUTE ON FUNCTION public.check_usage_limit(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.increment_usage(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;