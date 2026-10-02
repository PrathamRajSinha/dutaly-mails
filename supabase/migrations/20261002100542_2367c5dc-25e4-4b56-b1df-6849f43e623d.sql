CREATE OR REPLACE FUNCTION public.record_email_open(p_tracking_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.email_queue
  SET opened_at = COALESCE(opened_at, now()), last_opened_at = now(), open_count = open_count + 1
  WHERE tracking_id = p_tracking_id AND status IN ('sent','approved','edited');
$$;
REVOKE ALL ON FUNCTION public.record_email_open(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_email_open(uuid) TO service_role;