CREATE TABLE public.whatsapp_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  phone_number_id text NOT NULL UNIQUE,
  waba_id text NOT NULL,
  display_phone_number text,
  verified_name text,
  access_token text NOT NULL,
  app_secret text,
  verify_token text NOT NULL DEFAULT encode(gen_random_bytes(16),'hex'),
  auto_reply_enabled boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  last_status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT (id,user_id,phone_number_id,waba_id,display_phone_number,verified_name,verify_token,auto_reply_enabled,is_active,last_status,created_at,updated_at) ON public.whatsapp_accounts TO authenticated;
GRANT UPDATE (auto_reply_enabled,is_active) ON public.whatsapp_accounts TO authenticated;
GRANT DELETE ON public.whatsapp_accounts TO authenticated;
GRANT ALL ON public.whatsapp_accounts TO service_role;
ALTER TABLE public.whatsapp_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wa accounts select" ON public.whatsapp_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own wa accounts update" ON public.whatsapp_accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own wa accounts delete" ON public.whatsapp_accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER wa_accounts_updated BEFORE UPDATE ON public.whatsapp_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  whatsapp_account_id uuid NOT NULL REFERENCES public.whatsapp_accounts(id) ON DELETE CASCADE,
  contact_wa_id text NOT NULL,
  contact_name text,
  direction text NOT NULL,
  body text NOT NULL DEFAULT '',
  message_type text NOT NULL DEFAULT 'text',
  wa_message_id text UNIQUE,
  status text,
  is_ai boolean NOT NULL DEFAULT false,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX whatsapp_messages_thread_idx ON public.whatsapp_messages (user_id, contact_wa_id, created_at DESC);
GRANT SELECT ON public.whatsapp_messages TO authenticated;
GRANT ALL ON public.whatsapp_messages TO service_role;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wa messages select" ON public.whatsapp_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;