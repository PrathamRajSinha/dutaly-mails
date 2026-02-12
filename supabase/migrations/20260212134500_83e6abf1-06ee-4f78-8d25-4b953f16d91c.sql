
ALTER TABLE public.ai_instructions
ADD COLUMN email_footer text DEFAULT 'This email was sent by an AI assistant. If you believe this was sent in error, please let us know.',
ADD COLUMN logo_url text DEFAULT NULL;
