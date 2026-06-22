-- Migration 023: Add available time configuration for doctors and diagnostics centers
-- Allows configuring available_start_time and available_end_time for appointment slots

-- Add available time columns to doctor_profiles
ALTER TABLE doctor_profiles
  ADD COLUMN IF NOT EXISTS available_start_time TEXT DEFAULT '09:00 AM',
  ADD COLUMN IF NOT EXISTS available_end_time TEXT DEFAULT '06:00 PM';

-- Add available time columns to diagnostics_centers
ALTER TABLE diagnostics_centers
  ADD COLUMN IF NOT EXISTS available_start_time TEXT DEFAULT '07:00 AM',
  ADD COLUMN IF NOT EXISTS available_end_time TEXT DEFAULT '04:00 PM';
