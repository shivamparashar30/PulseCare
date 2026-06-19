-- ============================================
-- 022: Chat message notifications + auto-disable chat on completion
-- ============================================

-- 1. Trigger: create notification when a chat message is sent
CREATE OR REPLACE FUNCTION notify_chat_message() RETURNS trigger AS $$
DECLARE
  v_other UUID;
  v_sender TEXT;
  v_preview TEXT;
  v_etype TEXT;
  v_eid UUID;
  v_role TEXT;
  v_pid UUID;
  v_bid UUID;
BEGIN
  -- Skip call event messages
  IF NEW.message_type = 'call' THEN RETURN NEW; END IF;

  SELECT full_name INTO v_sender FROM profiles WHERE id = NEW.sender_id;

  v_preview := CASE
    WHEN NEW.message_type = 'image' THEN 'Sent a photo'
    WHEN NEW.message_type = 'video' THEN 'Sent a video'
    WHEN NEW.message_type = 'document' THEN 'Sent a document'
    ELSE LEFT(NEW.message, 100)
  END;

  -- Appointment chat
  IF NEW.appointment_id IS NOT NULL THEN
    SELECT patient_id, doctor_id INTO v_pid, v_bid
      FROM appointments WHERE id = NEW.appointment_id;
    v_etype := 'appointment'; v_eid := NEW.appointment_id;
    IF NEW.sender_id = v_pid THEN v_other := v_bid; v_role := 'doctor';
    ELSE v_other := v_pid; v_role := 'patient'; END IF;

  -- Order chat
  ELSIF NEW.order_id IS NOT NULL THEN
    SELECT patient_id, store_id INTO v_pid, v_bid
      FROM orders WHERE id = NEW.order_id;
    v_etype := 'order'; v_eid := NEW.order_id;
    IF NEW.sender_id = v_pid THEN v_other := v_bid; v_role := 'medical_store';
    ELSE v_other := v_pid; v_role := 'patient'; END IF;

  -- Lab booking chat
  ELSIF NEW.lab_booking_id IS NOT NULL THEN
    SELECT patient_id, center_id INTO v_pid, v_bid
      FROM lab_bookings WHERE id = NEW.lab_booking_id;
    v_etype := 'lab_booking'; v_eid := NEW.lab_booking_id;
    IF NEW.sender_id = v_pid THEN v_other := v_bid; v_role := 'diagnostics';
    ELSE v_other := v_pid; v_role := 'patient'; END IF;
  END IF;

  IF v_other IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, read, action_type, action_id, role)
    VALUES (
      v_other,
      COALESCE(v_sender, 'New message'),
      v_preview,
      v_etype,
      false,
      v_etype,
      v_eid,
      v_role
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_chat_message_notify
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_chat_message();


-- 2. Auto-disable chat permissions when entity is completed/cancelled
CREATE OR REPLACE FUNCTION auto_disable_chat_on_complete() RETURNS trigger AS $$
BEGIN
  IF TG_TABLE_NAME = 'appointments'
     AND NEW.status IN ('Completed', 'Cancelled')
     AND OLD.status NOT IN ('Completed', 'Cancelled') THEN
    NEW.patient_can_chat := false;
  END IF;

  IF TG_TABLE_NAME = 'orders'
     AND NEW.status IN ('delivered', 'cancelled', 'rejected')
     AND OLD.status NOT IN ('delivered', 'cancelled', 'rejected') THEN
    NEW.customer_can_chat := false;
  END IF;

  IF TG_TABLE_NAME = 'lab_bookings'
     AND NEW.status IN ('Completed', 'Cancelled')
     AND OLD.status NOT IN ('Completed', 'Cancelled') THEN
    NEW.customer_can_chat := false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER disable_chat_on_appointment_complete
  BEFORE UPDATE ON appointments FOR EACH ROW
  EXECUTE FUNCTION auto_disable_chat_on_complete();

CREATE TRIGGER disable_chat_on_order_complete
  BEFORE UPDATE ON orders FOR EACH ROW
  EXECUTE FUNCTION auto_disable_chat_on_complete();

CREATE TRIGGER disable_chat_on_lab_booking_complete
  BEFORE UPDATE ON lab_bookings FOR EACH ROW
  EXECUTE FUNCTION auto_disable_chat_on_complete();
