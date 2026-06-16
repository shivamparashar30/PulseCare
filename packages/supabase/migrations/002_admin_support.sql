-- ============================================
-- Admin Support & Approval Workflow
-- ============================================

-- 1. Add 'admin' to role check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('patient', 'doctor', 'medical_store', 'diagnostics', 'admin'));

-- 2. Add approval status to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved'
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Set existing patients to approved
UPDATE profiles SET status = 'approved' WHERE role = 'patient';
UPDATE profiles SET status = 'approved' WHERE role = 'admin';

-- 3. Add approval status to medicines
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Approve existing seed medicines
UPDATE medicines SET status = 'approved';

-- 4. Create a helper function to check admin (avoids recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 5. Admin RLS policies using the helper function
CREATE POLICY "Admin full access profiles" ON profiles
  FOR ALL USING (is_admin());

CREATE POLICY "Admin full access doctor_profiles" ON doctor_profiles
  FOR ALL USING (is_admin());

CREATE POLICY "Admin full access appointments" ON appointments
  FOR ALL USING (is_admin());

CREATE POLICY "Admin full access medicines" ON medicines
  FOR ALL USING (is_admin());

CREATE POLICY "Admin full access orders" ON orders
  FOR ALL USING (is_admin());

CREATE POLICY "Admin full access order_items" ON order_items
  FOR ALL USING (is_admin());

CREATE POLICY "Admin full access lab_tests" ON lab_tests
  FOR ALL USING (is_admin());

CREATE POLICY "Admin full access lab_bookings" ON lab_bookings
  FOR ALL USING (is_admin());

CREATE POLICY "Admin full access medical_stores" ON medical_stores
  FOR ALL USING (is_admin());

CREATE POLICY "Admin full access health_packages" ON health_packages
  FOR ALL USING (is_admin());

CREATE POLICY "Admin full access notifications" ON notifications
  FOR ALL USING (is_admin());

CREATE POLICY "Admin full access prescriptions" ON prescriptions
  FOR ALL USING (is_admin());

-- 6. Update medicines SELECT policy to only show approved medicines to non-admins
DROP POLICY IF EXISTS "Medicines viewable by everyone" ON medicines;
CREATE POLICY "Medicines viewable by everyone" ON medicines
  FOR SELECT USING (
    status = 'approved'
    OR auth.uid() = store_id
    OR is_admin()
  );
