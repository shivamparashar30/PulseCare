-- ============================================
-- 007: Add payment columns to appointments
-- ============================================

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_id text;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_amount numeric;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS symptoms text;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS type text DEFAULT 'in-person';

-- Allow doctors to update appointments they are assigned to
CREATE POLICY IF NOT EXISTS "Doctors can update their appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = doctor_id);

-- Allow patients to update payment info on their appointments
CREATE POLICY IF NOT EXISTS "Patients can update their appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = patient_id);
