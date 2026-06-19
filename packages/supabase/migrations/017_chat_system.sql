-- ============================================
-- 017: Live Chat System (Doctor ↔ Patient)
-- Opens after appointment payment is confirmed
-- Doctor controls whether patient can type
-- ============================================

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id),
  message text NOT NULL,
  message_type text DEFAULT 'text',
  created_at timestamptz DEFAULT now()
);

-- Add chat permission column to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_can_chat boolean DEFAULT false;

-- RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Only appointment participants can read messages
CREATE POLICY "Participants can read chat" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = chat_messages.appointment_id
      AND (a.patient_id = auth.uid() OR a.doctor_id = auth.uid())
    )
  );

-- Doctor can always send messages in their appointments
CREATE POLICY "Doctor can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = chat_messages.appointment_id
      AND a.doctor_id = auth.uid()
      AND a.status = 'Confirmed'
    )
  );

-- Patient can only send if patient_can_chat is true
CREATE POLICY "Patient can send when permitted" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = chat_messages.appointment_id
      AND a.patient_id = auth.uid()
      AND a.status = 'Confirmed'
      AND a.patient_can_chat = true
    )
  );

-- Index for fast message lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_appointment ON chat_messages(appointment_id, created_at);

-- Enable realtime for chat
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
