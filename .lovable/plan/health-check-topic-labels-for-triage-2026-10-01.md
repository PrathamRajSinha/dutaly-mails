# Health check + topic labels for triage

## Part 1 — Check that everything works
Walk through the main flows signed in as you and fix anything broken:
- Sign up / login, plan + coupon flow, onboarding wizard
- Connect inbox (Gmail + IMAP), fetch emails for every connected account
- AI processing: drafts, auto-reply sends once (no duplicates), styled HTML replies, "Re-check with KB"
- Inbox and Tickets: filters, snooze, send later, ticket detail
- Knowledge Base: add entry, upload document (parsed text shows), type filters, Build with chat
- Instructions, Ask Emails, Templates, Settings, dark mode
- Review error logs (app + backend functions) and the security scan

Anything found broken gets fixed in the same pass; a short list of what was checked and fixed is reported at the end.

## Part 2 — Topic labels for emails
Today emails only get a coarse category (refund, billing, general...) and priority. Add descriptive **labels** that say what the email is about.

- AI assigns 1–3 short labels per email, e.g. "Order status", "Shipping delay", "Password reset", "Pricing question", "Invoice request", "Bug report", "Partnership", "Cancellation", "Feedback".
- Labels prefer reusing ones you already have so they stay consistent instead of creating near-duplicates.
- Shown as small colored chips on each email row, ticket row and in the detail panel.
- New "Labels" section in the Inbox Filters menu (multi-select) plus removable filter chips.
- You can add or remove a label manually on any email/ticket.
- "Re-label existing emails" button reprocesses older emails so they get labels too.

## Technical details
- Migration: add `labels text[] default '{}'` to `email_queue` and `tickets` with GIN indexes (existing RLS covers it).
- `process-email` and `reprocess-queued-emails`: extend AI JSON schema with `labels: string[]`, pass user's top existing labels into the prompt, normalize (Title Case, trimmed, max 3); copy labels onto the linked ticket (merge).
- `TriageFilterBar`: add `labels: string[]` to `FilterState`, `availableLabels` prop derived from loaded data; filter logic in `Inbox.tsx`/`Tickets.tsx`.
- Label chip component with deterministic color from label name using design tokens; small edit popover for manual add/remove.
