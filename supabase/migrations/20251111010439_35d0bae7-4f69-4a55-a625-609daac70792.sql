-- Create storage bucket for uploaded documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true);

-- Create documents table to track uploads
CREATE TABLE IF NOT EXISTS public.uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;

-- Allow users to view all documents
CREATE POLICY "Users can view all documents"
  ON public.uploaded_documents
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own documents
CREATE POLICY "Users can upload their own documents"
  ON public.uploaded_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
  ON public.uploaded_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Storage policies for documents bucket
CREATE POLICY "Public can view documents"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );