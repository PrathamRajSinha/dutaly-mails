
-- 1. subscription_plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  emails_per_month INTEGER NOT NULL DEFAULT 0,
  ai_questions_per_month INTEGER NOT NULL DEFAULT 0,
  kb_entries_limit INTEGER NOT NULL DEFAULT 0,
  email_accounts_limit INTEGER NOT NULL DEFAULT 0,
  price_monthly NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view plans"
  ON public.subscription_plans FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 2. user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'pending',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 3. usage_tracking table
CREATE TABLE public.usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_start DATE NOT NULL,
  emails_processed INTEGER NOT NULL DEFAULT 0,
  ai_questions_asked INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_start)
);

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Seed subscription plans
INSERT INTO public.subscription_plans (name, display_name, emails_per_month, ai_questions_per_month, kb_entries_limit, email_accounts_limit, price_monthly)
VALUES
  ('starter', 'Starter', 100, 20, 10, 2, 0),
  ('pro', 'Pro', 500, 100, 50, 5, 0),
  ('enterprise', 'Enterprise', -1, -1, -1, -1, 0);

-- 5. check_usage_limit function
CREATE OR REPLACE FUNCTION public.check_usage_limit(p_user_id UUID, p_resource_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_limit INTEGER;
  v_current_usage INTEGER;
  v_period DATE;
BEGIN
  v_period := date_trunc('month', now())::date;

  -- Get the plan limit
  SELECT
    CASE p_resource_type
      WHEN 'emails' THEN sp.emails_per_month
      WHEN 'ai_questions' THEN sp.ai_questions_per_month
      WHEN 'kb_entries' THEN sp.kb_entries_limit
      WHEN 'email_accounts' THEN sp.email_accounts_limit
      ELSE 0
    END INTO v_plan_limit
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id AND us.status = 'active';

  -- No active subscription
  IF v_plan_limit IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Unlimited
  IF v_plan_limit = -1 THEN
    RETURN TRUE;
  END IF;

  -- For kb_entries and email_accounts, count existing rows instead of usage_tracking
  IF p_resource_type = 'kb_entries' THEN
    SELECT COUNT(*) INTO v_current_usage FROM knowledge_base_entries WHERE user_id = p_user_id;
    RETURN v_current_usage < v_plan_limit;
  END IF;

  IF p_resource_type = 'email_accounts' THEN
    SELECT COUNT(*) INTO v_current_usage FROM email_accounts WHERE user_id = p_user_id;
    RETURN v_current_usage < v_plan_limit;
  END IF;

  -- For emails and ai_questions, check usage_tracking
  SELECT
    CASE p_resource_type
      WHEN 'emails' THEN COALESCE(ut.emails_processed, 0)
      WHEN 'ai_questions' THEN COALESCE(ut.ai_questions_asked, 0)
      ELSE 0
    END INTO v_current_usage
  FROM usage_tracking ut
  WHERE ut.user_id = p_user_id AND ut.period_start = v_period;

  IF v_current_usage IS NULL THEN
    v_current_usage := 0;
  END IF;

  RETURN v_current_usage < v_plan_limit;
END;
$$;

-- 6. increment_usage function (for edge functions to call)
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id UUID, p_resource_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period DATE;
BEGIN
  v_period := date_trunc('month', now())::date;

  INSERT INTO usage_tracking (user_id, period_start)
  VALUES (p_user_id, v_period)
  ON CONFLICT (user_id, period_start) DO NOTHING;

  IF p_resource_type = 'emails' THEN
    UPDATE usage_tracking SET emails_processed = emails_processed + 1
    WHERE user_id = p_user_id AND period_start = v_period;
  ELSIF p_resource_type = 'ai_questions' THEN
    UPDATE usage_tracking SET ai_questions_asked = ai_questions_asked + 1
    WHERE user_id = p_user_id AND period_start = v_period;
  END IF;
END;
$$;

-- 7. Update handle_new_user to create pending subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

  INSERT INTO public.ai_instructions (user_id, system_prompt)
  VALUES (NEW.id, 'You are a helpful email assistant. Only answer questions using the knowledge base. If unsure, do not guess and send the email to the review queue.');

  INSERT INTO public.user_subscriptions (user_id, status)
  VALUES (NEW.id, 'pending');

  RETURN NEW;
END;
$$;

-- 8. Trigger for updated_at on user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
