# Project Architecture Rules

- Use semantic Tailwind theme tokens for shared app surfaces and controls so light and dark modes remain consistent.
- Define Inbox Intelligence slash actions in one centralized command list so future actions inherit the same picker and keyboard behavior.
- Keep landing-page styling scoped to its own stylesheet, with semantic colors defined globally and public example interactions isolated from live customer data; this preserves the authenticated app and prevents demo actions from sending real emails.- Each user connects own WhatsApp Business number (BYOK Cloud API creds in whatsapp_accounts; token column not readable by clients); whatsapp-webhook routes by phone_number_id — multi-tenant, so Lovable's single WhatsApp connector isn't used for customers.
