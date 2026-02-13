

## Add GoDaddy to IMAP Auto-Detection System

### What will change

When you type a GoDaddy-hosted email address in the IMAP connection form, the app will:
1. **Auto-fill the server settings** (IMAP host, port, SMTP host, port) so you don't have to type them manually
2. **Show a help link** below the password field pointing to GoDaddy's email setup documentation

### Details

**Server presets to add:**
- IMAP: `imap.secureserver.net` (Port 993)
- SMTP: `smtpout.secureserver.net` (Port 465)

**Domains covered:** `secureserver.net`, `godaddy.com`, and common GoDaddy workspace domains

**Help link:** Will point to GoDaddy's email client setup page with a note that you should use your regular GoDaddy email password

### Technical Changes

Only one file needs to be modified: `src/pages/Settings.tsx`

1. Add GoDaddy entries to `PROVIDER_PRESETS` (auto-fills IMAP/SMTP host and port fields)
2. Add GoDaddy entries to `APP_PASSWORD_LINKS` (shows help link below the password field)
3. Since GoDaddy uses standard passwords (not app passwords), the help text will say "Use your GoDaddy email password" with a link to their support page

