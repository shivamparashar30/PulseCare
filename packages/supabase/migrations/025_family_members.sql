-- Family members table for patient app
CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  blood_group TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);

-- RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own family members"
  ON family_members FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add patient_name column to appointments for booking on behalf of family/other
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_name TEXT;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE family_members;
