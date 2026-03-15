
-- Phase 2 DB changes

-- 2A: Onboarding
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- 2B: Unsend window
ALTER TABLE public.ai_instructions ADD COLUMN IF NOT EXISTS unsend_window_seconds integer NOT NULL DEFAULT 60;

-- 2D: Per-category confidence thresholds
CREATE TABLE public.category_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL,
  confidence_threshold numeric NOT NULL DEFAULT 0.8,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);

ALTER TABLE public.category_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own category thresholds"
  ON public.category_thresholds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own category thresholds"
  ON public.category_thresholds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category thresholds"
  ON public.category_thresholds FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own category thresholds"
  ON public.category_thresholds FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_category_thresholds_updated_at
  BEFORE UPDATE ON public.category_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
