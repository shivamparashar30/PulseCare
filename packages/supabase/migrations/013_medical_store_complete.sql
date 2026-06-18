-- ============================================
-- 013: Complete Medical Store Module
-- Tables, seed stores, medicines, helper functions
-- ============================================

-- ============================================
-- PART 1: Schema Enhancements
-- ============================================

-- Medical Stores: location, hours, image
ALTER TABLE medical_stores ADD COLUMN IF NOT EXISTS latitude numeric(10,7);
ALTER TABLE medical_stores ADD COLUMN IF NOT EXISTS longitude numeric(10,7);
ALTER TABLE medical_stores ADD COLUMN IF NOT EXISTS open_time text DEFAULT '08:00 AM';
ALTER TABLE medical_stores ADD COLUMN IF NOT EXISTS close_time text DEFAULT '10:00 PM';
ALTER TABLE medical_stores ADD COLUMN IF NOT EXISTS store_image text;
ALTER TABLE medical_stores ADD COLUMN IF NOT EXISTS delivery_radius_km numeric(5,2) DEFAULT 5.0;
ALTER TABLE medical_stores ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Medicines: stock, dosage, approval
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 100;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS dosage_form text;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS strength text;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS pack_size text;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS uses jsonb DEFAULT '[]'::jsonb;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS side_effects jsonb DEFAULT '[]'::jsonb;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending';
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Orders: OTP, delivery details
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_otp text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_minutes integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee numeric(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal numeric(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes text;

-- Update order status constraint to include full delivery flow
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','confirmed','processing','ready','out_for_delivery','delivered','cancelled','rejected','shipped'));

-- FK from medicines.store_id → medical_stores.id (for PostgREST joins)
ALTER TABLE medicines
  ADD CONSTRAINT medicines_store_fk
  FOREIGN KEY (store_id) REFERENCES medical_stores(id);

-- ============================================
-- PART 2: New Tables
-- ============================================

CREATE TABLE IF NOT EXISTS saved_addresses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL DEFAULT 'Home',
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  latitude numeric(10,7),
  longitude numeric(10,7),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own addresses" ON saved_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own addresses" ON saved_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own addresses" ON saved_addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own addresses" ON saved_addresses FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order participants view history" ON order_status_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND (orders.patient_id = auth.uid() OR orders.store_id = auth.uid())));
CREATE POLICY "Participants insert history" ON order_status_history FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND (orders.patient_id = auth.uid() OR orders.store_id = auth.uid())));

-- Timestamps triggers
CREATE TRIGGER saved_addresses_updated_at BEFORE UPDATE ON saved_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER medicines_updated_at BEFORE UPDATE ON medicines FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- PART 3: Helper Functions
-- ============================================

-- Dispatch order: generate 4-digit OTP
CREATE OR REPLACE FUNCTION dispatch_order(p_order_id uuid)
RETURNS text AS $$
DECLARE
  otp text;
BEGIN
  otp := LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
  UPDATE orders SET status = 'out_for_delivery', delivery_otp = otp, updated_at = now() WHERE id = p_order_id;
  INSERT INTO order_status_history (order_id, status, note) VALUES (p_order_id, 'out_for_delivery', 'Order dispatched for delivery');
  RETURN otp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify delivery OTP
CREATE OR REPLACE FUNCTION verify_delivery_otp(p_order_id uuid, p_otp text)
RETURNS boolean AS $$
DECLARE
  stored_otp text;
BEGIN
  SELECT delivery_otp INTO stored_otp FROM orders WHERE id = p_order_id;
  IF stored_otp IS NOT NULL AND stored_otp = p_otp THEN
    UPDATE orders SET status = 'delivered', updated_at = now() WHERE id = p_order_id;
    INSERT INTO order_status_history (order_id, status, note) VALUES (p_order_id, 'delivered', 'Delivery verified via OTP');
    RETURN true;
  END IF;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 4: Seed Data
-- ============================================

CREATE OR REPLACE FUNCTION seed_medical_stores()
RETURNS void AS $$
DECLARE
  s1 uuid := 'bbbb1111-1111-1111-1111-111111111111';
  s2 uuid := 'bbbb2222-2222-2222-2222-222222222222';
  s3 uuid := 'bbbb3333-3333-3333-3333-333333333333';
  s4 uuid := 'bbbb4444-4444-4444-4444-444444444444';
  s5 uuid := 'bbbb5555-5555-5555-5555-555555555555';
  pw text := '$2a$10$PznXIMmAOGB6HkBqx7CSku2OZBCM1gFQfXJlhQxqzPXhKDXRSmTIG'; -- 123456
  img_tab text := 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400';
  img_cap text := 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400';
  img_syr text := 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400';
  img_oint text := 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400';
  img_vit text := 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400';
  img_ayur text := 'https://images.unsplash.com/photo-1611241893603-3c359704e0ee?w=400';
  img_drop text := 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400';
BEGIN

  -- ========== AUTH USERS ==========
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    (s1,'00000000-0000-0000-0000-000000000000','store1@rangebook.com',pw,now(),'{"provider":"email","providers":["email"]}','{"full_name":"MedPlus Pharmacy","role":"medical_store"}','authenticated','authenticated',now(),now(),'','','',''),
    (s2,'00000000-0000-0000-0000-000000000000','store2@rangebook.com',pw,now(),'{"provider":"email","providers":["email"]}','{"full_name":"Apollo Pharmacy","role":"medical_store"}','authenticated','authenticated',now(),now(),'','','',''),
    (s3,'00000000-0000-0000-0000-000000000000','store3@rangebook.com',pw,now(),'{"provider":"email","providers":["email"]}','{"full_name":"Wellness Forever","role":"medical_store"}','authenticated','authenticated',now(),now(),'','','',''),
    (s4,'00000000-0000-0000-0000-000000000000','store4@rangebook.com',pw,now(),'{"provider":"email","providers":["email"]}','{"full_name":"NetMed Pharmacy","role":"medical_store"}','authenticated','authenticated',now(),now(),'','','',''),
    (s5,'00000000-0000-0000-0000-000000000000','store5@rangebook.com',pw,now(),'{"provider":"email","providers":["email"]}','{"full_name":"Care Pharmacy","role":"medical_store"}','authenticated','authenticated',now(),now(),'','','','')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES
    (s1,s1,jsonb_build_object('sub',s1::text,'email','store1@rangebook.com'),'email',s1::text,now(),now(),now()),
    (s2,s2,jsonb_build_object('sub',s2::text,'email','store2@rangebook.com'),'email',s2::text,now(),now(),now()),
    (s3,s3,jsonb_build_object('sub',s3::text,'email','store3@rangebook.com'),'email',s3::text,now(),now(),now()),
    (s4,s4,jsonb_build_object('sub',s4::text,'email','store4@rangebook.com'),'email',s4::text,now(),now(),now()),
    (s5,s5,jsonb_build_object('sub',s5::text,'email','store5@rangebook.com'),'email',s5::text,now(),now(),now())
  ON CONFLICT DO NOTHING;

  -- ========== PROFILES ==========
  INSERT INTO profiles (id, email, full_name, phone, role, status, avatar_url)
  VALUES
    (s1,'store1@rangebook.com','MedPlus Pharmacy','+91-9810001001','medical_store','approved','https://ui-avatars.com/api/?name=MP&background=0066CC&color=fff&size=200'),
    (s2,'store2@rangebook.com','Apollo Pharmacy','+91-9810002002','medical_store','approved','https://ui-avatars.com/api/?name=AP&background=0066CC&color=fff&size=200'),
    (s3,'store3@rangebook.com','Wellness Forever','+91-9810003003','medical_store','approved','https://ui-avatars.com/api/?name=WF&background=0066CC&color=fff&size=200'),
    (s4,'store4@rangebook.com','NetMed Pharmacy','+91-9810004004','medical_store','approved','https://ui-avatars.com/api/?name=NM&background=0066CC&color=fff&size=200'),
    (s5,'store5@rangebook.com','Care Pharmacy','+91-9810005005','medical_store','approved','https://ui-avatars.com/api/?name=CP&background=0066CC&color=fff&size=200')
  ON CONFLICT (id) DO NOTHING;

  -- ========== MEDICAL STORES ==========
  INSERT INTO medical_stores (id, store_name, address, phone, license_number, rating, is_open, delivery_available, latitude, longitude, open_time, close_time, store_image, delivery_radius_km)
  VALUES
    (s1, 'MedPlus Pharmacy', '42 Sector 14 Market, Gurgaon, Haryana 122001', '+91-9810001001', 'HR/PH/2020/001', 4.5, true, true, 28.4595, 77.0266, '08:00 AM', '10:00 PM', 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400', 5.0),
    (s2, 'Apollo Pharmacy', '15 Connaught Place, New Delhi 110001', '+91-9810002002', 'DL/PH/2019/002', 4.7, true, true, 28.6315, 77.2167, '00:00 AM', '11:59 PM', 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400', 8.0),
    (s3, 'Wellness Forever', '78 Andheri West, Link Road, Mumbai 400058', '+91-9810003003', 'MH/PH/2021/003', 4.3, true, true, 19.1364, 72.8296, '08:00 AM', '11:00 PM', 'https://images.unsplash.com/photo-1631549916768-4b9b0406d10a?w=400', 6.0),
    (s4, 'NetMed Pharmacy', '23 Koramangala 4th Block, Bangalore 560034', '+91-9810004004', 'KA/PH/2020/004', 4.6, true, true, 12.9352, 77.6245, '09:00 AM', '09:00 PM', 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400', 7.0),
    (s5, 'Care Pharmacy', '56 Banjara Hills Road No. 12, Hyderabad 500034', '+91-9810005005', 'TS/PH/2018/005', 4.4, true, true, 17.4156, 78.4347, '08:30 AM', '10:30 PM', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400', 5.5)
  ON CONFLICT (id) DO NOTHING;

  -- ========== MEDICINES ==========

  -- Store 1: MedPlus Pharmacy (Gurgaon)
  INSERT INTO medicines (name, manufacturer, category, price, discount_percentage, description, image_url, requires_prescription, in_stock, stock_quantity, store_id, dosage_form, strength, pack_size, uses, side_effects, approval_status)
  VALUES
    ('Dolo 650', 'Micro Labs', 'Tablets', 30, 10, 'Paracetamol tablet for fever and mild to moderate pain relief', img_tab, false, true, 200, s1, 'Tablet', '650mg', 'Strip of 15', '["Fever","Pain relief","Headache","Body ache"]'::jsonb, '["Nausea","Skin rash","Loss of appetite"]'::jsonb, 'approved'),
    ('Pan-D', 'Alkem', 'Capsules', 135, 15, 'Pantoprazole + Domperidone for acid reflux and gastric issues', img_cap, false, true, 150, s1, 'Capsule', '40mg+30mg', 'Strip of 10', '["Acidity","Acid reflux","Gastric ulcers"]'::jsonb, '["Headache","Diarrhea","Flatulence"]'::jsonb, 'approved'),
    ('Combiflam', 'Sanofi', 'Tablets', 38, 5, 'Ibuprofen + Paracetamol for pain, inflammation and fever', img_tab, false, true, 300, s1, 'Tablet', '400mg+325mg', 'Strip of 20', '["Pain relief","Inflammation","Fever","Toothache"]'::jsonb, '["Stomach upset","Dizziness","Heartburn"]'::jsonb, 'approved'),
    ('Becosules', 'Pfizer', 'Capsules', 32, 8, 'Multivitamin B-complex capsules for overall health', img_cap, false, true, 250, s1, 'Capsule', 'B-Complex', 'Strip of 20', '["Vitamin B deficiency","Mouth ulcers","General weakness"]'::jsonb, '["Mild nausea","Yellow urine"]'::jsonb, 'approved'),
    ('Zincovit', 'Apex', 'Vitamins', 110, 12, 'Multivitamin with zinc for immunity and overall nutrition', img_vit, false, true, 180, s1, 'Tablet', 'Multivitamin+Zinc', 'Bottle of 15', '["Immunity boost","Zinc deficiency","Nutritional supplement"]'::jsonb, '["Nausea","Metallic taste","Constipation"]'::jsonb, 'approved'),
    ('Benadryl Cough Syrup', 'Johnson & Johnson', 'Syrups', 95, 5, 'Cough suppressant and antihistamine for dry cough relief', img_syr, false, true, 120, s1, 'Syrup', '100ml', 'Bottle of 100ml', '["Dry cough","Allergic cough","Cold symptoms"]'::jsonb, '["Drowsiness","Dry mouth","Dizziness"]'::jsonb, 'approved'),
    ('Betadine Ointment', 'Win-Medicare', 'Ointments', 65, 5, 'Povidone-iodine antiseptic ointment for wound care', img_oint, false, true, 100, s1, 'Ointment', '5% w/w', 'Tube of 15g', '["Wound healing","Antiseptic","Minor cuts","Burns"]'::jsonb, '["Skin irritation","Staining"]'::jsonb, 'approved'),
    ('ORS Electrolyte', 'WHO', 'Syrups', 22, 0, 'Oral rehydration salts for dehydration treatment', img_syr, false, true, 500, s1, 'Sachet', '21.8g', 'Pack of 4', '["Dehydration","Diarrhea","Electrolyte balance"]'::jsonb, '["Vomiting (if excess)"]'::jsonb, 'approved'),
    ('Limcee Vitamin C', 'Abbott', 'Vitamins', 30, 10, 'Chewable Vitamin C tablets for immunity', img_vit, false, true, 300, s1, 'Chewable Tablet', '500mg', 'Bottle of 15', '["Vitamin C deficiency","Immunity","Scurvy prevention"]'::jsonb, '["Heartburn","Nausea","Stomach cramps"]'::jsonb, 'approved'),
    ('Dabur Chyawanprash', 'Dabur', 'Ayurvedic', 225, 10, 'Ayurvedic immunity booster with amla and herbs', img_ayur, false, true, 80, s1, 'Paste', '500g', 'Jar of 500g', '["Immunity boost","Cold prevention","Energy","Digestion"]'::jsonb, '["None known"]'::jsonb, 'approved');

  -- Store 2: Apollo Pharmacy (Delhi)
  INSERT INTO medicines (name, manufacturer, category, price, discount_percentage, description, image_url, requires_prescription, in_stock, stock_quantity, store_id, dosage_form, strength, pack_size, uses, side_effects, approval_status)
  VALUES
    ('Dolo 650', 'Micro Labs', 'Tablets', 32, 8, 'Paracetamol tablet for fever and pain relief', img_tab, false, true, 350, s2, 'Tablet', '650mg', 'Strip of 15', '["Fever","Pain relief","Headache","Body ache"]'::jsonb, '["Nausea","Skin rash","Loss of appetite"]'::jsonb, 'approved'),
    ('Azithral 500', 'Alembic', 'Tablets', 98, 12, 'Azithromycin antibiotic for bacterial infections', img_tab, true, true, 100, s2, 'Tablet', '500mg', 'Strip of 3', '["Bacterial infections","Throat infection","Pneumonia"]'::jsonb, '["Diarrhea","Nausea","Abdominal pain"]'::jsonb, 'approved'),
    ('Allegra 120', 'Sanofi', 'Tablets', 180, 15, 'Fexofenadine antihistamine for allergies', img_tab, false, true, 120, s2, 'Tablet', '120mg', 'Strip of 10', '["Allergies","Sneezing","Runny nose","Hives"]'::jsonb, '["Headache","Drowsiness","Nausea"]'::jsonb, 'approved'),
    ('Shelcal 500', 'Torrent', 'Tablets', 165, 10, 'Calcium + Vitamin D3 supplement for bone health', img_tab, false, true, 200, s2, 'Tablet', '500mg+250IU', 'Bottle of 30', '["Calcium deficiency","Bone health","Osteoporosis prevention"]'::jsonb, '["Constipation","Gas","Bloating"]'::jsonb, 'approved'),
    ('Calpol Syrup', 'GSK', 'Syrups', 62, 5, 'Paracetamol suspension for children fever and pain', img_syr, false, true, 150, s2, 'Syrup', '250mg/5ml', 'Bottle of 60ml', '["Fever in children","Pain relief","Teething pain"]'::jsonb, '["Nausea","Skin rash"]'::jsonb, 'approved'),
    ('Digene Gel', 'Abbott', 'Syrups', 85, 8, 'Antacid gel for acidity and gas relief', img_syr, false, true, 180, s2, 'Gel', '200ml', 'Bottle of 200ml', '["Acidity","Gas relief","Heartburn","Indigestion"]'::jsonb, '["Constipation","Diarrhea"]'::jsonb, 'approved'),
    ('Volini Spray', 'Sun Pharma', 'Ointments', 195, 10, 'Diclofenac spray for muscle and joint pain', img_oint, false, true, 90, s2, 'Spray', '15g', 'Can of 15g', '["Muscle pain","Joint pain","Sprains","Back pain"]'::jsonb, '["Skin irritation","Redness"]'::jsonb, 'approved'),
    ('Metformin 500mg', 'USV', 'Tablets', 28, 5, 'Anti-diabetic medication for type 2 diabetes', img_tab, true, true, 250, s2, 'Tablet', '500mg', 'Strip of 20', '["Type 2 diabetes","Blood sugar control"]'::jsonb, '["Nausea","Diarrhea","Stomach pain","Metallic taste"]'::jsonb, 'approved'),
    ('Atorvastatin 10mg', 'Ranbaxy', 'Tablets', 95, 15, 'Statin for cholesterol management', img_tab, true, true, 150, s2, 'Tablet', '10mg', 'Strip of 15', '["High cholesterol","Heart disease prevention"]'::jsonb, '["Muscle pain","Headache","Joint pain"]'::jsonb, 'approved'),
    ('Crocin Advance', 'GSK', 'Tablets', 25, 5, 'Paracetamol tablet for quick pain and fever relief', img_tab, false, true, 400, s2, 'Tablet', '500mg', 'Strip of 20', '["Fever","Headache","Cold","Pain relief"]'::jsonb, '["Nausea","Allergic reaction (rare)"]'::jsonb, 'approved');

  -- Store 3: Wellness Forever (Mumbai)
  INSERT INTO medicines (name, manufacturer, category, price, discount_percentage, description, image_url, requires_prescription, in_stock, stock_quantity, store_id, dosage_form, strength, pack_size, uses, side_effects, approval_status)
  VALUES
    ('Crocin Advance', 'GSK', 'Tablets', 26, 8, 'Paracetamol for quick pain and fever relief', img_tab, false, true, 350, s3, 'Tablet', '500mg', 'Strip of 20', '["Fever","Headache","Pain relief"]'::jsonb, '["Nausea","Allergic reaction (rare)"]'::jsonb, 'approved'),
    ('Pan-D', 'Alkem', 'Capsules', 140, 12, 'Pantoprazole + Domperidone for acid reflux', img_cap, false, true, 130, s3, 'Capsule', '40mg+30mg', 'Strip of 10', '["Acidity","Acid reflux","Gastric ulcers"]'::jsonb, '["Headache","Diarrhea","Flatulence"]'::jsonb, 'approved'),
    ('Zincovit', 'Apex', 'Vitamins', 115, 10, 'Multivitamin with zinc for immunity', img_vit, false, true, 200, s3, 'Tablet', 'Multivitamin+Zinc', 'Bottle of 15', '["Immunity boost","Zinc deficiency","Nutrition"]'::jsonb, '["Nausea","Metallic taste"]'::jsonb, 'approved'),
    ('Himalaya Liv.52', 'Himalaya', 'Ayurvedic', 145, 10, 'Herbal liver care supplement', img_ayur, false, true, 100, s3, 'Tablet', 'Herbal', 'Bottle of 100', '["Liver health","Appetite improvement","Detoxification"]'::jsonb, '["None known"]'::jsonb, 'approved'),
    ('Nasivion Nasal Drops', 'Merck', 'Drops', 78, 5, 'Oxymetazoline nasal decongestant drops', img_drop, false, true, 80, s3, 'Drops', '0.05%', 'Bottle of 10ml', '["Nasal congestion","Blocked nose","Sinusitis"]'::jsonb, '["Nasal dryness","Sneezing","Headache"]'::jsonb, 'approved'),
    ('D-Rise 60K', 'USV', 'Capsules', 120, 20, 'Cholecalciferol Vitamin D3 supplement', img_cap, false, true, 200, s3, 'Capsule', '60000 IU', 'Strip of 4', '["Vitamin D deficiency","Bone health","Calcium absorption"]'::jsonb, '["Nausea","Constipation (rare)"]'::jsonb, 'approved'),
    ('Amoxicillin 500mg', 'Cipla', 'Capsules', 85, 10, 'Broad-spectrum antibiotic for bacterial infections', img_cap, true, true, 180, s3, 'Capsule', '500mg', 'Strip of 10', '["Bacterial infections","Ear infections","UTI","Dental infections"]'::jsonb, '["Diarrhea","Rash","Nausea","Vomiting"]'::jsonb, 'approved'),
    ('Omeprazole 20mg', 'Sun Pharma', 'Capsules', 45, 10, 'Proton pump inhibitor for acid reflux and ulcers', img_cap, false, true, 200, s3, 'Capsule', '20mg', 'Strip of 10', '["Acid reflux","GERD","Stomach ulcers"]'::jsonb, '["Headache","Nausea","Diarrhea"]'::jsonb, 'approved'),
    ('Moov Pain Relief', 'Reckitt', 'Ointments', 85, 5, 'Diclofenac-based cream for muscle and back pain', img_oint, false, true, 150, s3, 'Cream', '50g', 'Tube of 50g', '["Back pain","Muscle pain","Joint stiffness","Sprains"]'::jsonb, '["Skin irritation","Redness"]'::jsonb, 'approved'),
    ('Dabur Honey', 'Dabur', 'Ayurvedic', 199, 8, '100% pure honey for natural immunity and wellness', img_ayur, false, true, 120, s3, 'Liquid', '500g', 'Bottle of 500g', '["Immunity","Sore throat","Natural sweetener","Weight management"]'::jsonb, '["None known"]'::jsonb, 'approved');

  -- Store 4: NetMed Pharmacy (Bangalore)
  INSERT INTO medicines (name, manufacturer, category, price, discount_percentage, description, image_url, requires_prescription, in_stock, stock_quantity, store_id, dosage_form, strength, pack_size, uses, side_effects, approval_status)
  VALUES
    ('Dolo 650', 'Micro Labs', 'Tablets', 28, 12, 'Paracetamol for fever and pain relief', img_tab, false, true, 400, s4, 'Tablet', '650mg', 'Strip of 15', '["Fever","Pain relief","Headache","Body ache"]'::jsonb, '["Nausea","Skin rash"]'::jsonb, 'approved'),
    ('Azithral 500', 'Alembic', 'Tablets', 95, 15, 'Azithromycin antibiotic for infections', img_tab, true, true, 80, s4, 'Tablet', '500mg', 'Strip of 3', '["Bacterial infections","Throat infection","Pneumonia"]'::jsonb, '["Diarrhea","Nausea","Stomach pain"]'::jsonb, 'approved'),
    ('Allegra 120', 'Sanofi', 'Tablets', 175, 18, 'Fexofenadine for allergies and hay fever', img_tab, false, true, 100, s4, 'Tablet', '120mg', 'Strip of 10', '["Allergies","Sneezing","Runny nose"]'::jsonb, '["Headache","Drowsiness"]'::jsonb, 'approved'),
    ('Becosules', 'Pfizer', 'Capsules', 30, 10, 'B-complex vitamin supplement', img_cap, false, true, 300, s4, 'Capsule', 'B-Complex', 'Strip of 20', '["Vitamin B deficiency","Mouth ulcers","Weakness"]'::jsonb, '["Mild nausea","Yellow urine"]'::jsonb, 'approved'),
    ('Shelcal 500', 'Torrent', 'Tablets', 160, 12, 'Calcium + D3 for bone health', img_tab, false, true, 180, s4, 'Tablet', '500mg+250IU', 'Bottle of 30', '["Calcium deficiency","Bone health"]'::jsonb, '["Constipation","Gas"]'::jsonb, 'approved'),
    ('Ibuprofen 400mg', 'Cipla', 'Tablets', 35, 5, 'NSAID for pain and inflammation', img_tab, false, true, 250, s4, 'Tablet', '400mg', 'Strip of 10', '["Pain relief","Inflammation","Fever","Arthritis"]'::jsonb, '["Stomach upset","Nausea","Dizziness"]'::jsonb, 'approved'),
    ('Cetirizine 10mg', 'Dr Reddy', 'Tablets', 15, 0, 'Antihistamine for allergies and cold', img_tab, false, true, 500, s4, 'Tablet', '10mg', 'Strip of 10', '["Allergies","Sneezing","Itching","Watery eyes"]'::jsonb, '["Drowsiness","Dry mouth","Fatigue"]'::jsonb, 'approved'),
    ('Strepsils', 'Reckitt', 'Tablets', 55, 5, 'Medicated lozenges for sore throat relief', img_tab, false, true, 200, s4, 'Lozenge', '1.2mg+0.6mg', 'Pack of 8', '["Sore throat","Throat irritation","Cough"]'::jsonb, '["Mild mouth irritation"]'::jsonb, 'approved'),
    ('Levocetirizine 5mg', 'Sun Pharma', 'Tablets', 55, 10, 'Antihistamine for seasonal allergies', img_tab, false, true, 180, s4, 'Tablet', '5mg', 'Strip of 10', '["Allergies","Rhinitis","Urticaria","Itching"]'::jsonb, '["Drowsiness","Dry mouth","Headache"]'::jsonb, 'approved'),
    ('Disprin', 'Reckitt', 'Tablets', 15, 0, 'Aspirin for pain, fever and headache', img_tab, false, true, 350, s4, 'Tablet', '350mg', 'Strip of 10', '["Headache","Fever","Pain relief","Inflammation"]'::jsonb, '["Stomach irritation","Nausea","Bleeding risk"]'::jsonb, 'approved');

  -- Store 5: Care Pharmacy (Hyderabad)
  INSERT INTO medicines (name, manufacturer, category, price, discount_percentage, description, image_url, requires_prescription, in_stock, stock_quantity, store_id, dosage_form, strength, pack_size, uses, side_effects, approval_status)
  VALUES
    ('Crocin Advance', 'GSK', 'Tablets', 24, 10, 'Quick-action paracetamol for fever and pain', img_tab, false, true, 380, s5, 'Tablet', '500mg', 'Strip of 20', '["Fever","Headache","Pain relief"]'::jsonb, '["Nausea","Allergic reaction (rare)"]'::jsonb, 'approved'),
    ('Pan-D', 'Alkem', 'Capsules', 130, 18, 'Pantoprazole + Domperidone for acidity', img_cap, false, true, 160, s5, 'Capsule', '40mg+30mg', 'Strip of 10', '["Acidity","Acid reflux","Gastric ulcers"]'::jsonb, '["Headache","Diarrhea"]'::jsonb, 'approved'),
    ('Combiflam', 'Sanofi', 'Tablets', 36, 8, 'Pain relief with ibuprofen and paracetamol', img_tab, false, true, 280, s5, 'Tablet', '400mg+325mg', 'Strip of 20', '["Pain","Inflammation","Fever","Toothache"]'::jsonb, '["Stomach upset","Heartburn"]'::jsonb, 'approved'),
    ('Benadryl Cough Syrup', 'Johnson & Johnson', 'Syrups', 90, 8, 'Cough suppressant for dry cough', img_syr, false, true, 100, s5, 'Syrup', '100ml', 'Bottle of 100ml', '["Dry cough","Allergic cough","Cold"]'::jsonb, '["Drowsiness","Dry mouth"]'::jsonb, 'approved'),
    ('Betadine Ointment', 'Win-Medicare', 'Ointments', 62, 5, 'Antiseptic ointment for wounds', img_oint, false, true, 110, s5, 'Ointment', '5% w/w', 'Tube of 15g', '["Wound healing","Antiseptic","Cuts"]'::jsonb, '["Skin irritation"]'::jsonb, 'approved'),
    ('Volini Spray', 'Sun Pharma', 'Ointments', 190, 12, 'Pain relief spray for muscles and joints', img_oint, false, true, 70, s5, 'Spray', '15g', 'Can of 15g', '["Muscle pain","Joint pain","Back pain"]'::jsonb, '["Skin irritation","Redness"]'::jsonb, 'approved'),
    ('Calpol Syrup', 'GSK', 'Syrups', 58, 8, 'Paracetamol for children fever', img_syr, false, true, 140, s5, 'Syrup', '250mg/5ml', 'Bottle of 60ml', '["Fever in children","Pain relief"]'::jsonb, '["Nausea","Rash"]'::jsonb, 'approved'),
    ('Limcee Vitamin C', 'Abbott', 'Vitamins', 28, 12, 'Chewable Vitamin C for immunity', img_vit, false, true, 250, s5, 'Chewable Tablet', '500mg', 'Bottle of 15', '["Immunity","Vitamin C deficiency"]'::jsonb, '["Heartburn","Stomach cramps"]'::jsonb, 'approved'),
    ('ORS Electrolyte', 'WHO', 'Syrups', 20, 0, 'Oral rehydration salts for dehydration', img_syr, false, true, 450, s5, 'Sachet', '21.8g', 'Pack of 4', '["Dehydration","Diarrhea"]'::jsonb, '["Vomiting (if excess)"]'::jsonb, 'approved'),
    ('Himalaya Neem Face Wash', 'Himalaya', 'Ayurvedic', 175, 10, 'Neem and turmeric face wash for clear skin', img_ayur, false, true, 90, s5, 'Face Wash', '150ml', 'Tube of 150ml', '["Acne","Oily skin","Skin cleansing"]'::jsonb, '["Dryness (rare)"]'::jsonb, 'approved');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT seed_medical_stores();
