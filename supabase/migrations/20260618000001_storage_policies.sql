-- Storage RLS policies for documents bucket

-- Authenticated users can upload to their own folder (auth.uid())
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin users (service_role) can view all documents for review
CREATE POLICY "Service role can view all documents"
  ON storage.objects FOR SELECT TO service_role
  USING (bucket_id = 'documents');

-- Admins can view any license document (via authenticated + is_admin check)
CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND is_admin = true
    )
  );
