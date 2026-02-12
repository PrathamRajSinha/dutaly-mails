ALTER TABLE email_accounts
  ADD COLUMN imap_host text,
  ADD COLUMN imap_port integer DEFAULT 993,
  ADD COLUMN smtp_host text,
  ADD COLUMN smtp_port integer DEFAULT 587,
  ADD COLUMN imap_password text;