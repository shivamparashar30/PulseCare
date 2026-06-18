-- ============================================
-- 012: Add FK from lab_bookings to diagnostics_centers
-- ============================================
-- lab_bookings.diagnostics_center_id currently references profiles(id).
-- We need a second FK to diagnostics_centers(id) so PostgREST can
-- resolve joins like: center:diagnostics_centers!diagnostics_center_id(...)

ALTER TABLE lab_bookings
  ADD CONSTRAINT lab_bookings_center_fk
  FOREIGN KEY (diagnostics_center_id) REFERENCES diagnostics_centers(id);
