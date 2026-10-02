ALTER TABLE public.email_queue
  ADD COLUMN IF NOT EXISTS tracking_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS open_count integer NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_queue_tracking_id ON public.email_queue (tracking_id);

CREATE OR REPLACE FUNCTION public.record_email_open(p_tracking_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.email_queue
  SET opened_at = COALESCE(opened_at, now()), last_opened_at = now(), open_count = open_count + 1
  WHERE tracking_id = p_tracking_id AND status = 'sent';
$$;
REVOKE ALL ON FUNCTION public.record_email_open(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_email_open(uuid) TO service_role;