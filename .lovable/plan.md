## Features to Add

### 1. Send Later
- **DB**: Add `scheduled_send_at` (timestamptz, nullable) to `email_queue` table
- **UI**: In the Inbox reply composer, add a "Send Later" button with a date/time picker
- **Logic**: Emails with `scheduled_send_at` in the future get status `scheduled`; the existing send flow checks this before dispatching

### 2. Instant Reply (Quick Reply Templates)
- **UI**: In the Inbox detail panel, add quick-reply chips (e.g., "Reviewing", "Need time", "Thank you") above the compose area
- **Logic**: Clicking a chip populates the reply textarea with a pre-written response; user can edit before sending
- **No DB change needed** — uses hardcoded quick replies initially (can extend to user-customizable later)

### 3. Snooze Emails
- **DB**: Add `snoozed_until` (timestamptz, nullable) to `email_queue` table
- **UI**: Add a "Snooze" button in the Inbox detail panel with preset options (1 hour, 3 hours, tomorrow, next week)
- **Logic**: Snoozed emails are hidden from the inbox until `snoozed_until` passes

### 4. Keyboard Shortcuts
- **UI**: Global keyboard shortcut handler in the Inbox page
- **Shortcuts**: `e` = archive/resolve, `r` = reply, `s` = snooze, `j/k` = navigate up/down in list, `?` = show shortcut help modal
- **No DB change needed**

### 5. Landing Page Bento Cards
- Update the FeaturesSection bento grid to include cards for all 4 features with mockup visuals matching the reference image style

### Migration needed
- Add `scheduled_send_at` and `snoozed_until` columns to `email_queue`
