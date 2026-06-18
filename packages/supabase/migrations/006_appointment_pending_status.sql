-- ============================================
-- 006: Add 'Pending' status to appointments + add symptoms column improvements
-- ============================================

-- Drop and recreate the status check constraint to include 'Pending'
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('Pending', 'Upcoming', 'Completed', 'Cancelled'));

-- Allow patients to view their own appointments and doctors to view theirs
-- (policies already exist from 001, but ensure they cover the new status)
