-- Create table to cache Google Drive documents per user
CREATE TABLE public.google_drive_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  google_drive_file_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  source TEXT,
  url TEXT,
  link TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, google_drive_file_id)
);

-- Enable RLS
ALTER TABLE public.google_drive_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own google drive documents"
  ON public.google_drive_documents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own google drive documents"
  ON public.google_drive_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own google drive documents"
  ON public.google_drive_documents
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own google drive documents"
  ON public.google_drive_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_google_drive_documents_user_id ON public.google_drive_documents(user_id);
CREATE INDEX idx_google_drive_documents_file_id ON public.google_drive_documents(google_drive_file_id);