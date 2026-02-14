

## Rich Email Template System with Attachments

### What You Get

- A new **Templates** page in the sidebar for creating and managing reusable email templates
- **Rich styling per template**: font family, font size, text color, accent color, and a customizable footer (text + optional logo)
- **Placeholder variables** like `{{sender_name}}`, `{{subject}}` that auto-fill when used
- **File attachments** when composing/editing replies in the Email Queue (upload files to attach to outgoing emails)
- A **"Use Template"** button when composing replies to pre-fill with a styled template
- **Live preview** of how the email will look
- Replies sent with templates go out as **styled HTML emails**

### How It Works

1. Go to the new **Templates** page, click "Create Template"
2. Set a name, category, body text, and visual styling (font, colors, footer)
3. A live preview shows how the email will look to recipients
4. In the **Email Queue**, when composing or editing a reply:
   - Click **"Use Template"** to pick a template -- the reply fills in with variables replaced
   - Click **"Attach File"** to upload files (PDFs, images, docs) that will be sent with the email
5. When sent, the email goes out as a styled HTML email with any attachments included

### Template Styling Options

- **Font family**: Sans-serif, Serif, Monospace
- **Font size**: Small (13px), Medium (15px), Large (17px)
- **Text color**: Color picker (default: dark gray)
- **Accent color**: Color picker (default: indigo) -- used for links, dividers
- **Footer text**: Custom text appended to every email using this template
- **Footer logo URL**: Optional logo image in the footer

---

### Technical Details

**1. Database: New `email_templates` table**

```text
email_templates
- id (uuid, PK, default gen_random_uuid())
- user_id (uuid, NOT NULL)
- name (text, NOT NULL)
- category (text, default 'general')
- body (text, NOT NULL)
- font_family (text, default 'sans-serif')
- font_size (text, default 'medium')
- text_color (text, default '#333333')
- accent_color (text, default '#4F46E5')
- footer_text (text, default '')
- footer_logo_url (text, default '')
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
```

RLS policies: users can only CRUD their own templates (policy on `user_id = auth.uid()`).

**2. Storage: New `email-attachments` bucket**

A public Supabase Storage bucket for uploaded attachments, with RLS so users can only manage their own files. Files stored under `{user_id}/{uuid}_{filename}`.

**3. New files to create:**

- `src/hooks/useEmailTemplates.ts` -- TanStack Query hook for template CRUD (following `useKnowledgeBase` pattern)
- `src/pages/Templates.tsx` -- Full management page: list templates, create/edit dialog with styling controls and live preview
- `src/components/email-templates/TemplatePickerDialog.tsx` -- Dialog for picking a template in Email Queue
- `src/lib/emailHtml.ts` -- Utility to render template body + styling into an inline-CSS HTML email string

**4. Modified files:**

- `src/components/layout/AppSidebar.tsx` -- Add "Templates" nav item (between Instructions and Email Queue)
- `src/App.tsx` -- Add `/templates` route
- `src/pages/EmailQueue.tsx` -- Major changes to EmailCard:
  - Add "Use Template" button that opens the template picker dialog
  - Add "Attach File" button with file input (uploads to `email-attachments` bucket)
  - Show attached files as removable chips below the compose/edit textarea
  - Pass attachment URLs and HTML body to the send functions
- `supabase/functions/send-gmail-reply/index.ts` -- Support `html_body` field and file attachments:
  - When `html_body` is provided, set `Content-Type: multipart/mixed` with `text/html` part
  - Download attachment files from storage and encode as base64 MIME attachment parts
  - Build full multipart MIME message with both HTML body and file attachments
- `supabase/functions/send-imap-reply/index.ts` -- Same changes for SMTP sending:
  - Support `html_body` field (use `html` content property in denomailer)
  - Support `attachments` array (download from storage, attach via denomailer's attachment API)

**5. HTML email rendering (`src/lib/emailHtml.ts`)**

Converts template body + styling into inline-CSS HTML suitable for email clients:

```text
<div style="font-family: {font-stack}; font-size: {size}; color: {textColor}; max-width: 600px;">
  <div style="white-space: pre-wrap;">{body with variables replaced}</div>
  <hr style="border-color: {accentColor}; margin: 24px 0;" />
  <div style="font-size: 12px; color: #999;">
    {footerLogoUrl ? <img src="..." style="max-height: 40px;" /> : ""}
    <p>{footerText}</p>
  </div>
</div>
```

Same renderer used for the live preview on the Templates page and passed to edge functions when sending.

**6. Attachment flow**

- User clicks "Attach File" in the Email Queue reply area
- File is uploaded to `email-attachments` bucket under `{user_id}/{uuid}_{filename}`
- The public URL and filename are stored in local component state as an array
- When sending, the attachment URLs are passed to the edge function
- The edge function downloads each file, base64-encodes it, and includes it as a MIME attachment
- For Gmail: multipart/mixed raw message with attachment parts
- For IMAP/SMTP: denomailer's built-in attachment support

**7. Variable replacement**

When a template is selected, these placeholders are auto-replaced:
- `{{sender_name}}` -> `email.from_name` or first part of `email.from_address`
- `{{subject}}` -> `email.subject`
- `{{my_name}}` -> user's profile full_name
- `{{date}}` -> current date formatted

