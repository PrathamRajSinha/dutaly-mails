ALTER TABLE email_queue ADD COLUMN thread_id text;
CREATE INDEX idx_email_queue_thread_id ON email_queue(thread_id);