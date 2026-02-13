

# Add App Password Helper Text and Links to IMAP Form

## Overview
Enhance the IMAP setup form's password field with contextual helper text that detects the user's email domain and shows a direct link to that provider's app password generation page.

## What Changes

### 1. Provider-specific help links
Add a mapping of email domains to their app password setup URLs:
- **Yahoo**: https://login.yahoo.com/account/security/app-passwords
- **AOL**: https://login.aol.com/account/security/app-passwords  
- **iCloud/me.com**: https://appleid.apple.com/account/manage (Security > App-Specific Passwords)
- **Zoho**: https://accounts.zoho.com/home#security/security_pwd
- **ProtonMail**: Note that ProtonMail Bridge is required (link to https://proton.me/mail/bridge)
- **Fallback (custom domains)**: Generic text explaining what an app password is

### 2. Dynamic helper text under the password field
Replace the current static helper text (line 266-268) with a component that reacts to the email input:
- When no email is entered: show generic "Use an app-specific password for better security"
- When a known domain is detected (e.g. yahoo.com): show "Yahoo requires an App Password. Generate one here" with a direct link opening in a new tab
- When an unknown domain is entered: show "Check your email provider's settings for an app-specific password option"

### 3. File to modify
- `src/pages/Settings.tsx` -- update the `ImapConnectionForm` component:
  - Add an `APP_PASSWORD_LINKS` constant mapping domains to `{ label, url, note }` objects
  - Add a helper function `getAppPasswordHelp(email)` that returns the appropriate guidance
  - Replace the static `<p>` under the password input with the dynamic helper including an external link icon and anchor tag

## Technical Details

The change is entirely within `ImapConnectionForm` (lines 136-286 of Settings.tsx). A new constant `APP_PASSWORD_LINKS` will be added alongside `PROVIDER_PRESETS`, and the password field's helper text will become reactive based on the `email` state variable that already exists and drives auto-detection.

