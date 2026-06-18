-- ============================================
-- 004: Drop trigger & add SECURITY DEFINER signup RPCs
-- ============================================
-- The handle_new_user trigger caused 500 errors on signup. We now use
-- SECURITY DEFINER RPC functions that bypass RLS to reliably save all
-- signup data even when there's no active session after signUp.

-- 1. Drop the trigger (prevents 500 errors on auth.signUp)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop the old function (no longer needed)
DROP FUNCTION IF EXISTS handle_new_user();

-- 3. Ensure profiles has rejection_reason column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 4. Ensure doctor_profiles has all required columns
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS registration_id text;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS government_id_url text;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS medical_certificate_url text;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS profile_photo_url text;

-- 5. Ensure medical_stores has all required columns
ALTER TABLE medical_stores ADD COLUMN IF NOT EXISTS license_number text;
ALTER TABLE medical_stores ADD COLUMN IF NOT EXISTS government_id_url text;
ALTER TABLE medical_stores ADD COLUMN IF NOT EXISTS shop_photo_url text;
ALTER TABLE medical_stores ADD COLUMN IF NOT EXISTS license_certificate_url text;

-- 6. Ensure diagnostics_centers exists with all required columns
CREATE TABLE IF NOT EXISTS diagnostics_centers (
  id uuid REFERENCES profiles ON DELETE CASCADE PRIMARY KEY,
  center_name text NOT NULL DEFAULT '',
  registration_id text,
  government_id_url text,
  center_photo_url text,
  registration_certificate_url text,
  address text,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diagnostics_centers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diagnostics_centers' AND policyname = 'Diagnostics centers viewable by everyone') THEN
    CREATE POLICY "Diagnostics centers viewable by everyone" ON diagnostics_centers FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diagnostics_centers' AND policyname = 'Owner can update center') THEN
    CREATE POLICY "Owner can update center" ON diagnostics_centers FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diagnostics_centers' AND policyname = 'Owner can insert center') THEN
    CREATE POLICY "Owner can insert center" ON diagnostics_centers FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diagnostics_centers' AND policyname = 'Admin full access diagnostics_centers') THEN
    CREATE POLICY "Admin full access diagnostics_centers" ON diagnostics_centers FOR ALL USING (is_admin());
  END IF;
END $$;

-- 7. Ensure documents storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public document access') THEN
    CREATE POLICY "Public document access" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Auth users upload documents') THEN
    CREATE POLICY "Auth users upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update own documents') THEN
    CREATE POLICY "Users can update own documents" ON storage.objects FOR UPDATE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- ============================================
-- 8. SECURITY DEFINER RPC functions for signup
-- These bypass RLS so data is ALWAYS saved even without an active session
-- ============================================

-- Doctor signup RPC
CREATE OR REPLACE FUNCTION create_doctor_signup(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_phone text,
  p_specialization text,
  p_registration_id text,
  p_hospital text,
  p_experience_years integer,
  p_consultation_fee numeric
) RETURNS void AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, phone, role, status)
  VALUES (p_user_id, p_email, p_full_name, p_phone, 'doctor', 'pending')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = 'doctor',
    status = 'pending';

  INSERT INTO doctor_profiles (id, specialization, registration_id, hospital, experience_years, consultation_fee)
  VALUES (p_user_id, p_specialization, p_registration_id, p_hospital, p_experience_years, p_consultation_fee)
  ON CONFLICT (id) DO UPDATE SET
    specialization = EXCLUDED.specialization,
    registration_id = EXCLUDED.registration_id,
    hospital = EXCLUDED.hospital,
    experience_years = EXCLUDED.experience_years,
    consultation_fee = EXCLUDED.consultation_fee;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Medical Store signup RPC
CREATE OR REPLACE FUNCTION create_store_signup(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_phone text,
  p_store_name text,
  p_license_number text,
  p_address text
) RETURNS void AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, phone, role, status)
  VALUES (p_user_id, p_email, p_full_name, p_phone, 'medical_store', 'pending')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = 'medical_store',
    status = 'pending';

  INSERT INTO medical_stores (id, store_name, phone, address, license_number)
  VALUES (p_user_id, p_store_name, p_phone, p_address, p_license_number)
  ON CONFLICT (id) DO UPDATE SET
    store_name = EXCLUDED.store_name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    license_number = EXCLUDED.license_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Diagnostics Center signup RPC
CREATE OR REPLACE FUNCTION create_diagnostics_signup(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_phone text,
  p_center_name text,
  p_registration_id text,
  p_address text
) RETURNS void AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, phone, role, status)
  VALUES (p_user_id, p_email, p_full_name, p_phone, 'diagnostics', 'pending')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = 'diagnostics',
    status = 'pending';

  INSERT INTO diagnostics_centers (id, center_name, phone, address, registration_id)
  VALUES (p_user_id, p_center_name, p_phone, p_address, p_registration_id)
  ON CONFLICT (id) DO UPDATE SET
    center_name = EXCLUDED.center_name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    registration_id = EXCLUDED.registration_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
