-- ============================================
-- 018: Chat Attachments Storage Bucket
-- ============================================

-- Create chat-attachments bucket (public so URLs work directly)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view chat attachments
CREATE POLICY "Public chat attachment access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-attachments');

-- Authenticated users can upload chat attachments
CREATE POLICY "Auth users upload chat attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');

-- Users can delete their own chat attachments
CREATE POLICY "Users delete own chat attachments"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
