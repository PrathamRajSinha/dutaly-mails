
-- Create email_templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  body TEXT NOT NULL,
  font_family TEXT NOT NULL DEFAULT 'sans-serif',
  font_size TEXT NOT NULL DEFAULT 'medium',
  text_color TEXT NOT NULL DEFAULT '#333333',
  accent_color TEXT NOT NULL DEFAULT '#4F46E5',
  footer_text TEXT NOT NULL DEFAULT '',
  footer_logo_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own templates" ON public.email_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own templates" ON public.email_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.email_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.email_templates FOR DELETE USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create email-attachments storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('email-attachments', 'email-attachments', true);

-- Storage policies for email-attachments
CREATE POLICY "Users can upload their own attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'email-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own attachments" ON storage.objects FOR SELECT USING (bucket_id = 'email-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own attachments" ON storage.objects FOR DELETE USING (bucket_id = 'email-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can read email attachments" ON storage.objects FOR SELECT USING (bucket_id = 'email-attachments');
