-- Remove user write access to subscriptions; all writes must go through edge functions (service role)
DROP POLICY IF EXISTS "Users insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users update own subscription" ON public.subscriptions;