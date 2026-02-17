
-- tickets table
CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text NOT NULL,
  customer_email text NOT NULL,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid,
  category text,
  sentiment_score numeric,
  escalation_flag boolean DEFAULT false,
  sla_due_at timestamptz,
  last_customer_reply_at timestamptz,
  thread_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets" ON public.tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tickets" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tickets" ON public.tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tickets" ON public.tickets FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_tickets_thread_id ON public.tickets(thread_id);
CREATE INDEX idx_tickets_user_status ON public.tickets(user_id, status);

-- Updated_at trigger
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ticket_internal_notes table
CREATE TABLE public.ticket_internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  note_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ticket_internal_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ticket notes" ON public.ticket_internal_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ticket notes" ON public.ticket_internal_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ticket notes" ON public.ticket_internal_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ticket notes" ON public.ticket_internal_notes FOR DELETE USING (auth.uid() = user_id);

-- integrations table
CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  config_json jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own integrations" ON public.integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own integrations" ON public.integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own integrations" ON public.integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own integrations" ON public.integrations FOR DELETE USING (auth.uid() = user_id);

-- integration_events table
CREATE TABLE public.integration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  delivered boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.integration_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own integration events" ON public.integration_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own integration events" ON public.integration_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add ticket_id to email_queue
ALTER TABLE public.email_queue ADD COLUMN ticket_id uuid REFERENCES public.tickets(id);
