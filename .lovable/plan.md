

# Auto-Fetch, Email Threads, and "Ask Me Anything" Feature

## Overview
Three interconnected features: (1) automatic email fetching every 10 seconds, (2) email thread/conversation tracking so the AI and user can see the full mail history, and (3) a new "Ask Me Anything" section where users can query the AI about their emails within a date range.

---

## 1. Auto-Fetch Emails Every 10 Seconds

### Approach
Add an auto-fetch mechanism using `setInterval` inside the Email Queue page. A toggle lets the user enable/disable auto-fetching. When enabled, emails are fetched every 10 seconds silently (no toast spam), with a guard to prevent overlapping fetches.

### Changes
- **`src/pages/EmailQueue.tsx`**: Add `useEffect` with a 10-second interval that calls the existing fetch logic. Add a toggle button (play/pause) next to "Fetch New Emails". Suppress toasts during auto-fetch (only show on manual fetch). Add a ref to prevent concurrent fetches.
- **`src/pages/Dashboard.tsx`**: Optionally add the same auto-fetch interval here so the dashboard stats stay live.

---

## 2. Email Thread Awareness

### Approach
Add a `thread_id` column to `email_queue` so emails in the same conversation are grouped. When expanding an email, show the full thread history. The Gmail API already provides `threadId`; for IMAP, we derive threads from `In-Reply-To` / `References` headers or subject line matching.

### Database Migration
```sql
ALTER TABLE email_queue
  ADD COLUMN thread_id text;

CREATE INDEX idx_email_queue_thread_id ON email_queue(thread_id);
```

### Changes
- **`supabase/functions/fetch-gmail-emails/index.ts`**: Pass `threadId` from Gmail API into `process-email` call. When processing, also fetch other messages in the same Gmail thread to provide conversation context.
- **`supabase/functions/fetch-imap-emails/index.ts`**: Extract `In-Reply-To` / `References` headers to derive a thread ID. Fall back to subject-line matching (strip "Re: " prefix).
- **`supabase/functions/process-email/index.ts`**: Accept `thread_id` parameter. Store it in `email_queue`. When generating AI replies, fetch previous emails in the same thread from the database and include them as conversation context so the AI can see the full history.
- **`src/hooks/useEmailQueue.ts`**: Update the `QueuedEmail` type to include `thread_id`.
- **`src/pages/EmailQueue.tsx`**: When expanding an email that has a `thread_id`, query for all emails with the same `thread_id` and display them as a conversation timeline above the current email.

---

## 3. "Ask Me Anything" Section

### Approach
Add a new page accessible from the sidebar where users can chat with the AI about their emails. The user selects a start and end date, and the AI gets all emails from that range as context. The user types questions and gets answers in a chat-style interface.

### New Edge Function: `ask-about-emails`
- Accepts: `question`, `start_date`, `end_date`
- Fetches all emails from `email_queue` within the date range for the authenticated user
- Sends the emails as context + the user's question to the AI (Lovable AI Gateway)
- Returns the AI's answer

### New Files
- **`supabase/functions/ask-about-emails/index.ts`**: The edge function that queries emails by date range and sends them as context to the AI along with the user's question.
- **`src/pages/AskEmails.tsx`**: New page with:
  - Date range picker (start and end date) using the existing Calendar/Popover components
  - Chat-style message list (user questions + AI answers)
  - Input field at the bottom to type questions
  - Loading state while AI processes
  - Example prompt suggestions (e.g., "Summarize all support emails", "What unresolved questions do I have?")

### Other Changes
- **`src/App.tsx`**: Add route `/ask` for the new page
- **`src/components/layout/AppSidebar.tsx`**: Add "Ask Me Anything" nav item with a `MessageSquare` icon between Email Queue and Settings
- **`supabase/config.toml`**: Add `ask-about-emails` function entry

---

## Technical Details

### Auto-Fetch Implementation
```text
useEffect:
  if (!autoFetchEnabled) return
  interval = setInterval(fetchEmails, 10000)
  return () => clearInterval(interval)
```
- Uses a `useRef` flag (`isFetchingRef`) to skip if a fetch is already in progress
- No toasts during auto-fetch; only updates the query cache silently
- Visual indicator showing "Auto-fetch: ON" with a pulsing dot

### Thread Context for AI
When processing an email with a `thread_id`, the `process-email` function will:
1. Query `email_queue` for all emails with the same `thread_id`
2. Sort them chronologically
3. Include them in the AI prompt as "CONVERSATION HISTORY" before the current email
4. This lets the AI generate contextually aware replies

### Ask Me Anything - AI Prompt Structure
```text
System: You are an email analyst. Answer questions about the user's emails.
Context: [All emails from date range, formatted as: Date | From | Subject | Body]
User: [The user's question]
```

### Files Summary

| File | Action |
|------|--------|
| `src/pages/EmailQueue.tsx` | Edit - add auto-fetch with interval |
| `src/pages/Dashboard.tsx` | Edit - add auto-fetch |
| `src/hooks/useEmailQueue.ts` | Edit - add thread_id to type |
| `supabase/functions/fetch-gmail-emails/index.ts` | Edit - pass threadId |
| `supabase/functions/fetch-imap-emails/index.ts` | Edit - extract thread headers |
| `supabase/functions/process-email/index.ts` | Edit - accept thread_id, fetch thread context |
| `supabase/functions/ask-about-emails/index.ts` | Create - new edge function |
| `src/pages/AskEmails.tsx` | Create - new page |
| `src/App.tsx` | Edit - add /ask route |
| `src/components/layout/AppSidebar.tsx` | Edit - add nav item |
| `supabase/config.toml` | Edit - add function entry |

