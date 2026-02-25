
-- Create ai_instruction_rules table for structured instruction builder
CREATE TABLE public.ai_instruction_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.ai_instruction_rules(id) ON DELETE CASCADE,
  rule_text TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('critical', 'important', 'normal', 'low')),
  condition_type TEXT CHECK (condition_type IN ('if', 'when', 'unless', 'always', 'never')),
  condition_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.ai_instruction_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own instruction rules"
  ON public.ai_instruction_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own instruction rules"
  ON public.ai_instruction_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instruction rules"
  ON public.ai_instruction_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own instruction rules"
  ON public.ai_instruction_rules FOR DELETE
  USING (auth.uid() = user_id);

-- Index for efficient querying
CREATE INDEX idx_instruction_rules_user_id ON public.ai_instruction_rules(user_id);
CREATE INDEX idx_instruction_rules_parent_id ON public.ai_instruction_rules(parent_id);
