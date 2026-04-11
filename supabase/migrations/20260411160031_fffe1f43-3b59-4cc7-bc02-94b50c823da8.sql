
-- Add new columns to existing profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'starter' CHECK (plan IN ('starter','growth','scale')),
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'owner',
  ADD COLUMN IF NOT EXISTS trial_start timestamp with time zone,
  ADD COLUMN IF NOT EXISTS trial_end timestamp with time zone;

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL,
  status text DEFAULT 'trialing' CHECK (status IN ('trialing','active','cancelled','past_due','free')),
  razorpay_subscription_id text,
  razorpay_customer_id text,
  razorpay_payment_id text,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  current_period_end timestamp with time zone,
  coupon_used text,
  amount_paid integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Create coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text CHECK (discount_type IN ('percent','fixed')),
  discount_value integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert FREETEST coupon
INSERT INTO public.coupons (code, discount_type, discount_value, is_active)
VALUES ('FREETEST', 'percent', 100, true);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions
CREATE POLICY "Users read own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subscription" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for coupons
CREATE POLICY "Authenticated users read coupons" ON public.coupons FOR SELECT TO authenticated USING (true);

-- Update handle_new_user to also set plan
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, plan)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'starter');

  INSERT INTO public.ai_instructions (user_id, system_prompt)
  VALUES (NEW.id, 'You are a helpful email assistant. Only answer questions using the knowledge base. If unsure, do not guess and send the email to the review queue.');

  INSERT INTO public.user_subscriptions (user_id, status)
  VALUES (NEW.id, 'pending');

  RETURN NEW;
END;
$$;
