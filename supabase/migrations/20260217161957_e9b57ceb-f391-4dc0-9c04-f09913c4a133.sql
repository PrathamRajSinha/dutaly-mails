
-- Add SLA settings to ai_instructions
ALTER TABLE public.ai_instructions
  ADD COLUMN sla_first_response_hours integer DEFAULT 4,
  ADD COLUMN sla_resolution_hours integer DEFAULT 24;
