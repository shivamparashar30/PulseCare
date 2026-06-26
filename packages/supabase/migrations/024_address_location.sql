-- ============================================
-- Migration 024: Address & Location Management
-- Adds structured address fields + coordinates to all provider tables
-- ============================================

-- 1) Add structured address + coordinates to doctor_profiles
ALTER TABLE doctor_profiles
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS landmark TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS google_maps_link TEXT;

-- 2) Add structured address + coordinates to diagnostics_centers
ALTER TABLE diagnostics_centers
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS landmark TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS google_maps_link TEXT;

-- 3) Add structured fields to medical_stores (already has lat/lng but not structured address)
ALTER TABLE medical_stores
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS landmark TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS google_maps_link TEXT;

-- 4) Update seed data for medical_stores (already have lat/lng)
UPDATE medical_stores SET
  city = 'Mumbai', state = 'Maharashtra', pincode = '400001', country = 'India',
  address_line1 = 'Shop 12, MG Road'
WHERE store_name ILIKE '%mumbai%' OR address ILIKE '%mumbai%';

UPDATE medical_stores SET
  city = 'Delhi', state = 'Delhi', pincode = '110001', country = 'India',
  address_line1 = '45, Connaught Place'
WHERE store_name ILIKE '%delhi%' OR address ILIKE '%delhi%';

UPDATE medical_stores SET
  city = 'Bangalore', state = 'Karnataka', pincode = '560001', country = 'India',
  address_line1 = '78, MG Road'
WHERE store_name ILIKE '%bangalore%' OR store_name ILIKE '%bengaluru%' OR address ILIKE '%bangalore%' OR address ILIKE '%bengaluru%';

UPDATE medical_stores SET
  city = 'Chennai', state = 'Tamil Nadu', pincode = '600001', country = 'India',
  address_line1 = '23, Anna Salai'
WHERE store_name ILIKE '%chennai%' OR address ILIKE '%chennai%';

UPDATE medical_stores SET
  city = 'Hyderabad', state = 'Telangana', pincode = '500001', country = 'India',
  address_line1 = '56, Banjara Hills'
WHERE store_name ILIKE '%hyderabad%' OR address ILIKE '%hyderabad%';

-- 5) Update seed diagnostics centers with coordinates
-- Center 1: Mumbai
UPDATE diagnostics_centers SET
  latitude = 19.0760, longitude = 72.8777,
  city = 'Mumbai', state = 'Maharashtra', pincode = '400001', country = 'India',
  address_line1 = '15, Marine Drive'
WHERE address ILIKE '%mumbai%' OR center_name ILIKE '%mumbai%';

-- Center 2: Delhi
UPDATE diagnostics_centers SET
  latitude = 28.6139, longitude = 77.2090,
  city = 'Delhi', state = 'Delhi', pincode = '110001', country = 'India',
  address_line1 = '34, Safdarjung Enclave'
WHERE address ILIKE '%delhi%' OR center_name ILIKE '%delhi%';

-- Center 3: Bangalore
UPDATE diagnostics_centers SET
  latitude = 12.9716, longitude = 77.5946,
  city = 'Bangalore', state = 'Karnataka', pincode = '560001', country = 'India',
  address_line1 = '90, Koramangala'
WHERE address ILIKE '%bangalore%' OR address ILIKE '%bengaluru%' OR center_name ILIKE '%bangalore%' OR center_name ILIKE '%bengaluru%';

-- Center 4: Chennai
UPDATE diagnostics_centers SET
  latitude = 13.0827, longitude = 80.2707,
  city = 'Chennai', state = 'Tamil Nadu', pincode = '600001', country = 'India',
  address_line1 = '67, T Nagar'
WHERE address ILIKE '%chennai%' OR center_name ILIKE '%chennai%';

-- Center 5: Hyderabad
UPDATE diagnostics_centers SET
  latitude = 17.3850, longitude = 78.4867,
  city = 'Hyderabad', state = 'Telangana', pincode = '500001', country = 'India',
  address_line1 = '12, Jubilee Hills'
WHERE address ILIKE '%hyderabad%' OR center_name ILIKE '%hyderabad%';

-- 6) Update seed doctor_profiles with coordinates (from migration 005)
UPDATE doctor_profiles SET
  latitude = 19.0760, longitude = 72.8777,
  city = 'Mumbai', state = 'Maharashtra', pincode = '400001', country = 'India',
  address_line1 = 'Apollo Hospital, Navi Mumbai'
WHERE location ILIKE '%mumbai%' OR hospital ILIKE '%mumbai%';

UPDATE doctor_profiles SET
  latitude = 28.6139, longitude = 77.2090,
  city = 'Delhi', state = 'Delhi', pincode = '110001', country = 'India',
  address_line1 = 'AIIMS Hospital'
WHERE location ILIKE '%delhi%' OR hospital ILIKE '%delhi%';

UPDATE doctor_profiles SET
  latitude = 12.9716, longitude = 77.5946,
  city = 'Bangalore', state = 'Karnataka', pincode = '560001', country = 'India',
  address_line1 = 'Manipal Hospital, Whitefield'
WHERE location ILIKE '%bangalore%' OR location ILIKE '%bengaluru%' OR hospital ILIKE '%bangalore%' OR hospital ILIKE '%bengaluru%';

UPDATE doctor_profiles SET
  latitude = 13.0827, longitude = 80.2707,
  city = 'Chennai', state = 'Tamil Nadu', pincode = '600001', country = 'India',
  address_line1 = 'Fortis Malar Hospital'
WHERE location ILIKE '%chennai%' OR hospital ILIKE '%chennai%';

UPDATE doctor_profiles SET
  latitude = 17.3850, longitude = 78.4867,
  city = 'Hyderabad', state = 'Telangana', pincode = '500001', country = 'India',
  address_line1 = 'Care Hospital, Banjara Hills'
WHERE location ILIKE '%hyderabad%' OR hospital ILIKE '%hyderabad%';

-- Set defaults for any remaining rows without city
UPDATE doctor_profiles SET
  city = 'Mumbai', state = 'Maharashtra', pincode = '400001', country = 'India',
  latitude = 19.0760, longitude = 72.8777
WHERE city IS NULL;

UPDATE diagnostics_centers SET
  city = 'Mumbai', state = 'Maharashtra', pincode = '400001', country = 'India',
  latitude = 19.0760, longitude = 72.8777
WHERE city IS NULL;

UPDATE medical_stores SET
  city = 'Mumbai', state = 'Maharashtra', pincode = '400001', country = 'India'
WHERE city IS NULL;
