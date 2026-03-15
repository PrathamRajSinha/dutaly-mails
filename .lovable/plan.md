

# Comprehensive Feature Overhaul Plan

This is a very large set of changes spanning removals, UI changes, new database tables, new edge functions, and significant frontend work. I recommend breaking this into **3 implementation phases** to avoid errors and keep changes reviewable.

---

## Phase 1: Removals & Simplifications

### 1A. Remove Outlook OAuth Integration
- Delete `supabase/functions/outlook-auth-init/index.ts` and `supabase/functions/outlook-auth-callback/index.ts`
- Remove Outlook entry from `supabase/config.toml`
- Remove `handleConnectOutlook` function and the Outlook card (lines 528-698) from `src/pages/Settings.tsx`
- Remove `outlook` references in `ConnectedAccountCard` (the blue-100 color case)

### 1B. Remove Template Over-Branding Controls
- In `src/pages/Templates.tsx`, remove the Font Family selector (lines 258-268), Font Size selector (lines 269-279), and Text Color picker (lines 283-297) from the create/edit dialog
- Remove the font/size/color display from template cards (lines 188-196)
- Keep: accent color picker, footer logo URL, footer text, body editor, placeholder system, live preview
- Update `defaultTemplate` to remove font_family, font_size, text_color defaults (keep them as DB defaults but hide from UI)

### 1C. Simplify Instruction Builder to Flat List
- Rewrite `src/components/instructions/InstructionBuilder.tsx`:
  - Remove parent/child hierarchy (no sub-rules, no nesting)
  - Remove "important" and "low" priority levels — keep only "Critical" and "Normal"
  - Remove color-coded visual decorations and condition buttons (IF/WHEN/UNLESS/ALWAYS/NEVER)
  - Replace with a clean flat list: text input + priority dropdown (Critical/Normal) + Add button
  - Each rule shows: text, priority badge, toggle, delete button
- Update `src/hooks/useInstructionRules.ts`:
  - Simplify `compileRulesToPrompt` to only handle Critical vs Normal (no parent/child)
  - Keep the AI magic wand expansion feature
- Keep the Do/Don't rules, tone, length, signature, auto-reply, confidence threshold, SLA, escalation email — all untouched

### 1D. Hide "Ask Me Anything" from Navigation
- Remove the AMA entry from `navItems` in `src/components/layout/AppSidebar.tsx`
- In `src/App.tsx`, wrap the `/ask` route with a redirect guard component that shows a "Coming soon" toast and redirects to `/dashboard`
- Keep the route and `AskEmails` page code intact
- Keep the `ask-about-emails` edge function

---

## Phase 2: Core New Features

### 2A. Guided Onboarding Wizard

**Database changes:**
- Add `onboarding_completed` boolean column to `profiles` table (default false)

**New edge function:** `generate-kb-from-url`
- Accepts a URL, fetches content (using fetch API), uses Gemini AI to extract 5-10 structured Q&A knowledge base entries
- Returns draft entries for user review
- Requires `GEMINI_API_KEY` secret (check if exists — the `process-email` function likely already uses it)

**New page:** `src/pages/Onboarding.tsx`
- Full-screen stepper with 4 steps:
  1. **Inbox Connected** — auto-marked complete, shows checkmark
  2. **Build Knowledge Base** — URL input field, "Generate" button calls `generate-kb-from-url`, shows generated entries inline with edit/delete, confirm button saves to KB. "Skip" option
  3. **Set Confidence Threshold** — large slider (50-100%, default 75%), dynamic plain-English explanation that changes at 90%/75%/60% breakpoints
  4. **Done** — summary + "Meet Your AI Agent →" CTA redirects to dashboard, sets `onboarding_completed = true`

**Routing:** Add `/onboarding` route. Update `ProtectedRoute` to check `onboarding_completed` — if false and subscription active, redirect to `/onboarding` instead of dashboard.

### 2B. Auto-Reply Unsend Window

**Database changes:**
- Add `unsend_window_seconds` integer column to `ai_instructions` (default 60)
- Add `send_disposition` text column to `activity_logs` (values: 'immediate', 'cancelled', 'user_approved', null)

**Frontend:**
- Create a global `UnsendToastProvider` component (mounted in `AppLayout`)
- When `process-email` auto-sends, instead of sending immediately, insert into `email_queue` with status `sending` and a `scheduled_send_at` timestamp
- Show a persistent toast with countdown: "AI is sending a reply to [customer] in 60s — [View] [Cancel]"
- Cancel: update email_queue status to `pending` (needs review)
- View: navigate to ticket detail
- After countdown: trigger actual send via existing send functions
- In Settings, add unsend window dropdown (30s / 60s / 2min / Off)

### 2C. Resolution Rate Dashboard Metric

**Frontend changes to `src/pages/Dashboard.tsx`:**
- Query tickets to count `resolved` (auto-resolved) vs `escalated` (open/pending) this month
- Add a large hero card at top with donut chart showing resolution rate %
- Subtext: "Your AI agent fully handled X% of customer emails this month without you."
- Month-over-month change indicator
- If rate < 40%, show soft prompt linking to KB

**No new tables needed** — derive from existing `tickets` and `activity_logs` data.

### 2D. Per-Category Confidence Thresholds

**Database changes:**
- New table `category_thresholds`:
  - `id` uuid PK
  - `user_id` uuid NOT NULL
  - `category` text NOT NULL
  - `confidence_threshold` numeric NOT NULL
  - `created_at`, `updated_at` timestamps
  - UNIQUE on (user_id, category)
  - RLS: user can CRUD own rows

**Frontend:**
- Add a "Category Thresholds" section in `/instructions` (column 2)
- Table with rows per category (derived from existing ticket categories)
- Each row: category name, threshold slider, auto-reply rate this month
- Default: inherit global threshold (shown as placeholder)

**Backend:**
- Update `process-email` edge function to check `category_thresholds` table for category-specific overrides before applying global threshold

---

## Phase 3: Advanced Features

### 3A. Knowledge Base Gap Detection

**Database changes:**
- New table `kb_gap_events`:
  - `id` uuid PK
  - `user_id` uuid NOT NULL
  - `ticket_id` uuid references tickets
  - `detected_topic` text NOT NULL
  - `category` text
  - `resolved` boolean DEFAULT false
  - `created_at` timestamp
  - RLS: user CRUD own rows

**Backend:**
- Update `process-email` to insert into `kb_gap_events` when confidence is below threshold and no KB match

**Frontend in `/knowledge-base`:**
- Add "Gaps Detected" tab
- Grouped list by topic, ordered by frequency
- "Generate Entry" button calls AI to draft a KB entry
- On save, mark gap as resolved
- Counter: "Resolving these gaps could auto-handle ~X more emails per month"

### 3B. Auto-Reply Audit Log

**Frontend in `/tickets`:**
- Add "Auto-Sent" tab to status tabs
- Filter tickets/email_queue where action = 'auto_sent' or 'auto_replied'
- For each: customer, subject, timestamp, confidence score, KB entry used, expandable preview
- "This was wrong" flag button: adds sender to manual-only list, moves to review queue
- In `TicketDetailPanel`, show which KB entry was referenced (from `email_queue.details`)

**Database:**
- Add `manual_only_senders` text array to `ai_instructions` for sender blacklist from wrong flags

### 3C. Angry Customer Auto-Escalation

**Frontend:**
- In `/tickets`, add a pinned "Needs Immediate Attention" section at top for tickets with `escalation_flag = true` and angry sentiment
- Red "Angry Customer" badge on ticket row and detail panel
- Auto-pause auto-reply for that thread

**Backend:**
- Update `process-email`: when sentiment indicates angry, set `escalation_flag = true`, never auto-reply regardless of confidence
- Dispatch `ticket.angry_detected` integration event (already exists in framework)

### 3D. Per-Resolution Usage Tracking

**Database changes:**
- Add columns to `usage_tracking`: `resolutions_used` integer DEFAULT 0
- Add columns to `subscription_plans`: `resolutions_limit` integer DEFAULT -1, `overage_rate_per_resolution` numeric DEFAULT 0

**Backend:**
- Update `process-email` or send functions to increment `resolutions_used` when auto-reply is sent

**Frontend:**
- Update `UsageCard` to show resolutions used/remaining/projected
- Progress bar: orange at 80%, red at 95%
- Persistent upgrade banner at 95%

---

## Summary of Files Changed

**Deleted:** 2 edge functions (outlook-auth-init, outlook-auth-callback)

**New files:**
- `src/pages/Onboarding.tsx`
- `supabase/functions/generate-kb-from-url/index.ts`
- `src/components/UnsendToastProvider.tsx`

**Modified files:**
- `src/App.tsx` — new routes, onboarding redirect
- `src/pages/Settings.tsx` — remove Outlook, add unsend window setting
- `src/pages/Templates.tsx` — remove font/size/color controls
- `src/pages/Instructions.tsx` — add category thresholds section
- `src/pages/Dashboard.tsx` — resolution rate hero card, updated usage
- `src/pages/Tickets.tsx` — auto-sent tab, angry customer section
- `src/pages/KnowledgeBase.tsx` — gaps detected tab
- `src/components/instructions/InstructionBuilder.tsx` — flatten to simple list
- `src/components/layout/AppSidebar.tsx` — remove AMA nav item
- `src/components/ProtectedRoute.tsx` — onboarding check
- `src/components/tickets/TicketDetailPanel.tsx` — KB reference, angry badge
- `src/components/dashboard/UsageCard.tsx` — resolutions tracking
- `src/hooks/useInstructionRules.ts` — simplify compiler
- `src/hooks/useSubscription.ts` — resolutions tracking
- `supabase/config.toml` — remove Outlook entries
- `supabase/functions/process-email/index.ts` — category thresholds, gap detection, angry handling

**New DB tables:** `category_thresholds`, `kb_gap_events`
**Modified DB tables:** `profiles`, `ai_instructions`, `activity_logs`, `usage_tracking`, `subscription_plans`

This plan preserves all existing Gmail, IMAP, KB, SLA, Slack, webhook, ticket, and auth functionality. Shall I proceed with Phase 1 first?

