
# Fix: Stop Creating Tickets for Ignored/Spam Emails

## Root Cause

In `supabase/functions/process-email/index.ts`, the ticket creation block (lines 349-379) runs unconditionally for **every email** — including ones where the AI decided `action: "ignore"`. This means newsletters, spam, promotional emails, and automated no-reply messages all get tickets created in the database and appear in the Customer Inbox.

The database confirms this: **16 out of 17 tickets are linked to ignored/newsletter/spam emails.**

## The Fix: One Guard Condition

The ticket logic block (starting at line 350) needs a single condition added:

```
// Only create tickets for emails that are NOT ignored
if (!ticketId && parsedResponse.action !== "ignore") {
```

This means:
- `action: "reply"` → ticket IS created (genuine customer support email)
- `action: "queue"` → ticket IS created (needs human review)
- `action: "ignore"` → ticket is NOT created (newsletters, spam, automated emails)

The existing ticket update path (for replies to an existing thread) is already fine — it only runs when `emailData.thread_id` matches an existing ticket, so ignored replies on an existing support thread will still correctly update that ticket. Only the creation gate needs the guard.

## Cleanup: Existing Junk Tickets

The 16 bad tickets already in the database need to be cleaned up. We will add a database migration that deletes tickets which are exclusively linked to ignored emails (no real emails attached).

## What Changes

### 1. `supabase/functions/process-email/index.ts`
Add a single condition on line 350:

```typescript
// Before (broken):
if (!ticketId) {

// After (fixed):
if (!ticketId && parsedResponse.action !== "ignore") {
```

### 2. New migration: Clean up junk tickets
```sql
-- Delete tickets that only have ignored emails (newsletters, spam)
-- and no real support emails linked
DELETE FROM public.tickets
WHERE id IN (
  SELECT t.id FROM tickets t
  WHERE NOT EXISTS (
    SELECT 1 FROM email_queue eq
    WHERE eq.ticket_id = t.id
    AND eq.status != 'ignored'
  )
);
```

## What Is NOT Changed
- All existing email_queue logic is preserved
- Emails with `action: "ignore"` still get inserted into email_queue (for tracking/audit)
- Thread detection and ticket-update path for existing tickets is untouched
- SLA calculation, escalation flags, integration events — all preserved
- No frontend changes needed; the Customer Inbox will automatically show only real tickets once the bad data is purged

## Result
The Customer Inbox will only contain tickets from real customer interactions — support requests, complaints, billing questions, feature requests — not newsletters and automated emails.
