-- ============================================
-- PulseCare Healthcare Database Schema
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  phone text,
  role text not null check (role in ('patient', 'doctor', 'medical_store', 'diagnostics')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Doctor profiles
create table doctor_profiles (
  id uuid references profiles on delete cascade primary key,
  specialization text not null,
  experience_years integer default 0,
  qualification text,
  hospital text,
  location text,
  consultation_fee numeric(10,2) default 0,
  rating numeric(3,2) default 0,
  total_reviews integer default 0,
  available boolean default true,
  about text,
  available_slots jsonb default '[]'
);

-- Appointments
create table appointments (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references profiles not null,
  doctor_id uuid references doctor_profiles not null,
  date date not null,
  time text not null,
  type text check (type in ('video', 'in-person')) default 'in-person',
  status text check (status in ('Upcoming', 'Completed', 'Cancelled')) default 'Upcoming',
  symptoms text,
  notes text,
  prescription jsonb,
  payment_amount numeric(10,2),
  payment_status text check (payment_status in ('pending', 'paid', 'refunded')) default 'pending',
  payment_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Medicines
create table medicines (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  manufacturer text,
  category text,
  price numeric(10,2) not null,
  discount_percentage integer default 0,
  description text,
  image_url text,
  requires_prescription boolean default false,
  in_stock boolean default true,
  store_id uuid references profiles,
  created_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references profiles not null,
  store_id uuid references profiles,
  status text check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')) default 'pending',
  total_amount numeric(10,2) not null,
  delivery_address text,
  payment_status text check (payment_status in ('pending', 'paid', 'refunded')) default 'pending',
  payment_id text,
  prescription_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order items
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders on delete cascade not null,
  medicine_id uuid references medicines not null,
  quantity integer not null default 1,
  price numeric(10,2) not null,
  created_at timestamptz default now()
);

-- Lab tests
create table lab_tests (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text,
  description text,
  price numeric(10,2) not null,
  discount_percentage integer default 0,
  preparation text,
  report_time text,
  home_collection boolean default false,
  parameters jsonb default '[]',
  diagnostics_center_id uuid references profiles,
  created_at timestamptz default now()
);

-- Lab bookings
create table lab_bookings (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references profiles not null,
  lab_test_id uuid references lab_tests not null,
  diagnostics_center_id uuid references profiles,
  date date not null,
  time text,
  status text check (status in ('booked', 'sample_collected', 'processing', 'completed', 'cancelled')) default 'booked',
  collection_type text check (collection_type in ('home', 'center')) default 'center',
  collection_address text,
  report_url text,
  payment_amount numeric(10,2),
  payment_status text check (payment_status in ('pending', 'paid', 'refunded')) default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Medical stores
create table medical_stores (
  id uuid references profiles on delete cascade primary key,
  store_name text not null,
  address text,
  phone text,
  license_number text,
  rating numeric(3,2) default 0,
  is_open boolean default true,
  delivery_available boolean default true,
  created_at timestamptz default now()
);

-- Health packages
create table health_packages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric(10,2) not null,
  discount_percentage integer default 0,
  tests jsonb default '[]',
  diagnostics_center_id uuid references profiles,
  popular boolean default false,
  created_at timestamptz default now()
);

-- Notifications
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles not null,
  title text not null,
  message text not null,
  type text,
  read boolean default false,
  data jsonb,
  created_at timestamptz default now()
);

-- Prescriptions
create table prescriptions (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references profiles not null,
  doctor_id uuid references profiles,
  file_url text not null,
  notes text,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table profiles enable row level security;
alter table doctor_profiles enable row level security;
alter table appointments enable row level security;
alter table medicines enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table lab_tests enable row level security;
alter table lab_bookings enable row level security;
alter table medical_stores enable row level security;
alter table health_packages enable row level security;
alter table notifications enable row level security;
alter table prescriptions enable row level security;

-- Profiles
create policy "Profiles viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Doctor profiles
create policy "Doctor profiles viewable by everyone" on doctor_profiles for select using (true);
create policy "Doctors can update own profile" on doctor_profiles for update using (auth.uid() = id);
create policy "Doctors can insert own profile" on doctor_profiles for insert with check (auth.uid() = id);

-- Appointments
create policy "View own appointments" on appointments for select using (auth.uid() = patient_id or auth.uid() = doctor_id);
create policy "Patients can create appointments" on appointments for insert with check (auth.uid() = patient_id);
create policy "Participants can update appointments" on appointments for update using (auth.uid() = doctor_id or auth.uid() = patient_id);

-- Medicines
create policy "Medicines viewable by everyone" on medicines for select using (true);
create policy "Store owners can insert medicines" on medicines for insert with check (auth.uid() = store_id);
create policy "Store owners can update medicines" on medicines for update using (auth.uid() = store_id);

-- Orders
create policy "View own orders" on orders for select using (auth.uid() = patient_id or auth.uid() = store_id);
create policy "Patients can create orders" on orders for insert with check (auth.uid() = patient_id);
create policy "Participants can update orders" on orders for update using (auth.uid() = patient_id or auth.uid() = store_id);

-- Order items
create policy "View own order items" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and (orders.patient_id = auth.uid() or orders.store_id = auth.uid()))
);
create policy "Patients can add order items" on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.patient_id = auth.uid())
);

-- Lab tests
create policy "Lab tests viewable by everyone" on lab_tests for select using (true);
create policy "Centers can insert lab tests" on lab_tests for insert with check (auth.uid() = diagnostics_center_id);
create policy "Centers can update lab tests" on lab_tests for update using (auth.uid() = diagnostics_center_id);

-- Lab bookings
create policy "View own lab bookings" on lab_bookings for select using (auth.uid() = patient_id or auth.uid() = diagnostics_center_id);
create policy "Patients can create lab bookings" on lab_bookings for insert with check (auth.uid() = patient_id);
create policy "Participants can update lab bookings" on lab_bookings for update using (auth.uid() = patient_id or auth.uid() = diagnostics_center_id);

-- Medical stores
create policy "Medical stores viewable by everyone" on medical_stores for select using (true);
create policy "Store owners can update store" on medical_stores for update using (auth.uid() = id);
create policy "Store owners can create store" on medical_stores for insert with check (auth.uid() = id);

-- Health packages
create policy "Health packages viewable by everyone" on health_packages for select using (true);
create policy "Centers can insert packages" on health_packages for insert with check (auth.uid() = diagnostics_center_id);
create policy "Centers can update packages" on health_packages for update using (auth.uid() = diagnostics_center_id);

-- Notifications
create policy "View own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Update own notifications" on notifications for update using (auth.uid() = user_id);
create policy "System can create notifications" on notifications for insert with check (true);

-- Prescriptions
create policy "View own prescriptions" on prescriptions for select using (auth.uid() = patient_id or auth.uid() = doctor_id);
create policy "Patients can upload prescriptions" on prescriptions for insert with check (auth.uid() = patient_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', null),
    coalesce(new.raw_user_meta_data->>'role', 'patient')
  );

  -- If doctor, also create doctor_profiles entry
  if coalesce(new.raw_user_meta_data->>'role', 'patient') = 'doctor' then
    insert into doctor_profiles (id, specialization)
    values (new.id, coalesce(new.raw_user_meta_data->>'specialization', 'General'));
  end if;

  -- If medical_store, also create medical_stores entry
  if coalesce(new.raw_user_meta_data->>'role', 'patient') = 'medical_store' then
    insert into medical_stores (id, store_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'store_name', 'My Store'));
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles for each row execute function update_updated_at();
create trigger appointments_updated_at before update on appointments for each row execute function update_updated_at();
create trigger orders_updated_at before update on orders for each row execute function update_updated_at();
create trigger lab_bookings_updated_at before update on lab_bookings for each row execute function update_updated_at();

-- ============================================
-- STORAGE BUCKETS
-- ============================================

insert into storage.buckets (id, name, public) values ('prescriptions', 'prescriptions', true);
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('reports', 'reports', false);

-- Storage policies
create policy "Public prescription access" on storage.objects for select using (bucket_id = 'prescriptions');
create policy "Auth users upload prescriptions" on storage.objects for insert with check (bucket_id = 'prescriptions' and auth.role() = 'authenticated');
create policy "Public avatar access" on storage.objects for select using (bucket_id = 'avatars');
create policy "Auth users upload avatars" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "Auth users view reports" on storage.objects for select using (bucket_id = 'reports' and auth.role() = 'authenticated');
create policy "Auth users upload reports" on storage.objects for insert with check (bucket_id = 'reports' and auth.role() = 'authenticated');

-- ============================================
-- SEED DATA (sample doctors, medicines, lab tests)
-- ============================================

-- We'll seed after auth is set up so we can reference real user IDs
-- For now, insert public catalog data without user references

insert into medicines (name, manufacturer, category, price, discount_percentage, description, image_url, requires_prescription, in_stock) values
('Paracetamol 500mg', 'Cipla', 'Pain Relief', 25.00, 10, 'Used for fever and mild pain relief', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200', false, true),
('Amoxicillin 250mg', 'Sun Pharma', 'Antibiotics', 85.00, 5, 'Antibiotic for bacterial infections', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200', true, true),
('Cetirizine 10mg', 'Dr Reddys', 'Allergy', 35.00, 15, 'Antihistamine for allergy relief', 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200', false, true),
('Omeprazole 20mg', 'Mankind', 'Gastric', 60.00, 20, 'For acid reflux and stomach ulcers', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200', false, true),
('Metformin 500mg', 'USV', 'Diabetes', 45.00, 10, 'For type 2 diabetes management', 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=200', true, true),
('Amlodipine 5mg', 'Cipla', 'Blood Pressure', 55.00, 8, 'For high blood pressure', 'https://images.unsplash.com/photo-1559757175-7cb057fba93c?w=200', true, true),
('Azithromycin 500mg', 'Alkem', 'Antibiotics', 120.00, 12, 'Antibiotic for respiratory infections', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200', true, true),
('Vitamin D3 60K', 'HealthKart', 'Supplements', 150.00, 25, 'Weekly vitamin D supplement', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200', false, true),
('Pantoprazole 40mg', 'Alkem', 'Gastric', 75.00, 10, 'For GERD and stomach acid', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200', false, true),
('Dolo 650', 'Micro Labs', 'Pain Relief', 30.00, 5, 'Paracetamol for fever and body pain', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200', false, true);

insert into lab_tests (name, category, description, price, discount_percentage, preparation, report_time, home_collection, parameters) values
('Complete Blood Count', 'Hematology', 'Measures red blood cells, white blood cells, hemoglobin, and platelets', 350.00, 20, 'No special preparation needed', '4-6 hours', true, '["RBC", "WBC", "Hemoglobin", "Platelets", "Hematocrit"]'),
('Lipid Profile', 'Biochemistry', 'Measures cholesterol levels including HDL, LDL, and triglycerides', 500.00, 15, 'Fasting for 10-12 hours required', '6-8 hours', true, '["Total Cholesterol", "HDL", "LDL", "Triglycerides", "VLDL"]'),
('Thyroid Profile (T3, T4, TSH)', 'Endocrinology', 'Complete thyroid function assessment', 600.00, 25, 'No special preparation needed', '24 hours', true, '["T3", "T4", "TSH"]'),
('HbA1c', 'Diabetes', 'Measures average blood sugar over 3 months', 450.00, 10, 'No fasting required', '4-6 hours', true, '["HbA1c Percentage", "Estimated Average Glucose"]'),
('Liver Function Test', 'Biochemistry', 'Assesses liver health and function', 550.00, 18, 'Fasting for 10-12 hours', '6-8 hours', true, '["SGOT", "SGPT", "ALP", "Bilirubin", "Albumin", "Total Protein"]'),
('Kidney Function Test', 'Biochemistry', 'Evaluates kidney health', 500.00, 15, 'No special preparation', '6-8 hours', true, '["Creatinine", "BUN", "Uric Acid", "eGFR"]'),
('Vitamin D Test', 'Vitamins', 'Measures vitamin D levels in blood', 800.00, 30, 'No special preparation', '24 hours', true, '["25-OH Vitamin D"]'),
('Vitamin B12 Test', 'Vitamins', 'Measures vitamin B12 levels', 700.00, 20, 'No special preparation', '24 hours', true, '["Vitamin B12"]'),
('Complete Urine Analysis', 'Pathology', 'Comprehensive urine examination', 200.00, 10, 'Mid-stream clean catch sample', '2-4 hours', false, '["pH", "Specific Gravity", "Protein", "Glucose", "RBC", "WBC"]'),
('COVID-19 RT-PCR', 'Microbiology', 'Detects active COVID-19 infection', 500.00, 0, 'No special preparation', '24-48 hours', true, '["SARS-CoV-2 RNA"]');

insert into health_packages (name, description, price, discount_percentage, tests, popular) values
('Basic Health Checkup', 'Essential health screening package', 999.00, 30, '["CBC", "Blood Sugar Fasting", "Lipid Profile", "Urine Analysis"]', true),
('Comprehensive Health Package', 'Complete body health assessment', 2499.00, 35, '["CBC", "Lipid Profile", "Liver Function", "Kidney Function", "Thyroid Profile", "HbA1c", "Vitamin D", "Urine Analysis"]', true),
('Diabetes Care Package', 'Complete diabetes monitoring', 1299.00, 25, '["HbA1c", "Blood Sugar Fasting", "Blood Sugar PP", "Kidney Function", "Lipid Profile"]', false),
('Heart Health Package', 'Cardiac risk assessment', 1799.00, 20, '["Lipid Profile", "ECG", "CBC", "Blood Sugar", "Homocysteine", "hs-CRP"]', true),
('Women Wellness Package', 'Complete womens health screening', 2999.00, 30, '["CBC", "Thyroid Profile", "Vitamin D", "Vitamin B12", "Iron Studies", "Calcium", "Pap Smear"]', false);
