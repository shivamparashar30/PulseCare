-- ============================================
-- 010: Seed 4 Test Diagnostic Center Accounts
-- Password for all: 123456
-- Email: diagnostic1@rangebook.com ... diagnostic4@rangebook.com
-- ============================================

CREATE OR REPLACE FUNCTION seed_test_diagnostics()
RETURNS void AS $$
DECLARE
  dc1 uuid := 'aaaa1111-1111-1111-1111-111111111111';
  dc2 uuid := 'aaaa2222-2222-2222-2222-222222222222';
  dc3 uuid := 'aaaa3333-3333-3333-3333-333333333333';
  dc4 uuid := 'aaaa4444-4444-4444-4444-444444444444';
BEGIN
  -- Auth users (bcrypt hash of "123456")
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    (dc1,'00000000-0000-0000-0000-000000000000','diagnostic1@rangebook.com','$2a$10$PznXIMmAOGB6HkBqx7CSku2OZBCM1gFQfXJlhQxqzPXhKDXRSmTIG',now(),'{"provider":"email","providers":["email"]}','{"full_name":"HealthFirst Diagnostics","role":"diagnostics"}','authenticated','authenticated',now(),now(),'','','',''),
    (dc2,'00000000-0000-0000-0000-000000000000','diagnostic2@rangebook.com','$2a$10$PznXIMmAOGB6HkBqx7CSku2OZBCM1gFQfXJlhQxqzPXhKDXRSmTIG',now(),'{"provider":"email","providers":["email"]}','{"full_name":"CityLab Diagnostics","role":"diagnostics"}','authenticated','authenticated',now(),now(),'','','',''),
    (dc3,'00000000-0000-0000-0000-000000000000','diagnostic3@rangebook.com','$2a$10$PznXIMmAOGB6HkBqx7CSku2OZBCM1gFQfXJlhQxqzPXhKDXRSmTIG',now(),'{"provider":"email","providers":["email"]}','{"full_name":"MedScan Labs","role":"diagnostics"}','authenticated','authenticated',now(),now(),'','','',''),
    (dc4,'00000000-0000-0000-0000-000000000000','diagnostic4@rangebook.com','$2a$10$PznXIMmAOGB6HkBqx7CSku2OZBCM1gFQfXJlhQxqzPXhKDXRSmTIG',now(),'{"provider":"email","providers":["email"]}','{"full_name":"PrimePath Diagnostics","role":"diagnostics"}','authenticated','authenticated',now(),now(),'','','','')
  ON CONFLICT (id) DO NOTHING;

  -- Auth identities
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES
    (dc1,dc1,jsonb_build_object('sub',dc1::text,'email','diagnostic1@rangebook.com'),'email',dc1::text,now(),now(),now()),
    (dc2,dc2,jsonb_build_object('sub',dc2::text,'email','diagnostic2@rangebook.com'),'email',dc2::text,now(),now(),now()),
    (dc3,dc3,jsonb_build_object('sub',dc3::text,'email','diagnostic3@rangebook.com'),'email',dc3::text,now(),now(),now()),
    (dc4,dc4,jsonb_build_object('sub',dc4::text,'email','diagnostic4@rangebook.com'),'email',dc4::text,now(),now(),now())
  ON CONFLICT DO NOTHING;

  -- Profiles
  INSERT INTO profiles (id, email, full_name, phone, role, status, avatar_url)
  VALUES
    (dc1,'diagnostic1@rangebook.com','HealthFirst Diagnostics','+91-9820001001','diagnostics','approved','https://ui-avatars.com/api/?name=HF&background=7C3AED&color=fff&size=200'),
    (dc2,'diagnostic2@rangebook.com','CityLab Diagnostics','+91-9820001002','diagnostics','approved','https://ui-avatars.com/api/?name=CL&background=7C3AED&color=fff&size=200'),
    (dc3,'diagnostic3@rangebook.com','MedScan Labs','+91-9820001003','diagnostics','approved','https://ui-avatars.com/api/?name=MS&background=7C3AED&color=fff&size=200'),
    (dc4,'diagnostic4@rangebook.com','PrimePath Diagnostics','+91-9820001004','diagnostics','approved','https://ui-avatars.com/api/?name=PP&background=7C3AED&color=fff&size=200')
  ON CONFLICT (id) DO NOTHING;

  -- Diagnostics centers
  INSERT INTO diagnostics_centers (id, center_name, registration_id, address, phone)
  VALUES
    (dc1,'HealthFirst Diagnostics','REG-HF-2020-001','42 MG Road, Sector 14, Gurgaon, Haryana 122001','+91-9820001001'),
    (dc2,'CityLab Diagnostics','REG-CL-2019-002','15 Park Street, Connaught Place, New Delhi 110001','+91-9820001002'),
    (dc3,'MedScan Labs','REG-MS-2021-003','78 Banjara Hills, Road No. 12, Hyderabad 500034','+91-9820001003'),
    (dc4,'PrimePath Diagnostics','REG-PP-2018-004','23 Koramangala 4th Block, Bangalore 560034','+91-9820001004')
  ON CONFLICT (id) DO NOTHING;

  -- =============== LAB TESTS ===============
  -- Delete old platform tests (no diagnostics_center_id) so we can add center-specific ones
  -- Keep them too — they serve as platform-level catalog

  -- HealthFirst Diagnostics (dc1) — Full-service lab
  INSERT INTO lab_tests (name, category, description, price, discount_percentage, preparation, report_time, home_collection, parameters, diagnostics_center_id)
  VALUES
    ('CBC Blood Test', 'Hematology', 'Complete Blood Count - measures red blood cells, white blood cells, hemoglobin, and platelets for overall health screening', 350, 20, 'No special preparation needed', '4-6 hours', true, '["RBC","WBC","Hemoglobin","Platelets","Hematocrit","MCV","MCH","MCHC"]'::jsonb, dc1),
    ('Blood Sugar Fasting', 'Diabetes', 'Measures fasting blood glucose levels to screen for diabetes', 150, 10, 'Fasting for 10-12 hours required. Only water is allowed.', '2-4 hours', true, '["Fasting Blood Sugar"]'::jsonb, dc1),
    ('Thyroid Profile (T3, T4, TSH)', 'Endocrinology', 'Complete thyroid function test to check for hypo/hyperthyroidism', 600, 25, 'No special preparation needed', '24 hours', true, '["T3","T4","TSH"]'::jsonb, dc1),
    ('Lipid Profile', 'Biochemistry', 'Measures cholesterol levels including HDL, LDL, and triglycerides for heart health assessment', 500, 15, 'Fasting for 10-12 hours required', '6-8 hours', true, '["Total Cholesterol","HDL","LDL","Triglycerides","VLDL"]'::jsonb, dc1),
    ('Urine Routine Test', 'Pathology', 'Complete urine analysis for kidney health and infection screening', 200, 10, 'Mid-stream clean catch sample required', '2-4 hours', false, '["pH","Specific Gravity","Protein","Glucose","RBC","WBC","Epithelial Cells"]'::jsonb, dc1),
    ('HbA1c', 'Diabetes', 'Measures average blood sugar over 3 months for diabetes monitoring', 450, 10, 'No fasting required', '4-6 hours', true, '["HbA1c Percentage","Estimated Average Glucose"]'::jsonb, dc1),
    ('Vitamin D Test', 'Vitamins', 'Measures Vitamin D levels — essential for bone health and immunity', 800, 30, 'No special preparation needed', '24 hours', true, '["25-OH Vitamin D"]'::jsonb, dc1),
    ('X-Ray Chest', 'Imaging', 'Chest X-ray for lungs, heart, and ribcage examination', 400, 10, 'Remove metallic objects. Wear loose clothing.', '1-2 hours', false, '["PA View","Lateral View"]'::jsonb, dc1),
    ('ECG', 'Cardiac', 'Electrocardiogram to check heart rhythm and electrical activity', 300, 15, 'Avoid caffeine 2 hours before test', '30 minutes', false, '["Heart Rate","PR Interval","QRS Duration","QT Interval"]'::jsonb, dc1);

  -- CityLab Diagnostics (dc2) — Blood work specialist
  INSERT INTO lab_tests (name, category, description, price, discount_percentage, preparation, report_time, home_collection, parameters, diagnostics_center_id)
  VALUES
    ('CBC Blood Test', 'Hematology', 'Complete Blood Count for comprehensive blood health analysis', 300, 15, 'No special preparation needed', '3-5 hours', true, '["RBC","WBC","Hemoglobin","Platelets","Hematocrit"]'::jsonb, dc2),
    ('Sugar Test (Fasting + PP)', 'Diabetes', 'Fasting and Post-Prandial blood sugar for diabetes screening', 250, 20, 'Fasting 10-12 hours for first sample. Second sample 2 hours after meal.', '4-6 hours', true, '["Fasting Blood Sugar","Post Prandial Blood Sugar"]'::jsonb, dc2),
    ('Thyroid Test (TSH)', 'Endocrinology', 'TSH screening test for basic thyroid function check', 300, 10, 'No special preparation needed', '6-8 hours', true, '["TSH"]'::jsonb, dc2),
    ('Lipid Profile', 'Biochemistry', 'Complete lipid panel for cardiovascular risk assessment', 450, 15, 'Fasting for 10-12 hours required', '6-8 hours', true, '["Total Cholesterol","HDL","LDL","Triglycerides","VLDL"]'::jsonb, dc2),
    ('Liver Function Test', 'Biochemistry', 'Comprehensive liver health assessment', 550, 18, 'Fasting for 10-12 hours preferred', '6-8 hours', true, '["SGOT","SGPT","ALP","Bilirubin","Albumin","Total Protein"]'::jsonb, dc2),
    ('Kidney Function Test', 'Biochemistry', 'Evaluates kidney health and function', 500, 15, 'No special preparation needed', '6-8 hours', true, '["Creatinine","BUN","Uric Acid","eGFR"]'::jsonb, dc2),
    ('Vitamin B12 Test', 'Vitamins', 'Measures Vitamin B12 levels for nerve and blood cell health', 700, 20, 'No special preparation needed', '24 hours', true, '["Vitamin B12"]'::jsonb, dc2);

  -- MedScan Labs (dc3) — Imaging specialist
  INSERT INTO lab_tests (name, category, description, price, discount_percentage, preparation, report_time, home_collection, parameters, diagnostics_center_id)
  VALUES
    ('CBC Blood Test', 'Hematology', 'Standard Complete Blood Count test', 380, 10, 'No preparation needed', '4-6 hours', true, '["RBC","WBC","Hemoglobin","Platelets"]'::jsonb, dc3),
    ('CT Scan Chest', 'Imaging', 'High-resolution CT scan of the chest for detailed lung and thorax imaging', 4500, 20, 'Remove metallic objects. You may need to fast 4 hours before if contrast is used.', '24 hours', false, '["Lung Fields","Mediastinum","Pleura","Chest Wall"]'::jsonb, dc3),
    ('MRI Brain', 'Imaging', 'Magnetic Resonance Imaging of the brain for detailed neurological assessment', 7500, 15, 'Remove all metallic objects. Inform about implants or pacemakers.', '24-48 hours', false, '["Brain Parenchyma","Ventricles","Cerebellum","Brain Stem"]'::jsonb, dc3),
    ('Ultrasound Abdomen', 'Imaging', 'Abdominal ultrasound for liver, kidneys, gallbladder, and pancreas', 800, 10, 'Fasting for 6-8 hours before scan', '1-2 hours', false, '["Liver","Kidneys","Gallbladder","Pancreas","Spleen"]'::jsonb, dc3),
    ('X-Ray Chest', 'Imaging', 'Digital chest X-ray with PA view', 350, 10, 'Remove metallic objects', '1 hour', false, '["PA View"]'::jsonb, dc3),
    ('Thyroid Profile (T3, T4, TSH)', 'Endocrinology', 'Complete thyroid panel', 650, 20, 'No special preparation', '24 hours', true, '["T3","T4","TSH"]'::jsonb, dc3),
    ('ECG', 'Cardiac', 'Standard 12-lead Electrocardiogram', 250, 10, 'Avoid caffeine before test', '30 minutes', false, '["12 Lead ECG","Heart Rate","Rhythm Analysis"]'::jsonb, dc3);

  -- PrimePath Diagnostics (dc4) — Wellness & preventive
  INSERT INTO lab_tests (name, category, description, price, discount_percentage, preparation, report_time, home_collection, parameters, diagnostics_center_id)
  VALUES
    ('CBC Blood Test', 'Hematology', 'Complete Blood Count with differential', 320, 15, 'No preparation needed', '3-4 hours', true, '["RBC","WBC","Hemoglobin","Platelets","Differential Count"]'::jsonb, dc4),
    ('Sugar Test Fasting', 'Diabetes', 'Fasting blood glucose test', 120, 10, 'Fasting for 10-12 hours', '2-3 hours', true, '["Fasting Blood Sugar"]'::jsonb, dc4),
    ('Thyroid Profile (T3, T4, TSH)', 'Endocrinology', 'Comprehensive thyroid function assessment', 550, 25, 'No preparation needed', '12-24 hours', true, '["T3","T4","TSH"]'::jsonb, dc4),
    ('Lipid Profile', 'Biochemistry', 'Complete cholesterol and lipid analysis', 480, 20, 'Fasting 10-12 hours', '6-8 hours', true, '["Total Cholesterol","HDL","LDL","Triglycerides","VLDL","TC/HDL Ratio"]'::jsonb, dc4),
    ('Urine Routine Test', 'Pathology', 'Comprehensive urinalysis', 180, 10, 'Mid-stream clean catch sample', '2-3 hours', false, '["pH","Specific Gravity","Protein","Glucose","RBC","WBC"]'::jsonb, dc4),
    ('Iron Studies', 'Hematology', 'Complete iron profile for anemia assessment', 650, 15, 'Fasting for 10-12 hours preferred', '24 hours', true, '["Serum Iron","TIBC","Ferritin","Transferrin Saturation"]'::jsonb, dc4),
    ('Vitamin D Test', 'Vitamins', 'Vitamin D level assessment', 750, 25, 'No preparation needed', '24 hours', true, '["25-OH Vitamin D"]'::jsonb, dc4),
    ('Calcium Test', 'Biochemistry', 'Serum calcium levels for bone health', 250, 10, 'No special preparation', '4-6 hours', true, '["Total Calcium","Ionized Calcium"]'::jsonb, dc4);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT seed_test_diagnostics();

-- Update lab_bookings status constraint to match appointment flow
ALTER TABLE lab_bookings DROP CONSTRAINT IF EXISTS lab_bookings_status_check;
ALTER TABLE lab_bookings ADD CONSTRAINT lab_bookings_status_check
  CHECK (status IN ('Pending', 'Approved', 'Confirmed', 'Completed', 'Cancelled', 'booked', 'sample_collected', 'processing', 'completed', 'cancelled'));

-- Add payment_id column if missing
ALTER TABLE lab_bookings ADD COLUMN IF NOT EXISTS payment_id text;
