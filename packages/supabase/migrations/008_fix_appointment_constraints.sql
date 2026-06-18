-- ============================================
-- 008: Fix appointment constraints for full payment flow
-- ============================================

-- 1. Update status constraint to include 'Pending'
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('Pending', 'Upcoming', 'Completed', 'Cancelled'));

-- 2. Update payment_status constraint to include 'pay_on_site'
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_payment_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'refunded', 'pay_on_site'));

-- 3. Make 'time' column nullable (doctor assigns time when accepting)
ALTER TABLE appointments ALTER COLUMN time DROP NOT NULL;
