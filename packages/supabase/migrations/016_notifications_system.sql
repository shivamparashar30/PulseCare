-- ============================================
-- 016: Enhanced Notifications System
-- Auto-triggers for appointments, orders, lab bookings
-- ============================================

-- Add columns for deep linking & role filtering
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_type text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_id text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS role text DEFAULT 'patient';

-- ============================================
-- Helper: create_notification RPC
-- ============================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'general',
  p_action_type text DEFAULT NULL,
  p_action_id text DEFAULT NULL,
  p_role text DEFAULT 'patient'
) RETURNS uuid AS $$
DECLARE
  notif_id uuid;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, action_type, action_id, role, read)
  VALUES (p_user_id, p_title, p_message, p_type, p_action_type, p_action_id, p_role, false)
  RETURNING id INTO notif_id;
  RETURN notif_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger: Appointment INSERT → notify doctor + patient
-- ============================================
CREATE OR REPLACE FUNCTION notify_on_appointment_insert()
RETURNS trigger AS $$
DECLARE
  doc_name text;
  pat_name text;
BEGIN
  SELECT full_name INTO pat_name FROM profiles WHERE id = NEW.patient_id;
  SELECT full_name INTO doc_name FROM profiles WHERE id = NEW.doctor_id;

  -- Notify doctor
  PERFORM create_notification(
    NEW.doctor_id,
    'New Appointment Request',
    coalesce(pat_name, 'A patient') || ' has requested an appointment. Please review and approve.',
    'appointment', 'appointment', NEW.id::text, 'doctor'
  );
  -- Notify patient
  PERFORM create_notification(
    NEW.patient_id,
    'Appointment Booked',
    'Your appointment request with Dr. ' || coalesce(doc_name, '') || ' has been submitted. Waiting for confirmation.',
    'appointment', 'appointment', NEW.id::text, 'patient'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger: Appointment UPDATE → notify on status change
-- ============================================
CREATE OR REPLACE FUNCTION notify_on_appointment_update()
RETURNS trigger AS $$
DECLARE
  doc_name text;
  pat_name text;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT full_name INTO pat_name FROM profiles WHERE id = NEW.patient_id;
    SELECT full_name INTO doc_name FROM profiles WHERE id = NEW.doctor_id;

    IF NEW.status = 'Approved' THEN
      PERFORM create_notification(
        NEW.patient_id,
        'Appointment Approved',
        'Dr. ' || coalesce(doc_name, '') || ' approved your appointment. Please proceed with payment to confirm.',
        'appointment', 'appointment', NEW.id::text, 'patient'
      );
    ELSIF NEW.status = 'Confirmed' THEN
      PERFORM create_notification(
        NEW.doctor_id,
        'Payment Received',
        coalesce(pat_name, 'Patient') || ' has paid. The appointment is now confirmed.',
        'appointment', 'appointment', NEW.id::text, 'doctor'
      );
      PERFORM create_notification(
        NEW.patient_id,
        'Appointment Confirmed',
        'Your appointment with Dr. ' || coalesce(doc_name, '') || ' is confirmed!',
        'appointment', 'appointment', NEW.id::text, 'patient'
      );
    ELSIF NEW.status = 'Completed' THEN
      PERFORM create_notification(
        NEW.patient_id,
        'Appointment Completed',
        'Your appointment with Dr. ' || coalesce(doc_name, '') || ' has been completed. Stay healthy!',
        'appointment', 'appointment', NEW.id::text, 'patient'
      );
    ELSIF NEW.status = 'Cancelled' THEN
      PERFORM create_notification(
        NEW.patient_id,
        'Appointment Cancelled',
        'Your appointment with Dr. ' || coalesce(doc_name, '') || ' has been cancelled.',
        'appointment', 'appointment', NEW.id::text, 'patient'
      );
      PERFORM create_notification(
        NEW.doctor_id,
        'Appointment Cancelled',
        coalesce(pat_name, 'A patient') || ' has cancelled their appointment.',
        'appointment', 'appointment', NEW.id::text, 'doctor'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger: Order INSERT → notify store + patient
-- ============================================
CREATE OR REPLACE FUNCTION notify_on_order_insert()
RETURNS trigger AS $$
DECLARE
  store_name text;
BEGIN
  SELECT ms.store_name INTO store_name FROM medical_stores ms WHERE ms.id = NEW.store_id;

  PERFORM create_notification(
    NEW.store_id,
    'New Order Received',
    'A new order has been placed. Please review and confirm.',
    'order', 'order', NEW.id::text, 'medical_store'
  );
  PERFORM create_notification(
    NEW.patient_id,
    'Order Placed',
    'Your order from ' || coalesce(store_name, 'the store') || ' has been placed. Waiting for confirmation.',
    'order', 'order', NEW.id::text, 'patient'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger: Order UPDATE → notify on status change
-- ============================================
CREATE OR REPLACE FUNCTION notify_on_order_update()
RETURNS trigger AS $$
DECLARE
  store_name text;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT ms.store_name INTO store_name FROM medical_stores ms WHERE ms.id = NEW.store_id;

    IF NEW.status = 'confirmed' THEN
      PERFORM create_notification(
        NEW.patient_id,
        'Order Confirmed',
        'Your order from ' || coalesce(store_name, 'the store') || ' has been confirmed.',
        'order', 'order', NEW.id::text, 'patient'
      );
    ELSIF NEW.status = 'processing' THEN
      PERFORM create_notification(
        NEW.patient_id,
        'Order Being Prepared',
        'Your order is being prepared by ' || coalesce(store_name, 'the store') || '.',
        'order', 'order', NEW.id::text, 'patient'
      );
    ELSIF NEW.status = 'out_for_delivery' THEN
      PERFORM create_notification(
        NEW.patient_id,
        'Order Out for Delivery',
        'Your order is on its way! Share the OTP with the delivery person.',
        'order', 'order', NEW.id::text, 'patient'
      );
    ELSIF NEW.status = 'delivered' THEN
      PERFORM create_notification(
        NEW.patient_id,
        'Order Delivered',
        'Your order has been delivered successfully. Thank you!',
        'order', 'order', NEW.id::text, 'patient'
      );
      PERFORM create_notification(
        NEW.store_id,
        'Order Delivered',
        'Order has been delivered successfully.',
        'order', 'order', NEW.id::text, 'medical_store'
      );
    ELSIF NEW.status IN ('cancelled', 'rejected') THEN
      PERFORM create_notification(
        NEW.patient_id,
        'Order ' || initcap(NEW.status),
        'Your order from ' || coalesce(store_name, 'the store') || ' has been ' || NEW.status || '.',
        'order', 'order', NEW.id::text, 'patient'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger: Lab Booking INSERT → notify center + patient
-- ============================================
CREATE OR REPLACE FUNCTION notify_on_lab_booking_insert()
RETURNS trigger AS $$
DECLARE
  center_name text;
BEGIN
  IF NEW.diagnostics_center_id IS NOT NULL THEN
    SELECT dc.center_name INTO center_name FROM diagnostics_centers dc WHERE dc.id = NEW.diagnostics_center_id;
    PERFORM create_notification(
      NEW.diagnostics_center_id,
      'New Lab Booking',
      'A new lab test booking has been received. Please review and confirm.',
      'lab', 'lab_booking', NEW.id::text, 'diagnostics'
    );
  END IF;
  PERFORM create_notification(
    NEW.patient_id,
    'Lab Booking Submitted',
    'Your lab booking has been submitted to ' || coalesce(center_name, 'the center') || '. Awaiting confirmation.',
    'lab', 'lab_booking', NEW.id::text, 'patient'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger: Lab Booking UPDATE → notify on status change
-- ============================================
CREATE OR REPLACE FUNCTION notify_on_lab_booking_update()
RETURNS trigger AS $$
DECLARE
  center_name text;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT dc.center_name INTO center_name FROM diagnostics_centers dc WHERE dc.id = NEW.diagnostics_center_id;

    IF NEW.status IN ('Approved', 'Confirmed') THEN
      PERFORM create_notification(
        NEW.patient_id,
        'Lab Booking ' || NEW.status,
        'Your lab booking at ' || coalesce(center_name, 'the center') || ' has been ' || lower(NEW.status) || '.',
        'lab', 'lab_booking', NEW.id::text, 'patient'
      );
    ELSIF NEW.status IN ('Completed', 'completed') THEN
      PERFORM create_notification(
        NEW.patient_id,
        'Lab Report Ready',
        'Your test results from ' || coalesce(center_name, 'the center') || ' are ready.',
        'lab', 'lab_booking', NEW.id::text, 'patient'
      );
    ELSIF NEW.status IN ('Cancelled', 'cancelled') THEN
      PERFORM create_notification(
        NEW.patient_id,
        'Lab Booking Cancelled',
        'Your lab booking has been cancelled.',
        'lab', 'lab_booking', NEW.id::text, 'patient'
      );
      IF NEW.diagnostics_center_id IS NOT NULL THEN
        PERFORM create_notification(
          NEW.diagnostics_center_id,
          'Booking Cancelled',
          'A patient has cancelled their lab booking.',
          'lab', 'lab_booking', NEW.id::text, 'diagnostics'
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Attach triggers (drop first if exist)
-- ============================================
DROP TRIGGER IF EXISTS trg_notify_appointment_insert ON appointments;
CREATE TRIGGER trg_notify_appointment_insert
  AFTER INSERT ON appointments FOR EACH ROW EXECUTE FUNCTION notify_on_appointment_insert();

DROP TRIGGER IF EXISTS trg_notify_appointment_update ON appointments;
CREATE TRIGGER trg_notify_appointment_update
  AFTER UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION notify_on_appointment_update();

DROP TRIGGER IF EXISTS trg_notify_order_insert ON orders;
CREATE TRIGGER trg_notify_order_insert
  AFTER INSERT ON orders FOR EACH ROW EXECUTE FUNCTION notify_on_order_insert();

DROP TRIGGER IF EXISTS trg_notify_order_update ON orders;
CREATE TRIGGER trg_notify_order_update
  AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION notify_on_order_update();

DROP TRIGGER IF EXISTS trg_notify_lab_booking_insert ON lab_bookings;
CREATE TRIGGER trg_notify_lab_booking_insert
  AFTER INSERT ON lab_bookings FOR EACH ROW EXECUTE FUNCTION notify_on_lab_booking_insert();

DROP TRIGGER IF EXISTS trg_notify_lab_booking_update ON lab_bookings;
CREATE TRIGGER trg_notify_lab_booking_update
  AFTER UPDATE ON lab_bookings FOR EACH ROW EXECUTE FUNCTION notify_on_lab_booking_update();

-- ============================================
-- Enable realtime for notifications table
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
