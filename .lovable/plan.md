

# IMAP/SMTP Email Support for Any Provider

## Overview
Add support for connecting any email provider (Yahoo, ProtonMail, custom domains, etc.) via standard IMAP/SMTP credentials. Users will enter their email server settings manually, and the system will fetch and send emails using these protocols.

## What Changes

### 1. Database: New columns on `email_accounts`
Add columns to store IMAP/SMTP server settings:
- `imap_host` (text, nullable) -- e.g. "imap.yahoo.com"
- `imap_port` (integer, nullable) -- e.g. 993
- `smtp_host` (text, nullable) -- e.g. "smtp.yahoo.com"
- `smtp_port` (integer, nullable) -- e.g. 587
- `imap_password` (text, nullable) -- the app password / account password (encrypted at rest by Supabase)

For IMAP/SMTP accounts, `provider` will be set to `"imap"` and `access_token`/`refresh_token` remain unused.

### 2. Settings Page: New "Other Email" connection card
Add a third card alongside Gmail and Outlook with a form for:
- Email address
- IMAP host + port (with common presets like Yahoo, AOL auto-filled)
- SMTP host + port
- Password (app password)
- A "Test Connection" button that validates before saving

### 3. Edge Function: `fetch-imap-emails`
A new edge function that:
- Connects to the IMAP server using a Deno-compatible IMAP library
- Fetches recent unread emails
- Passes each email to the existing `process-email` function (same AI pipeline)
- Deduplicates using `external_email_id` (IMAP message UID)

### 4. Edge Function: `send-imap-reply`
A new edge function that:
- Connects to the SMTP server
- Sends the reply email
- Reuses the same interface as `send-gmail-reply` so the queue page works identically

### 5. Update Existing Code
- `ConnectedAccountCard` in Settings: show "Fetch Emails" for IMAP accounts too (calling `fetch-imap-emails`)
- `fetch-gmail-emails`: no changes needed (stays Gmail-specific)
- Email Queue page: route "Send" actions to the correct send function based on account provider
- Update TypeScript types for the new provider option

## Technical Details

### Deno IMAP/SMTP Libraries
- IMAP: Use `denoimap` or a raw TCP/TLS connection with IMAP protocol commands (Deno supports `Deno.connectTls`)
- SMTP: Use `denomailer` (well-maintained Deno SMTP client)

### Security Considerations
- Passwords stored in `email_accounts` table which has RLS (user can only see their own)
- Service role key used in edge functions to read credentials
- IMAP/SMTP connections always use TLS (port 993 for IMAP, 587/465 for SMTP)

### Common Provider Presets
When the user types their email, auto-detect the provider and pre-fill server settings:
- Yahoo: imap.mail.yahoo.com:993 / smtp.mail.yahoo.com:587
- AOL: imap.aol.com:993 / smtp.aol.com:587
- iCloud: imap.mail.me.com:993 / smtp.mail.me.com:587
- Zoho: imap.zoho.com:993 / smtp.zoho.com:587
- Custom: user fills in manually

### Files to Create
- `supabase/functions/fetch-imap-emails/index.ts`
- `supabase/functions/send-imap-reply/index.ts`

### Files to Modify
- `src/pages/Settings.tsx` -- add IMAP connection form card
- `src/pages/EmailQueue.tsx` -- route send action by provider
- `src/hooks/useEmailAccounts.ts` -- update provider type
- `src/integrations/supabase/types.ts` -- auto-updated after migration
- `supabase/config.toml` -- add new function entries

### Migration SQL
```sql
ALTER TABLE email_accounts
  ADD COLUMN imap_host text,
  ADD COLUMN imap_port integer DEFAULT 993,
  ADD COLUMN smtp_host text,
  ADD COLUMN smtp_port integer DEFAULT 587,
  ADD COLUMN imap_password text;
```

