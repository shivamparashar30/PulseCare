-- ============================================
-- 019: Extend Chat to Orders & Lab Bookings
-- ============================================

-- Make appointment_id nullable so chat_messages can belong to orders or lab_bookings
ALTER TABLE chat_messages ALTER COLUMN appointment_id DROP NOT NULL;

-- Add order_id and lab_booking_id FKs
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS lab_booking_id uuid REFERENCES lab_bookings(id) ON DELETE CASCADE;

-- Add customer_can_chat to orders and lab_bookings
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_can_chat boolean DEFAULT false;
ALTER TABLE lab_bookings ADD COLUMN IF NOT EXISTS customer_can_chat boolean DEFAULT false;

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_order ON chat_messages(order_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_lab_booking ON chat_messages(lab_booking_id, created_at);

-- RLS: Store staff can read chat messages for their orders
CREATE POLICY "Store can read order chat" ON chat_messages
  FOR SELECT USING (
    order_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = chat_messages.order_id
      AND (o.patient_id = auth.uid() OR o.store_id = auth.uid())
    )
  );

-- RLS: Store can always send messages in their orders
CREATE POLICY "Store can send order chat" ON chat_messages
  FOR INSERT WITH CHECK (
    order_id IS NOT NULL
    AND auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = chat_messages.order_id
      AND o.store_id = auth.uid()
    )
  );

-- RLS: Patient can send in order chat when permitted
CREATE POLICY "Patient can send order chat when permitted" ON chat_messages
  FOR INSERT WITH CHECK (
    order_id IS NOT NULL
    AND auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = chat_messages.order_id
      AND o.patient_id = auth.uid()
      AND o.customer_can_chat = true
    )
  );

-- RLS: Diagnostics center can read chat messages for their bookings
CREATE POLICY "Center can read booking chat" ON chat_messages
  FOR SELECT USING (
    lab_booking_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM lab_bookings lb
      WHERE lb.id = chat_messages.lab_booking_id
      AND (lb.patient_id = auth.uid() OR lb.diagnostics_center_id = auth.uid())
    )
  );

-- RLS: Center can always send messages in their bookings
CREATE POLICY "Center can send booking chat" ON chat_messages
  FOR INSERT WITH CHECK (
    lab_booking_id IS NOT NULL
    AND auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM lab_bookings lb
      WHERE lb.id = chat_messages.lab_booking_id
      AND lb.diagnostics_center_id = auth.uid()
    )
  );

-- RLS: Patient can send in booking chat when permitted
CREATE POLICY "Patient can send booking chat when permitted" ON chat_messages
  FOR INSERT WITH CHECK (
    lab_booking_id IS NOT NULL
    AND auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM lab_bookings lb
      WHERE lb.id = chat_messages.lab_booking_id
      AND lb.patient_id = auth.uid()
      AND lb.customer_can_chat = true
    )
  );
