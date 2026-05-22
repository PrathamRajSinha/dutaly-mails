# Per-account tabs for inbox & dashboard

Today every screen shows data for all of a user's emails mashed together, so a freshly connected account inherits the previous account's history. Instead of wiping data on disconnect, scope every view to a selected email account and let the user switch with tabs at the top.

## What the user will see

- A row of pill tabs at the top of `Mails`, `Tickets`, `Dashboard`, `Ask`, `Email Queue`, and `Activity` showing each connected account (`alice@gmail.com`, `support@acme.com`, …) plus an `All accounts` tab.
- Clicking a tab filters every list, stat, and chart on the page to that account only. Selection persists across navigation (stored in `localStorage`) and survives reload.
- When only one account is connected the tab bar collapses to a single label (no switcher needed).
- Disconnecting an account removes its tab; if it was selected, we fall back to `All accounts`. Existing tickets/emails from that account stay in the database but disappear from the UI because the tab is gone — adding a new account therefore starts on a clean tab.

## How it works

### 1. Data model
- Add nullable `email_account_id uuid` to `tickets` (no FK, single-user model, matches `activity_logs` / `email_queue` style).
- Backfill: for each ticket, copy `email_account_id` from the most recent matching `email_queue` row (same `user_id` + `thread_id`). Tickets that can't be matched stay `NULL` and only show under `All accounts`.
- Update `process-email` edge function to set `tickets.email_account_id = emailData.email_account_id` on insert.

### 2. Global selection
- New `SelectedAccountContext` (provider mounted in `AppLayout`) holding `selectedAccountId: string | "all"`, persisted in `localStorage` keyed by `user.id`.
- New `<AccountTabs />` component rendered inside `AppLayout` header (above page content) using existing `useEmailAccounts()`. Styled with the existing pill/tab tokens (Inter, `#7C6FE0` active accent).
- Auto-reset to `"all"` when the selected account disappears (post-disconnect).

### 3. Query filtering
Pass `selectedAccountId` into each hook and add `.eq("email_account_id", id)` when not `"all"`:
- `useEmailQueue` → `email_queue`
- `useTickets` + `useTicketDetail` → `tickets`
- `useActivityLogs` → `activity_logs`
- `useAutoSentAudit` → activity logs view
- `Dashboard.tsx` stat/resolution queries
- `AskEmails` reference list (queue + tickets)

Each hook's React Query key gains `selectedAccountId` so switching tabs refetches cleanly.

### 4. Disconnect flow
Leaves `disconnectAccount` as-is (no cascading deletes). After disconnect, `useEmailAccounts` invalidation triggers `AccountTabs` to drop the tab; `SelectedAccountContext` auto-falls back to `"all"`.

## Out of scope
- No deletion of historical data — preserved for reporting.
- No cross-account merging of threads.
- No per-account settings/AI instructions (still global, matches single-user model).

## Files touched
- Migration: add `tickets.email_account_id`, backfill from `email_queue`.
- `supabase/functions/process-email/index.ts` — write `email_account_id` on ticket insert.
- New `src/contexts/SelectedAccountContext.tsx`, `src/components/layout/AccountTabs.tsx`.
- `src/components/layout/AppLayout.tsx` — mount provider + tabs.
- Hooks: `useEmailQueue`, `useTickets`, `useTicketDetail`, `useActivityLogs`, `useAutoSentAudit`.
- Pages: `Dashboard`, `Inbox`, `Tickets`, `EmailQueue`, `AskEmails`, `Activity` — read context, pass into hooks.
