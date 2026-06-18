-- ============================================
-- 009: Add 'Approved' and 'Confirmed' statuses to appointments
-- ============================================
-- Flow: Pending → Approved (doctor sets date/time) → Confirmed (patient pays) → Completed
--       At any point before Confirmed, either party can Cancel

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('Pending', 'Approved', 'Confirmed', 'Upcoming', 'Completed', 'Cancelled'));

-- Ensure payment_status includes pay_on_site
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_payment_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'refunded', 'pay_on_site'));

-- Make time nullable (doctor assigns on approval)
ALTER TABLE appointments ALTER COLUMN time DROP NOT NULL;
