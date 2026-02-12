ALTER TABLE public.ai_instructions
ADD COLUMN do_rules text[] DEFAULT '{}'::text[],
ADD COLUMN do_not_rules text[] DEFAULT '{}'::text[];