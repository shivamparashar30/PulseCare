-- ============================================
-- 015: Health Packages (created by Diagnostics Centers)
-- ============================================

DROP TABLE IF EXISTS health_packages CASCADE;

CREATE TABLE health_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostics_center_id uuid NOT NULL REFERENCES diagnostics_centers(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Basic',
  description text,
  tests jsonb NOT NULL DEFAULT '[]'::jsonb,
  price numeric(10,2) NOT NULL,
  original_price numeric(10,2) NOT NULL,
  discount_percentage numeric(5,2) DEFAULT 0,
  report_time text DEFAULT '24 hours',
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  home_collection boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE health_packages ENABLE ROW LEVEL SECURITY;

-- Anyone can read active packages
CREATE POLICY "Anyone can read active packages" ON health_packages
  FOR SELECT USING (is_active = true);

-- Diagnostics centers can manage their own packages
CREATE POLICY "Centers manage own packages" ON health_packages
  FOR ALL USING (diagnostics_center_id = auth.uid());

-- ============================================
-- Seed: Pre-loaded health packages
-- (linked to existing diagnostics centers)
-- ============================================

-- We'll use a DO block to link packages to actual centers
DO $$
DECLARE
  center1_id uuid;
  center2_id uuid;
  center3_id uuid;
BEGIN
  -- Get first 3 diagnostics centers
  SELECT id INTO center1_id FROM diagnostics_centers ORDER BY center_name LIMIT 1;
  SELECT id INTO center2_id FROM diagnostics_centers ORDER BY center_name LIMIT 1 OFFSET 1;
  SELECT id INTO center3_id FROM diagnostics_centers ORDER BY center_name LIMIT 1 OFFSET 2;

  -- Use center1 as fallback if not enough centers
  IF center2_id IS NULL THEN center2_id := center1_id; END IF;
  IF center3_id IS NULL THEN center3_id := center1_id; END IF;

  -- Skip if no centers exist
  IF center1_id IS NULL THEN RETURN; END IF;

  INSERT INTO health_packages (diagnostics_center_id, name, category, description, tests, price, original_price, discount_percentage, report_time, is_popular, home_collection) VALUES

  -- Full Body Checkup
  (center1_id, 'Full Body Checkup', 'Comprehensive',
   'Comprehensive 65-parameter health checkup covering blood, urine, thyroid, liver, kidney, vitamins, and cardiac markers.',
   '["CBC","Blood Sugar (Fasting)","Lipid Profile","LFT (Liver Function)","KFT (Kidney Function)","Thyroid Profile (T3, T4, TSH)","Vitamin D","Vitamin B12","ECG","Urine Routine","Chest X-Ray"]'::jsonb,
   2999, 4999, 40, '48 hours', true, true),

  -- Diabetes Care
  (center1_id, 'Diabetes Care Package', 'Essential',
   'Targeted package for diabetes monitoring with blood sugar, HbA1c, kidney function, and related parameters.',
   '["Fasting Blood Sugar","Post Prandial Sugar","HbA1c","Urine Microalbumin","KFT","Lipid Profile","Insulin Fasting"]'::jsonb,
   1625, 2500, 35, '12 hours', true, true),

  -- Heart Health
  (center2_id, 'Heart Health Package', 'Premium',
   'Complete cardiac risk assessment including ECG, lipid profile, and blood biomarkers.',
   '["Lipid Profile","ECG","Cardiac Risk Markers (Troponin, BNP)","hs-CRP","Homocysteine","HbA1c","CBC"]'::jsonb,
   2450, 3500, 30, '24 hours', true, true),

  -- Women's Wellness
  (center2_id, 'Women''s Wellness Package', 'Women''s',
   'Comprehensive health checkup designed for women including thyroid, hormone levels, and bone density.',
   '["CBC","Thyroid Profile","Hormone Panel (FSH, LH, Estrogen)","Vitamin D","Iron Studies","Pap Smear","Mammography"]'::jsonb,
   3575, 5500, 35, '72 hours', false, false),

  -- Vitamin Panel
  (center1_id, 'Vitamin Deficiency Panel', 'Basic',
   'Check essential vitamin and mineral levels including D, B12, Iron, Zinc, and Calcium.',
   '["Vitamin D","Vitamin B12","Folic Acid","Iron Studies","Zinc","Calcium","Magnesium"]'::jsonb,
   2400, 3200, 25, '24 hours', true, true),

  -- Senior Citizen
  (center3_id, 'Senior Citizen Package (60+)', 'Senior',
   'Tailored health check for seniors covering joint health, kidney, cardiac, blood, and neurological markers.',
   '["CBC","Blood Sugar","LFT","KFT","Lipid Profile","Thyroid","ECG","Bone Density (DEXA)","Prostate (PSA for men)","Chest X-Ray"]'::jsonb,
   3300, 6000, 45, '48 hours', true, true),

  -- Basic Health Check
  (center3_id, 'Basic Health Screening', 'Basic',
   'Affordable routine health screening with essential blood tests and vitals check.',
   '["CBC","Blood Sugar (Fasting)","Lipid Profile","Urine Routine","Blood Pressure Check"]'::jsonb,
   799, 1200, 33, '6 hours', false, true),

  -- Thyroid Complete
  (center1_id, 'Thyroid Complete Panel', 'Essential',
   'Complete thyroid evaluation including T3, T4, TSH, Anti-TPO, and Thyroglobulin antibodies.',
   '["T3","T4","TSH","Free T3","Free T4","Anti-TPO Antibodies","Thyroglobulin"]'::jsonb,
   1199, 1800, 33, '12 hours', true, true),

  -- Kidney Check
  (center2_id, 'Kidney Health Package', 'Essential',
   'Complete kidney function assessment with urine analysis and renal markers.',
   '["KFT (Creatinine, BUN, Uric Acid)","Urine Routine","Urine Microalbumin","Electrolytes (Na, K, Cl)","eGFR","Kidney Ultrasound"]'::jsonb,
   1850, 2800, 34, '24 hours', false, true),

  -- Liver Check
  (center3_id, 'Liver Function Package', 'Essential',
   'Comprehensive liver health assessment with enzymes, bilirubin, and hepatitis screening.',
   '["LFT (SGOT, SGPT, ALP, GGT)","Bilirubin (Total & Direct)","Albumin","Hepatitis B Surface Antigen","Hepatitis C Antibody","Liver Ultrasound"]'::jsonb,
   1650, 2500, 34, '24 hours', false, true);

END $$;

-- ============================================
-- Allow lab_bookings to reference health packages
-- ============================================
ALTER TABLE lab_bookings ALTER COLUMN lab_test_id DROP NOT NULL;
ALTER TABLE lab_bookings ADD COLUMN IF NOT EXISTS health_package_id uuid REFERENCES health_packages(id);
