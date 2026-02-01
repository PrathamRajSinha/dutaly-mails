

# Email AI Enhancement Plan

## Overview

This plan addresses three major enhancements:
1. **Auto-reply functionality** - Automatically send replies for high-confidence emails
2. **Greeting auto-response** - Handle simple greetings without knowledge base entries
3. **Knowledge Base file uploads** - Support for PDFs, Word docs, PPTs, images, and text

---

## 1. Auto-Reply System

### Current State
- The `process-email` function already detects when to reply (confidence >= 0.7)
- The `auto_reply_enabled` setting exists in `ai_instructions`
- Gmail OAuth already has `gmail.send` scope

### What Needs to Change

**A. Create `send-gmail-reply` Edge Function**
- Accept email_id, recipient, subject, and reply body
- Use Gmail API to send the reply
- Handle OAuth token refresh if needed
- Mark the original email as read

**B. Update `fetch-gmail-emails` Function**
- When `process-email` returns `action: "reply"` AND `auto_send: true`
- Call the new `send-gmail-reply` function
- Log the auto-sent reply in activity_logs

**C. Add Auto-Reply Threshold Setting**
- Add `auto_reply_confidence_threshold` column to `ai_instructions` (default: 0.8)
- Only auto-send when confidence exceeds this threshold
- Add UI slider in Instructions page to configure

---

## 2. Greeting Auto-Response (No Knowledge Base Needed)

### Current Behavior
Simple greetings like "Hi" or "Hello" get low confidence because they don't match knowledge base entries.

### Solution

**A. Update `process-email` Prompt**
Add special handling in the AI system prompt:
- Recognize common greetings: "hi", "hello", "hey", "good morning/afternoon/evening"
- Set `intent: "greeting"` for these cases
- Generate a friendly, contextual greeting response
- Set high confidence (0.95) for clear greetings
- No knowledge base lookup required for greetings

**B. Add Greeting Templates to AI Instructions**
- Add `greeting_template` column to `ai_instructions`
- Default: "Hello! Thank you for reaching out. How can I assist you today?"
- Users can customize their greeting response

---

## 3. Knowledge Base File Uploads

### Current State
- Only text-based entries (title + content)
- `storage_path` column exists but unused
- `kb-documents` storage bucket exists

### Implementation

**A. Database Schema Changes**
Add columns to `knowledge_base_entries`:
- `file_type`: text (pdf, docx, pptx, txt, image, text)
- `file_name`: text (original filename)
- `extracted_text`: text (for search and AI context)

**B. Create `parse-document` Edge Function**
- Accept uploaded file from storage
- Use document parsing logic based on file type:
  - **PDF/Word/PPT**: Extract text content
  - **Images**: Use OCR or describe as image attachment
  - **Text files**: Direct text extraction
- Store extracted text in `extracted_text` column

**C. Update Knowledge Base UI**
- Add file upload input (accept: .pdf, .doc, .docx, .ppt, .pptx, .txt, .jpg, .png)
- Upload to `kb-documents` bucket
- Call `parse-document` function after upload
- Show file preview/icon based on type
- Allow adding text description alongside files

**D. Update `process-email` Function**
- Fetch `extracted_text` from file-based entries
- Include in knowledge context sent to AI

---

## Technical Details

### New Database Columns

```text
ai_instructions:
  + auto_reply_confidence_threshold (numeric, default 0.8)
  + greeting_response_enabled (boolean, default true)
  + greeting_template (text, default greeting message)

knowledge_base_entries:
  + file_type (text, nullable)
  + file_name (text, nullable)
  + extracted_text (text, nullable)
```

### New Edge Functions

1. **send-gmail-reply** - Send email replies via Gmail API
2. **parse-document** - Extract text from uploaded files

### Modified Files

| File | Changes |
|------|---------|
| `supabase/functions/process-email/index.ts` | Add greeting detection, use extracted_text |
| `supabase/functions/fetch-gmail-emails/index.ts` | Trigger auto-reply when conditions met |
| `src/pages/Instructions.tsx` | Add greeting settings, confidence threshold slider |
| `src/pages/KnowledgeBase.tsx` | Add file upload UI, show file types |
| `src/hooks/useKnowledgeBase.ts` | Handle file uploads, parse documents |

---

## User Experience Flow

### Auto-Reply Flow
```text
Email received
    |
    v
AI classifies email
    |
    +--> Low confidence --> Add to queue
    |
    +--> Greeting detected --> Generate greeting response
    |           |
    |           +--> Auto-reply enabled? --> Send reply
    |
    +--> High confidence --> Generate reply from KB
                |
                +--> Confidence > threshold AND auto-reply enabled?
                        |
                        +--> Yes --> Send reply automatically
                        |
                        +--> No --> Add to queue with suggested reply
```

### File Upload Flow
```text
User clicks "Add Entry"
    |
    v
Choose: "Text Entry" or "Upload File"
    |
    +--> Text Entry --> Current flow
    |
    +--> Upload File --> Select file
                |
                v
            Upload to storage bucket
                |
                v
            Call parse-document function
                |
                v
            Extract text content
                |
                v
            Create entry with file_type, file_name, extracted_text
```

---

## Implementation Status

| Step | Status |
|------|--------|
| 1. Database migrations (add new columns) | ✅ Done |
| 2. `send-gmail-reply` edge function | ✅ Done |
| 3. Update `process-email` with greeting detection | ✅ Done |
| 4. Update `fetch-gmail-emails` for auto-sending | ✅ Done |
| 5. Instructions page UI updates | ✅ Done |
| 6. `parse-document` edge function | ✅ Done |
| 7. Knowledge Base file upload UI | ✅ Done |

