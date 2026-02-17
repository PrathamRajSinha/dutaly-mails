
# Phase 1 -- Database Migrations & Email-to-Ticket Foundation

This is a large transformation. To keep things safe and testable, we will implement it in batches. This plan covers **Phase 1 (Database)** and **Phase 2 (Email-to-Ticket logic)** -- the foundation everything else builds on.

## What Gets Built

### 1. New Database Tables (Single Migration)

**tickets** -- Core ticketing table
- id, user_id, subject, customer_email, status (open/pending/resolved/closed), priority (low/medium/high/urgent), assigned_to, category, sentiment_score, escalation_flag, sla_due_at, last_customer_reply_at, thread_id (links to email threads), created_at, updated_at
- Note: Using `user_id` instead of `workspace_id` since the app currently has no workspace/team concept. We will add workspace support in a later phase when team_members is built out.
- RLS: users can only access their own tickets

**ticket_internal_notes** -- Private agent notes on tickets
- id, ticket_id, user_id, note_text, created_at
- RLS: users can only access notes on their own tickets

**integrations** -- External service connections (Slack, webhooks, etc.)
- id, user_id, provider, config_json (jsonb), is_active, created_at
- RLS: user-scoped

**integration_events** -- Event log for dispatching
- id, user_id, event_type, payload_json (jsonb), delivered, created_at
- RLS: user-scoped

**email_queue modification** -- Add `ticket_id` column (uuid, nullable, FK to tickets)

### 2. Updated process-email Edge Function

Current behavior: classify email, insert into email_queue.

New behavior (additive, does not break existing flow):
1. All existing logic stays intact (KB lookup, AI classification, usage tracking, activity logs)
2. AI prompt is enhanced to also output `category` (refund/billing/technical_issue/complaint/feature_request/general) and `sentiment_score` (0-1) and `escalation_flag`
3. After inserting into email_queue:
   - Check if this `thread_id` already has a ticket (via existing email_queue rows)
   - If yes: attach the new email to that ticket, update `last_customer_reply_at` and status to "open" if it was resolved
   - If no: create a new ticket with subject, customer_email, AI-detected category, sentiment, and default priority (medium, or urgent if escalation_flag)
4. Insert integration events: `ticket.created` or `ticket.updated`
5. If escalation_flag is true, also emit `ticket.angry_detected`

### 3. New Hook: useTickets

A React Query hook that fetches tickets for the current user with filtering by status. This prepares the frontend for Phase 3 (UI changes).

### 4. Sidebar Navigation Update

Add "Tickets" nav item alongside existing "Email Queue" (keep both for now -- Email Queue becomes a sub-view in a later phase).

---

## Technical Details

### Database Migration

```text
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

-- ticket_internal_notes table
CREATE TABLE public.ticket_internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  note_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- integrations table
CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  config_json jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- integration_events table
CREATE TABLE public.integration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  delivered boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add ticket_id to email_queue
ALTER TABLE public.email_queue
  ADD COLUMN ticket_id uuid REFERENCES tickets(id);

-- RLS for all new tables (user-scoped)
-- Trigger for updated_at on tickets
-- Index on tickets(thread_id) and tickets(user_id, status)
```

### process-email Edge Function Changes

The AI prompt gains additional output fields:

```text
RESPONSE FORMAT (updated):
{
  "intent": "support" | "sales" | ... ,
  "category": "refund" | "billing" | "technical_issue" | "complaint" | "feature_request" | "general",
  "sentiment_score": 0.0 to 1.0,
  "escalation_flag": true | false,
  "action": "reply" | "ignore" | "queue",
  "confidence": 0.0 to 1.0,
  "reason": "...",
  "suggested_reply": "..."
}
```

After inserting into email_queue, the function:
1. Looks up existing ticket by thread_id
2. Creates or updates ticket
3. Updates the email_queue row with ticket_id
4. Inserts integration_events rows

### New Files

- `src/hooks/useTickets.ts` -- fetches tickets with status filtering
- `src/pages/Tickets.tsx` -- basic tickets list page (simple table/card view showing open tickets)

### Modified Files

- `supabase/functions/process-email/index.ts` -- add ticket creation and event emission logic
- `src/components/layout/AppSidebar.tsx` -- add Tickets nav item
- `src/App.tsx` -- add /tickets route

### What is NOT changed (preserved)

- All existing email_queue logic and UI
- Usage tracking (check_usage_limit, increment_usage)
- AI classification (extended, not replaced)
- Knowledge base
- All RLS policies on existing tables
- Email reply functionality (send-gmail-reply, send-imap-reply)
- Landing page (updated in a later phase)
- SLA system (Phase 3, later)
- Webhook dispatch engine (Phase 4, later)
- Slack integration (Phase 5, later)
- Full UI overhaul (Phase 6, later)
