-- ============================================
-- 005: Seed 5 Test Doctor Accounts
-- Password for all: 123456
-- ============================================

ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS qualification text;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS about text;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS languages text[];
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS available_days text[];
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS available boolean DEFAULT true;

CREATE OR REPLACE FUNCTION seed_test_doctors()
RETURNS void AS $$
DECLARE
  d1 uuid := '11111111-1111-1111-1111-111111111111';
  d2 uuid := '22222222-2222-2222-2222-222222222222';
  d3 uuid := '33333333-3333-3333-3333-333333333333';
  d4 uuid := '44444444-4444-4444-4444-444444444444';
  d5 uuid := '55555555-5555-5555-5555-555555555555';
BEGIN
  -- Auth users (bcrypt hash of "123456")
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    (d1,'00000000-0000-0000-0000-000000000000','doctor1@example.com','$2a$10$PznXIMmAOGB6HkBqx7CSku2OZBCM1gFQfXJlhQxqzPXhKDXRSmTIG',now(),'{"provider":"email","providers":["email"]}','{"full_name":"Dr. Rajesh Kumar","role":"doctor"}','authenticated','authenticated',now(),now(),'','','',''),
    (d2,'00000000-0000-0000-0000-000000000000','doctor2@example.com','$2a$10$PznXIMmAOGB6HkBqx7CSku2OZBCM1gFQfXJlhQxqzPXhKDXRSmTIG',now(),'{"provider":"email","providers":["email"]}','{"full_name":"Dr. Priya Sharma","role":"doctor"}','authenticated','authenticated',now(),now(),'','','',''),
    (d3,'00000000-0000-0000-0000-000000000000','doctor3@example.com','$2a$10$PznXIMmAOGB6HkBqx7CSku2OZBCM1gFQfXJlhQxqzPXhKDXRSmTIG',now(),'{"provider":"email","providers":["email"]}','{"full_name":"Dr. Amit Patel","role":"doctor"}','authenticated','authenticated',now(),now(),'','','',''),
    (d4,'00000000-0000-0000-0000-000000000000','doctor4@example.com','$2a$10$PznXIMmAOGB6HkBqx7CSku2OZBCM1gFQfXJlhQxqzPXhKDXRSmTIG',now(),'{"provider":"email","providers":["email"]}','{"full_name":"Dr. Sneha Reddy","role":"doctor"}','authenticated','authenticated',now(),now(),'','','',''),
    (d5,'00000000-0000-0000-0000-000000000000','doctor5@example.com','$2a$10$PznXIMmAOGB6HkBqx7CSku2OZBCM1gFQfXJlhQxqzPXhKDXRSmTIG',now(),'{"provider":"email","providers":["email"]}','{"full_name":"Dr. Vikram Singh","role":"doctor"}','authenticated','authenticated',now(),now(),'','','','')
  ON CONFLICT (id) DO NOTHING;

  -- Auth identities (required for login)
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES
    (d1,d1,jsonb_build_object('sub',d1::text,'email','doctor1@example.com'),'email',d1::text,now(),now(),now()),
    (d2,d2,jsonb_build_object('sub',d2::text,'email','doctor2@example.com'),'email',d2::text,now(),now(),now()),
    (d3,d3,jsonb_build_object('sub',d3::text,'email','doctor3@example.com'),'email',d3::text,now(),now(),now()),
    (d4,d4,jsonb_build_object('sub',d4::text,'email','doctor4@example.com'),'email',d4::text,now(),now(),now()),
    (d5,d5,jsonb_build_object('sub',d5::text,'email','doctor5@example.com'),'email',d5::text,now(),now(),now())
  ON CONFLICT DO NOTHING;

  -- Profiles
  INSERT INTO profiles (id, email, full_name, phone, role, status, avatar_url)
  VALUES
    (d1,'doctor1@example.com','Dr. Rajesh Kumar','+91-9810001001','doctor','approved','https://randomuser.me/api/portraits/men/32.jpg'),
    (d2,'doctor2@example.com','Dr. Priya Sharma','+91-9810001002','doctor','approved','https://randomuser.me/api/portraits/women/44.jpg'),
    (d3,'doctor3@example.com','Dr. Amit Patel','+91-9810001003','doctor','approved','https://randomuser.me/api/portraits/men/52.jpg'),
    (d4,'doctor4@example.com','Dr. Sneha Reddy','+91-9810001004','doctor','approved','https://randomuser.me/api/portraits/women/68.jpg'),
    (d5,'doctor5@example.com','Dr. Vikram Singh','+91-9810001005','doctor','approved','https://randomuser.me/api/portraits/men/75.jpg')
  ON CONFLICT (id) DO NOTHING;

  -- Doctor profiles
  INSERT INTO doctor_profiles (id, specialization, registration_id, hospital, experience_years, consultation_fee, qualification, about, languages, available_days, available, rating, total_reviews)
  VALUES
    (d1,'Cardiologist','MCI-2009-RK-001','Apollo Hospital',15,800,'MBBS, MD (Cardiology), DM','Senior interventional cardiologist with 15+ years of experience in complex coronary interventions and preventive heart care.',ARRAY['English','Hindi'],ARRAY['Mon','Tue','Wed','Thu','Fri'],true,4.8,124),
    (d2,'Dermatologist','MCI-2014-PS-002','Fortis Healthcare',10,600,'MBBS, MD (Dermatology)','Renowned dermatologist specializing in cosmetic dermatology, hair disorders, and skin allergies with 10+ years of experience.',ARRAY['English','Hindi','Telugu'],ARRAY['Mon','Wed','Fri','Sat'],true,4.7,98),
    (d3,'Orthopedic','MCI-2012-AP-003','Max Hospital',12,700,'MBBS, MS (Orthopaedics)','Orthopedic surgeon with expertise in joint replacement, sports medicine, and arthroscopic surgery.',ARRAY['English','Hindi','Gujarati'],ARRAY['Tue','Thu','Sat'],true,4.6,87),
    (d4,'Pediatrician','MCI-2016-SR-004','Manipal Hospital',8,500,'MBBS, MD (Pediatrics)','Compassionate pediatrician dedicated to child health from birth through adolescence.',ARRAY['English','Hindi','Telugu','Kannada'],ARRAY['Mon','Tue','Wed','Thu','Fri','Sat'],true,4.9,213),
    (d5,'Neurologist','MCI-2004-VS-005','AIIMS',20,1000,'MBBS, MD, DM (Neurology)','Distinguished neurologist with 20 years of experience specializing in epilepsy, stroke, and neurodegenerative diseases.',ARRAY['English','Hindi'],ARRAY['Mon','Wed','Fri'],true,4.9,341)
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT seed_test_doctors();
