ALTER TABLE public.email_queue ADD COLUMN IF NOT EXISTS labels text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS labels text[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_email_queue_labels ON public.email_queue USING GIN (labels);
CREATE INDEX IF NOT EXISTS idx_tickets_labels ON public.tickets USING GIN (labels);