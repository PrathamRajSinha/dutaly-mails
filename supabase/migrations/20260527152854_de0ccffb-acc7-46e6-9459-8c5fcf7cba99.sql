
-- 1) Lock down profile plan/role escalation
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND plan IS NOT DISTINCT FROM (SELECT p.plan FROM public.profiles p WHERE p.id = auth.uid())
  AND role IS NOT DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
);

-- 2) Add explicit UPDATE policy for kb-documents bucket scoped to the user's folder
DROP POLICY IF EXISTS "Users can update their own kb documents" ON storage.objects;
CREATE POLICY "Users can update their own kb documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'kb-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'kb-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3) Restrict Realtime channel subscriptions to user-scoped topics
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only subscribe to their own topic" ON realtime.messages;
CREATE POLICY "Users can only subscribe to their own topic"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = auth.uid()::text
  OR realtime.topic() LIKE auth.uid()::text || ':%'
);

DROP POLICY IF EXISTS "Users can only broadcast to their own topic" ON realtime.messages;
CREATE POLICY "Users can only broadcast to their own topic"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() = auth.uid()::text
  OR realtime.topic() LIKE auth.uid()::text || ':%'
);
