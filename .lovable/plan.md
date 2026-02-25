

# Plan: Merge Email Queue into Customer Inbox + Instruction Builder

Two changes: (1) eliminate the separate Email Queue page by integrating its functionality into the Customer Inbox ticket detail, and (2) redesign the Instructions page with structured point-based rules.

---

## Part 1: Merge Email Queue into Customer Inbox

### Problem
The Email Queue (`/queue`) and Customer Inbox (`/tickets`) show overlapping data — emails and tickets are linked, but actions like approve/edit/send/ignore/compose/attach/template are only available on the Email Queue page. Users must switch between pages constantly.

### Solution
Embed the email action workflow directly into the Ticket Detail Panel's conversation thread. Each pending email in the thread gets inline approve/edit/send/ignore buttons, compose area, template picker, and attachment support — exactly what EmailQueue's `EmailCard` component provides today. Then remove Email Queue from the sidebar.

### What Changes

**1. `src/components/tickets/TicketDetailPanel.tsx`** — Major enhancement:
- Each email in the conversation thread gets action buttons when status is `"pending"`:
  - Approve & Send, Edit & Send, Compose Reply, Ignore
  - Template picker button, Attach file button
- Emails with `status === "sent"` show as read-only (current behavior)
- Add a "Fetch Emails" button in the header to manually pull new emails
- Add the auto-fetch polling toggle from EmailQueue
- Import and use `useEmailQueue`'s `updateEmailStatus` mutation for approve/ignore/edit actions
- Import send logic (invoke `send-gmail-reply` / `send-imap-reply`) for the send flow
- Add "Add to Knowledge Base" action per email

**2. `src/pages/Tickets.tsx`** — Minor updates:
- Add a "Needs Review" count badge on the ticket list showing how many emails across all tickets need action
- Add a filter to highlight tickets that have pending emails needing review

**3. `src/components/layout/AppSidebar.tsx`**:
- Remove the "Email Queue" nav item (`/queue`)
- Customer Inbox becomes the single destination for all email + ticket work

**4. `src/App.tsx`**:
- Remove the `/queue` route (or redirect it to `/tickets`)
- Remove the EmailQueue import

**5. `src/pages/EmailQueue.tsx`** — Keep file but add a redirect:
- Redirect to `/tickets` for any bookmarks or links

### Visual: Updated Ticket Detail Conversation

```text
┌─────────────────────────────────────────────┐
│ [← Back]  Ticket: "Refund request for..."  │
│ [Status ▾] [Priority ▾] [SLA: 2h left]    │
│ [Fetch Emails 🔄]                           │
├─────────────────────────────────────────────┤
│ [Conversation (3)]  [Notes (1)]             │
├─────────────────────────────────────────────┤
│ ┌─ Customer Email (pending) ─────────────┐ │
│ │ From: john@example.com                  │ │
│ │ "I'd like a refund for order #123..."   │ │
│ │                                         │ │
│ │ ── AI Suggested Reply ──                │ │
│ │ "Thank you for reaching out..."         │ │
│ │                                         │ │
│ │ [✓ Approve & Send] [✎ Edit] [✗ Ignore] │ │
│ │ [📎 Attach] [📄 Template] [+ KB]       │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─ Sent Reply ───────────────────────────┐ │
│ │ "We've processed your refund..."  ✓Sent │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Part 2: Structured Instruction Builder

(As previously approved — summarized here for completeness)

### What Changes

**1. New migration**: Create `ai_instruction_rules` table with columns: `id`, `user_id`, `parent_id`, `text`, `priority` (critical/important/normal/low), `condition_type` (if/when/unless/null), `condition_text`, `sort_order`, `is_active`, timestamps. RLS policies scoped to `auth.uid() = user_id`.

**2. New hook**: `src/hooks/useInstructionRules.ts` — CRUD operations for rules, compile-to-prompt function that builds the `system_prompt` string from structured rules.

**3. New component**: `src/components/instructions/InstructionBuilder.tsx` — Replaces the textarea with:
- Condition logic buttons toolbar: IF, WHEN, UNLESS, ALWAYS, NEVER
- Priority selector per rule (color-coded badges)
- Parent/child nesting (sub-instructions)
- Toggle individual rules on/off
- AI auto-detail "magic wand" button per instruction
- Add/delete rules inline

**4. Modified**: `src/pages/Instructions.tsx` — Swap the "Behavior Instructions" textarea card for the `InstructionBuilder` component. All other cards (Do/Don't, Reply Style, Signature, Automation) remain unchanged.

**5. Modified**: `src/hooks/useAIInstructions.ts` — On save, compile structured rules into `system_prompt` string for backward compatibility with `process-email`.

### What Does NOT Change
- `process-email` edge function (still reads `system_prompt`)
- `ai_instructions` table structure (keeps `system_prompt` column)
- Do/Don't rules section, Reply Style, Signature, Automation cards

---

## Implementation Order
1. Instruction Builder (migration → hook → component → page update)
2. Merge Email Queue into Ticket Detail Panel
3. Remove Email Queue sidebar item and route
4. Test end-to-end

