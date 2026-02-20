-- Step 1: Unlink ignored email_queue rows from junk tickets
UPDATE public.email_queue
SET ticket_id = NULL
WHERE ticket_id IN (
  SELECT t.id FROM public.tickets t
  WHERE NOT EXISTS (
    SELECT 1 FROM public.email_queue eq
    WHERE eq.ticket_id = t.id
    AND eq.status != 'ignored'
  )
);

-- Step 2: Delete the now-orphaned junk tickets
DELETE FROM public.tickets
WHERE id NOT IN (
  SELECT DISTINCT ticket_id FROM public.email_queue WHERE ticket_id IS NOT NULL
);