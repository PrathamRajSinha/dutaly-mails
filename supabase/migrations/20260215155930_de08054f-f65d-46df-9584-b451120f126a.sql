-- Allow users to insert their own subscription row (for existing users without one)
CREATE POLICY "Users can insert their own subscription"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert missing subscription for existing user
INSERT INTO public.user_subscriptions (user_id, status)
VALUES ('167669ef-ba6c-4c0e-8f5d-a4d1f8d586d3', 'pending')
ON CONFLICT DO NOTHING;