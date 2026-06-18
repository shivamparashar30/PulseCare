-- ============================================
-- 011: Center Tests junction table
-- ============================================
-- Each diagnostic center selects tests from the predefined catalog (lab_tests
-- where diagnostics_center_id IS NULL), sets their own price, and toggles
-- availability.  Only rows marked is_available = true are shown to patients.

-- 1. Create center_tests junction table
CREATE TABLE IF NOT EXISTS center_tests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  diagnostics_center_id uuid REFERENCES diagnostics_centers(id) ON DELETE CASCADE NOT NULL,
  lab_test_id uuid REFERENCES lab_tests(id) ON DELETE CASCADE NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  discount_percentage integer DEFAULT 0,
  is_available boolean DEFAULT true,
  home_collection boolean DEFAULT false,
  report_time text DEFAULT '24 hours',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (diagnostics_center_id, lab_test_id)
);

-- Timestamps trigger
CREATE TRIGGER center_tests_updated_at
  BEFORE UPDATE ON center_tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE center_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Center tests viewable by everyone"
  ON center_tests FOR SELECT USING (true);

CREATE POLICY "Center can manage own tests"
  ON center_tests FOR INSERT
  WITH CHECK (auth.uid() = diagnostics_center_id);

CREATE POLICY "Center can update own tests"
  ON center_tests FOR UPDATE
  USING (auth.uid() = diagnostics_center_id);

CREATE POLICY "Center can delete own tests"
  ON center_tests FOR DELETE
  USING (auth.uid() = diagnostics_center_id);

-- 2. Ensure the predefined catalog has entries (diagnostics_center_id IS NULL)
-- These already exist from 001_initial.sql seed data.
-- Make sure all seeded center-specific tests from 010 also exist as catalog items.
-- We'll insert catalog items that don't already exist.

INSERT INTO lab_tests (name, category, description, price, discount_percentage, preparation, report_time, home_collection, parameters, diagnostics_center_id)
VALUES
  ('CBC Blood Test', 'Hematology', 'Complete Blood Count - measures red blood cells, white blood cells, hemoglobin, and platelets', 350, 0, 'No special preparation needed', '4-6 hours', true, '["RBC","WBC","Hemoglobin","Platelets","Hematocrit","MCV","MCH","MCHC"]'::jsonb, NULL),
  ('Blood Sugar Fasting', 'Diabetes', 'Measures fasting blood glucose levels to screen for diabetes', 150, 0, 'Fasting for 10-12 hours required. Only water is allowed.', '2-4 hours', true, '["Fasting Blood Sugar"]'::jsonb, NULL),
  ('Sugar Test (Fasting + PP)', 'Diabetes', 'Fasting and Post-Prandial blood sugar for diabetes screening', 250, 0, 'Fasting 10-12 hours for first sample. Second sample 2 hours after meal.', '4-6 hours', true, '["Fasting Blood Sugar","Post Prandial Blood Sugar"]'::jsonb, NULL),
  ('Liver Function Test', 'Biochemistry', 'Comprehensive liver health assessment', 550, 0, 'Fasting for 10-12 hours preferred', '6-8 hours', true, '["SGOT","SGPT","ALP","Bilirubin","Albumin","Total Protein"]'::jsonb, NULL),
  ('Kidney Function Test', 'Biochemistry', 'Evaluates kidney health and function', 500, 0, 'No special preparation needed', '6-8 hours', true, '["Creatinine","BUN","Uric Acid","eGFR"]'::jsonb, NULL),
  ('Urine Routine Test', 'Pathology', 'Complete urine analysis for kidney health and infection screening', 200, 0, 'Mid-stream clean catch sample required', '2-4 hours', false, '["pH","Specific Gravity","Protein","Glucose","RBC","WBC","Epithelial Cells"]'::jsonb, NULL),
  ('Iron Studies', 'Hematology', 'Complete iron profile for anemia assessment', 650, 0, 'Fasting for 10-12 hours preferred', '24 hours', true, '["Serum Iron","TIBC","Ferritin","Transferrin Saturation"]'::jsonb, NULL),
  ('Calcium Test', 'Biochemistry', 'Serum calcium levels for bone health', 250, 0, 'No special preparation', '4-6 hours', true, '["Total Calcium","Ionized Calcium"]'::jsonb, NULL),
  ('CT Scan Chest', 'Imaging', 'High-resolution CT scan of the chest', 4500, 0, 'Remove metallic objects. May need to fast 4 hours if contrast used.', '24 hours', false, '["Lung Fields","Mediastinum","Pleura","Chest Wall"]'::jsonb, NULL),
  ('MRI Brain', 'Imaging', 'Magnetic Resonance Imaging of the brain', 7500, 0, 'Remove all metallic objects. Inform about implants or pacemakers.', '24-48 hours', false, '["Brain Parenchyma","Ventricles","Cerebellum","Brain Stem"]'::jsonb, NULL),
  ('Ultrasound Abdomen', 'Imaging', 'Abdominal ultrasound for liver, kidneys, gallbladder, and pancreas', 800, 0, 'Fasting for 6-8 hours before scan', '1-2 hours', false, '["Liver","Kidneys","Gallbladder","Pancreas","Spleen"]'::jsonb, NULL),
  ('X-Ray Chest', 'Imaging', 'Chest X-ray for lungs, heart, and ribcage examination', 400, 0, 'Remove metallic objects. Wear loose clothing.', '1-2 hours', false, '["PA View","Lateral View"]'::jsonb, NULL),
  ('ECG', 'Cardiac', 'Electrocardiogram to check heart rhythm and electrical activity', 300, 0, 'Avoid caffeine 2 hours before test', '30 minutes', false, '["Heart Rate","PR Interval","QRS Duration","QT Interval"]'::jsonb, NULL),
  ('Thyroid Test (TSH)', 'Endocrinology', 'TSH screening test for basic thyroid function check', 300, 0, 'No special preparation needed', '6-8 hours', true, '["TSH"]'::jsonb, NULL)
ON CONFLICT DO NOTHING;

-- 3. Seed center_tests for the 4 demo diagnostic centers using existing catalog tests
-- We reference catalog items (diagnostics_center_id IS NULL) by name.

CREATE OR REPLACE FUNCTION seed_center_tests()
RETURNS void AS $$
DECLARE
  dc1 uuid := 'aaaa1111-1111-1111-1111-111111111111';
  dc2 uuid := 'aaaa2222-2222-2222-2222-222222222222';
  dc3 uuid := 'aaaa3333-3333-3333-3333-333333333333';
  dc4 uuid := 'aaaa4444-4444-4444-4444-444444444444';
  t_id uuid;
BEGIN
  -- Helper: for each center, select catalog tests by name and insert into center_tests
  -- HealthFirst Diagnostics (dc1) — Full-service lab
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Complete Blood Count' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc1, t_id, 350, 20, true, true, '4-6 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'CBC Blood Test' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc1, t_id, 350, 20, true, true, '4-6 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Blood Sugar Fasting' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc1, t_id, 150, 10, true, true, '2-4 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name IN ('Thyroid Profile (T3, T4, TSH)') LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc1, t_id, 600, 25, true, true, '24 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Lipid Profile' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc1, t_id, 500, 15, true, true, '6-8 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Urine Routine Test' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc1, t_id, 200, 10, true, false, '2-4 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'HbA1c' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc1, t_id, 450, 10, true, true, '4-6 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Vitamin D Test' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc1, t_id, 800, 30, true, true, '24 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'X-Ray Chest' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc1, t_id, 400, 10, true, false, '1-2 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'ECG' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc1, t_id, 300, 15, true, false, '30 minutes') ON CONFLICT DO NOTHING;
  END LOOP;

  -- CityLab Diagnostics (dc2) — Blood work specialist
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name IN ('Complete Blood Count','CBC Blood Test') LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc2, t_id, 300, 15, true, true, '3-5 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Sugar Test (Fasting + PP)' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc2, t_id, 250, 20, true, true, '4-6 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Thyroid Test (TSH)' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc2, t_id, 300, 10, true, true, '6-8 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Lipid Profile' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc2, t_id, 450, 15, true, true, '6-8 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Liver Function Test' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc2, t_id, 550, 18, true, true, '6-8 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Kidney Function Test' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc2, t_id, 500, 15, true, true, '6-8 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Vitamin B12 Test' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc2, t_id, 700, 20, true, true, '24 hours') ON CONFLICT DO NOTHING;
  END LOOP;

  -- MedScan Labs (dc3) — Imaging specialist
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name IN ('Complete Blood Count','CBC Blood Test') LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc3, t_id, 380, 10, true, true, '4-6 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'CT Scan Chest' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc3, t_id, 4500, 20, true, false, '24 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'MRI Brain' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc3, t_id, 7500, 15, true, false, '24-48 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Ultrasound Abdomen' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc3, t_id, 800, 10, true, false, '1-2 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'X-Ray Chest' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc3, t_id, 350, 10, true, false, '1 hour') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name IN ('Thyroid Profile (T3, T4, TSH)') LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc3, t_id, 650, 20, true, true, '24 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'ECG' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc3, t_id, 250, 10, true, false, '30 minutes') ON CONFLICT DO NOTHING;
  END LOOP;

  -- PrimePath Diagnostics (dc4) — Wellness & preventive
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name IN ('Complete Blood Count','CBC Blood Test') LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc4, t_id, 320, 15, true, true, '3-4 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Blood Sugar Fasting' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc4, t_id, 120, 10, true, true, '2-3 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name IN ('Thyroid Profile (T3, T4, TSH)') LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc4, t_id, 550, 25, true, true, '12-24 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Lipid Profile' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc4, t_id, 480, 20, true, true, '6-8 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Urine Routine Test' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc4, t_id, 180, 10, true, false, '2-3 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Iron Studies' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc4, t_id, 650, 15, true, true, '24 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Vitamin D Test' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc4, t_id, 750, 25, true, true, '24 hours') ON CONFLICT DO NOTHING;
  END LOOP;
  FOR t_id IN SELECT id FROM lab_tests WHERE diagnostics_center_id IS NULL AND name = 'Calcium Test' LIMIT 1 LOOP
    INSERT INTO center_tests (diagnostics_center_id, lab_test_id, price, discount_percentage, is_available, home_collection, report_time)
    VALUES (dc4, t_id, 250, 10, true, true, '4-6 hours') ON CONFLICT DO NOTHING;
  END LOOP;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT seed_center_tests();
