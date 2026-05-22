ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS email_account_id uuid;

UPDATE public.tickets t
SET email_account_id = sub.email_account_id
FROM (
  SELECT DISTINCT ON (eq.user_id, eq.thread_id)
    eq.user_id, eq.thread_id, eq.email_account_id
  FROM public.email_queue eq
  WHERE eq.thread_id IS NOT NULL AND eq.email_account_id IS NOT NULL
  ORDER BY eq.user_id, eq.thread_id, eq.created_at DESC
) sub
WHERE t.email_account_id IS NULL
  AND t.user_id = sub.user_id
  AND t.thread_id = sub.thread_id;

CREATE INDEX IF NOT EXISTS idx_tickets_email_account_id ON public.tickets(email_account_id);