
-- KB Gap Events table
CREATE TABLE public.kb_gap_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  detected_topic TEXT NOT NULL,
  category TEXT,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kb_gap_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own kb gap events" ON public.kb_gap_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own kb gap events" ON public.kb_gap_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own kb gap events" ON public.kb_gap_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own kb gap events" ON public.kb_gap_events FOR DELETE USING (auth.uid() = user_id);

-- Add resolutions_used to usage_tracking
ALTER TABLE public.usage_tracking ADD COLUMN IF NOT EXISTS resolutions_used INTEGER NOT NULL DEFAULT 0;

-- Add resolutions_limit and overage_rate to subscription_plans
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS resolutions_limit INTEGER NOT NULL DEFAULT -1;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS overage_rate_per_resolution NUMERIC NOT NULL DEFAULT 0;

-- Add manual_only_senders to ai_instructions
ALTER TABLE public.ai_instructions ADD COLUMN IF NOT EXISTS manual_only_senders TEXT[] DEFAULT '{}'::text[];
