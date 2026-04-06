-- Add scheduled_send_at for Send Later feature
ALTER TABLE public.email_queue ADD COLUMN scheduled_send_at timestamptz DEFAULT NULL;

-- Add snoozed_until for Snooze feature
ALTER TABLE public.email_queue ADD COLUMN snoozed_until timestamptz DEFAULT NULL;

-- Drop old status constraint and add updated one with 'scheduled' and 'snoozed' statuses
ALTER TABLE public.email_queue DROP CONSTRAINT IF EXISTS email_queue_status_check;
ALTER TABLE public.email_queue ADD CONSTRAINT email_queue_status_check 
  CHECK (status IN ('pending', 'approved', 'edited', 'ignored', 'sent', 'sending', 'scheduled', 'snoozed'));

-- Index for scheduled emails to enable efficient polling
CREATE INDEX idx_email_queue_scheduled ON public.email_queue (scheduled_send_at) WHERE scheduled_send_at IS NOT NULL;

-- Index for snoozed emails
CREATE INDEX idx_email_queue_snoozed ON public.email_queue (snoozed_until) WHERE snoozed_until IS NOT NULL;