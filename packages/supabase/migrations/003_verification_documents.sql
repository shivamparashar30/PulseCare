-- ============================================
-- Verification Documents & Auth Flow
-- ============================================

-- 1. Add document columns to doctor_profiles
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS registration_id text;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS government_id_url text;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS medical_certificate_url text;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS profile_photo_url text;

-- 2. Add document columns to medical_stores
ALTER TABLE medical_stores ADD COLUMN IF NOT EXISTS government_id_url text;
ALTER TABLE medical_stores ADD COLUMN IF NOT EXISTS shop_photo_url text;
ALTER TABLE medical_stores ADD COLUMN IF NOT EXISTS license_certificate_url text;

-- 3. Create diagnostics_centers table
CREATE TABLE IF NOT EXISTS diagnostics_centers (
  id uuid REFERENCES profiles ON DELETE CASCADE PRIMARY KEY,
  center_name text NOT NULL,
  registration_id text,
  government_id_url text,
  center_photo_url text,
  registration_certificate_url text,
  address text,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diagnostics_centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Diagnostics centers viewable by everyone" ON diagnostics_centers FOR SELECT USING (true);
CREATE POLICY "Owner can update center" ON diagnostics_centers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Owner can insert center" ON diagnostics_centers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access diagnostics_centers" ON diagnostics_centers FOR ALL USING (is_admin());

-- 4. Add rejection_reason to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 5. Create documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Public document access" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Auth users upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own documents" ON storage.objects FOR UPDATE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
