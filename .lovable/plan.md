## Goal

Replace the current ad-hoc connect UI in Settings with a guided, step-by-step "Connect your inbox" flow. Gmail is the primary path (OAuth) with IMAP as the fallback. Each step clearly shows what permissions are requested and what's verified.

## Where it lives

- New component: `src/components/inbox-connect/ConnectInboxWizard.tsx` (Dialog-based, reusable).
- Triggered from:
  - `Settings → Email accounts` "Connect inbox" button
  - `OnboardingBanner` "Connect your email" step
  - `WelcomeWizard` first step
- New hook: `src/hooks/useInboxConnection.ts` to encapsulate OAuth init, IMAP test, and account status polling.
- New edge function: `supabase/functions/test-imap-connection` — validates IMAP/SMTP creds before saving (returns ok / specific error code).

## Wizard steps

```text
[1] Choose provider
    ├─ Gmail (recommended)  → OAuth flow
    └─ Other (IMAP/SMTP)    → manual form
[2] Review permissions
    ├─ Gmail: list scopes (read, send, labels, email) with plain-English
    │         descriptions + "Why we need this"
    └─ IMAP:  show host/port auto-fill + app-password helper link
[3] Authorize / Authenticate
    ├─ Gmail: open Google popup via gmail-auth-init; wait for callback
    └─ IMAP:  call test-imap-connection edge fn, show inline error if fails
[4] Verification & status checks
    ├─ Account row created (email_accounts)
    ├─ IMAP/SMTP reachable (for IMAP) OR token stored (for Gmail)
    ├─ Test fetch of last 1 email (calls fetch-gmail-emails or fetch-imap-emails with limit=1)
    └─ Show pass/fail per check with retry
[5] Success
    └─ "Inbox connected" + CTA to KB step / inbox
```

Each step is a discrete panel inside one Dialog with a progress header (`1/5 … 5/5`) and a back button. Status checks in step 4 render as a checklist with `Loader2 → Check → AlertTriangle` states.

## Permission copy (Gmail)

Render scopes as cards, not raw URLs:

- **Read your emails** — `gmail.readonly` — so Dutaly can classify and draft replies.
- **Send replies on your behalf** — `gmail.send` — only after you approve or via auto-reply rules you control.
- **Manage labels** — `gmail.labels` — to mark threads as handled.
- **Your email address** — `userinfo.email` — to identify the connected inbox.

Include "You can revoke anytime in Google Account → Security" link.

## IMAP fallback

- Auto-detect host/port from domain via existing `PROVIDER_PRESETS`.
- Show app-password helper using existing `APP_PASSWORD_LINKS` when applicable.
- New `test-imap-connection` edge fn performs:
  1. IMAP LOGIN
  2. SMTP EHLO + AUTH
  3. Returns `{ imap: 'ok'|'auth_failed'|'host_unreachable', smtp: ... }`
- Only on both `ok` do we insert into `email_accounts`.

## Status checks after connect

After step 4 success, the wizard surfaces ongoing status indicators (also shown on Settings account row):

- **Connected** — row exists, `is_active=true`
- **Token valid** (Gmail) — last token refresh < 7d
- **Last fetch** — `last_synced_at` timestamp from `email_accounts` (add column via migration)
- **Auto-fetch** — green if polling has run within last 15m

A small "Re-test connection" button re-runs the step-4 checks on demand.

## Files to create / change

```text
src/components/inbox-connect/
  ConnectInboxWizard.tsx         (new)
  ProviderStep.tsx               (new)
  PermissionsStep.tsx            (new)
  AuthorizeStep.tsx              (new)
  VerifyStep.tsx                 (new)
  SuccessStep.tsx                (new)
  ScopeCard.tsx                  (new, small presentational)
src/hooks/useInboxConnection.ts  (new)
supabase/functions/test-imap-connection/index.ts  (new)
supabase/migrations/<ts>_email_accounts_last_synced.sql  (adds last_synced_at, last_status)
src/pages/Settings.tsx           (replace inline IMAP form with wizard trigger)
src/components/dashboard/OnboardingBanner.tsx  (link step 1 to wizard)
src/components/WelcomeWizard.tsx (use wizard for the email step)
```

## Out of scope

- No changes to existing `gmail-auth-init` / `gmail-auth-callback` logic — wizard reuses them.
- No changes to AI/processing logic.
- Outlook stays excluded (per project memory).