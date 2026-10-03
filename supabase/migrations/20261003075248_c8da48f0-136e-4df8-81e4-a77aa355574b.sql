CREATE TABLE public.email_forwarding_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Forwarding rule',
  label_match text,
  sentiment_below numeric,
  subject_contains text,
  from_match text,
  skip_auto_replied boolean NOT NULL DEFAULT true,
  forward_to text NOT NULL,
  note text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_forwarding_rules TO authenticated;
GRANT ALL ON public.email_forwarding_rules TO service_role;
ALTER TABLE public.email_forwarding_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rules" ON public.email_forwarding_rules FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_email_forwarding_rules_updated_at BEFORE UPDATE ON public.email_forwarding_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.email_forward_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  rule_id uuid REFERENCES public.email_forwarding_rules(id) ON DELETE SET NULL,
  email_queue_id uuid,
  email_subject text,
  email_from text,
  forward_to text NOT NULL,
  success boolean NOT NULL DEFAULT true,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_forward_logs TO authenticated;
GRANT ALL ON public.email_forward_logs TO service_role;
ALTER TABLE public.email_forward_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own forward logs" ON public.email_forward_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.automation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'task',
  title text NOT NULL,
  details text,
  due_at timestamptz,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_tasks TO authenticated;
GRANT ALL ON public.automation_tasks TO service_role;
ALTER TABLE public.automation_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tasks" ON public.automation_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_automation_tasks_updated_at BEFORE UPDATE ON public.automation_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.email_open_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_queue_id uuid NOT NULL REFERENCES public.email_queue(id) ON DELETE CASCADE,
  client text,
  is_proxy boolean NOT NULL DEFAULT false,
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX email_open_events_queue_idx ON public.email_open_events(email_queue_id, created_at DESC);
GRANT SELECT ON public.email_open_events TO authenticated;
GRANT ALL ON public.email_open_events TO service_role;
ALTER TABLE public.email_open_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own open events" ON public.email_open_events FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.record_email_open_event(p_tracking_id uuid, p_client text, p_is_proxy boolean, p_country text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_id uuid; v_user uuid;
BEGIN
  UPDATE public.email_queue
  SET opened_at = COALESCE(opened_at, now()), last_opened_at = now(), open_count = open_count + 1
  WHERE tracking_id = p_tracking_id AND status IN ('sent','approved','edited')
  RETURNING id, user_id INTO v_id, v_user;
  IF v_id IS NOT NULL THEN
    INSERT INTO public.email_open_events (user_id, email_queue_id, client, is_proxy, country)
    VALUES (v_user, v_id, left(p_client, 40), p_is_proxy, left(p_country, 8));
  END IF;
END; $$;
REVOKE ALL ON FUNCTION public.record_email_open_event(uuid, text, boolean, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_email_open_event(uuid, text, boolean, text) TO service_role;