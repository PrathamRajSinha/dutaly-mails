-- Add auto-reply settings to ai_instructions
ALTER TABLE public.ai_instructions 
ADD COLUMN IF NOT EXISTS auto_reply_confidence_threshold numeric DEFAULT 0.8,
ADD COLUMN IF NOT EXISTS greeting_response_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS greeting_template text DEFAULT 'Hello! Thank you for reaching out. How can I assist you today?';

-- Add file support columns to knowledge_base_entries
ALTER TABLE public.knowledge_base_entries
ADD COLUMN IF NOT EXISTS file_type text,
ADD COLUMN IF NOT EXISTS file_name text,
ADD COLUMN IF NOT EXISTS extracted_text text;

-- Add comment for clarity
COMMENT ON COLUMN public.ai_instructions.auto_reply_confidence_threshold IS 'Minimum confidence score to auto-send replies (0-1)';
COMMENT ON COLUMN public.ai_instructions.greeting_response_enabled IS 'Whether to auto-respond to simple greetings';
COMMENT ON COLUMN public.ai_instructions.greeting_template IS 'Template for greeting responses';
COMMENT ON COLUMN public.knowledge_base_entries.file_type IS 'Type of file: pdf, docx, pptx, txt, image, or text';
COMMENT ON COLUMN public.knowledge_base_entries.file_name IS 'Original filename for uploaded files';
COMMENT ON COLUMN public.knowledge_base_entries.extracted_text IS 'Text extracted from uploaded files for AI context';