CREATE UNIQUE INDEX IF NOT EXISTS email_queue_user_external_uidx
  ON public.email_queue (user_id, external_email_id)
  WHERE external_email_id IS NOT NULL;