Add Gmail as an IMAP preset so users can connect Gmail accounts via app password (in addition to the existing OAuth flow).

## Changes

**`src/components/inbox-connect/presets.ts`**
- Add `"gmail.com": { imap_host: "imap.gmail.com", imap_port: 993, smtp_host: "smtp.gmail.com", smtp_port: 465 }` to `PROVIDER_PRESETS`.
- Add `"googlemail.com"` with the same Gmail server settings.
- Add `"gmail.com"` (and `googlemail.com`) to `APP_PASSWORD_LINKS` pointing to `https://myaccount.google.com/apppasswords` with a note that 2-Step Verification must be enabled first.

**`src/pages/Settings.tsx`**
- Mirror the same two entries in the duplicate `PROVIDER_PRESETS` and `APP_PASSWORD_LINKS` maps defined inline in this file (lines 49 and 61), so the legacy Settings IMAP form also recognizes Gmail.

## Notes
- No edge function changes — `fetch-imap-emails` / `send-imap-reply` already work against any IMAP/SMTP host.
- The ConnectInboxWizard auto-detect-by-domain logic will automatically pick up the new entry; Gmail addresses entered on the IMAP path will auto-fill host/port and show the app-password helper link.
- OAuth remains the recommended default for Gmail; this just enables app-password fallback for users who prefer it (or whose Workspace admin blocks OAuth).