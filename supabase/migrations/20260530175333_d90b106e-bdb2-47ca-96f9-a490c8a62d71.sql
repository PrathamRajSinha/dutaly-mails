
-- 1. Strengthen profiles plan/role escalation protection via trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- service_role bypasses this check
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    RAISE EXCEPTION 'plan cannot be modified by user';
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'role cannot be modified by user';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation_trg ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- Simplify the UPDATE policy now that the trigger enforces immutability
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. Coupons - lock down all writes for non-service-role
CREATE POLICY "No client writes to coupons - insert"
ON public.coupons FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "No client writes to coupons - update"
ON public.coupons FOR UPDATE TO authenticated, anon USING (false);
CREATE POLICY "No client writes to coupons - delete"
ON public.coupons FOR DELETE TO authenticated, anon USING (false);
CREATE POLICY "No client reads of coupons"
ON public.coupons FOR SELECT TO authenticated, anon USING (false);

-- 3. Subscriptions - explicit deny on all client writes
CREATE POLICY "No client inserts to subscriptions"
ON public.subscriptions FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "No client updates to subscriptions"
ON public.subscriptions FOR UPDATE TO authenticated, anon USING (false);
CREATE POLICY "No client deletes from subscriptions"
ON public.subscriptions FOR DELETE TO authenticated, anon USING (false);

-- 4. Usage tracking - explicit deny on all client writes
CREATE POLICY "No client inserts to usage_tracking"
ON public.usage_tracking FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "No client updates to usage_tracking"
ON public.usage_tracking FOR UPDATE TO authenticated, anon USING (false);
CREATE POLICY "No client deletes from usage_tracking"
ON public.usage_tracking FOR DELETE TO authenticated, anon USING (false);

-- 5. User subscriptions - explicit deny on all client writes
CREATE POLICY "No client inserts to user_subscriptions"
ON public.user_subscriptions FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "No client updates to user_subscriptions"
ON public.user_subscriptions FOR UPDATE TO authenticated, anon USING (false);
CREATE POLICY "No client deletes from user_subscriptions"
ON public.user_subscriptions FOR DELETE TO authenticated, anon USING (false);
