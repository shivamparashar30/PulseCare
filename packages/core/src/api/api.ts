/**
 * API Service Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * Currently returns mock data from local JSON files.
 * To connect a real backend, replace the mock implementations below with
 * actual axios calls to your API endpoints.
 *
 * Axios instance is pre-configured — just update BASE_URL in constants.
 */

import axios from 'axios';
import { supabase } from '../../../../packages/supabase/src/client';
import {
  MEDICAL_STORES,
  HEALTH_PACKAGES,
  SAMPLE_APPOINTMENTS,
} from './mockData';
import type {
  Doctor,
  Medicine,
  LabTest,
  MedicalStore,
  HealthPackage,
  Appointment,
  Notification,
} from '../types';

// ─── Axios instance (swap BASE_URL when backend is ready) ────────────────────
export const apiClient = axios.create({
  baseURL: 'https://api.healthcare-plus.com/v1', // replace with real URL
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token automatically
apiClient.interceptors.request.use((config) => {
  // const token = getAuthToken();
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Simulated async delay ───────────────────────────────────────────────────
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ─── Doctor DB → Doctor type mapper ──────────────────────────────────────────
import type { TimeSlot } from '../types';

function mapDoctorFromDB(row: any): Doctor {
  const dp = Array.isArray(row.doctor_profile) ? row.doctor_profile[0] : row.doctor_profile;
  return {
    id: row.id,
    name: row.full_name || 'Doctor',
    specialization: dp?.specialization || 'General Physician',
    qualification: dp?.qualification || 'MBBS',
    experience: dp?.experience_years || 0,
    rating: dp?.rating ? Number(dp.rating) : 4.5,
    reviewCount: dp?.total_reviews || 0,
    fees: dp?.consultation_fee ? Number(dp.consultation_fee) : 500,
    hospital: dp?.hospital || '',
    hospitalAddress: dp?.location || '',
    avatar: dp?.profile_photo_url || row.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.full_name || 'Dr')}&background=2563EB&color=fff&size=200`,
    availableDays: dp?.available_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    availableTimings: generateTimeSlots(),
    about: dp?.about || `${row.full_name} is an experienced ${dp?.specialization || 'doctor'}.`,
    languages: dp?.languages || ['English', 'Hindi'],
    isAvailable: dp?.available !== false,
    nextAvailable: 'Today',
  };
}

function generateTimeSlots(): TimeSlot[] {
  const times = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM','05:30 PM'];
  return times.map((time, i) => ({ id: `t${i}`, time, isBooked: false }));
}

// ─── Doctors (from Supabase) ─────────────────────────────────────────────────
export const doctorsApi = {
  getAll: async (): Promise<Doctor[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, doctor_profile:doctor_profiles(*)')
      .eq('role', 'doctor')
      .eq('status', 'approved');
    if (error || !data) return [];
    return data.map(mapDoctorFromDB);
  },
  getById: async (id: string): Promise<Doctor | undefined> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, doctor_profile:doctor_profiles(*)')
      .eq('id', id)
      .eq('role', 'doctor')
      .single();
    if (error || !data) return undefined;
    return mapDoctorFromDB(data);
  },
  getBySpecialization: async (spec: string): Promise<Doctor[]> => {
    const all = await doctorsApi.getAll();
    return all.filter(d => d.specialization.toLowerCase().includes(spec.toLowerCase()));
  },
  search: async (query: string): Promise<Doctor[]> => {
    const all = await doctorsApi.getAll();
    const q = query.toLowerCase();
    return all.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      d.hospital.toLowerCase().includes(q)
    );
  },
};

// ─── Medicine DB → Medicine type mapper ──────────────────────────────────────
function mapMedicineFromDB(row: any): Medicine {
  const store = Array.isArray(row.store) ? row.store[0] : row.store;
  const price = Number(row.price) || 0;
  const discountPercent = row.discount_percentage || 0;
  const discountedPrice = Math.round(price * (1 - discountPercent / 100));
  const uses = row.uses || [];
  const sideEffects = row.side_effects || [];
  return {
    id: row.id,
    name: row.name,
    company: row.manufacturer || '',
    category: row.category || 'General',
    price,
    discountPercent,
    discountedPrice,
    stock: row.stock_quantity ?? (row.in_stock ? 100 : 0),
    description: row.description || '',
    uses: typeof uses === 'string' ? JSON.parse(uses) : uses,
    sideEffects: typeof sideEffects === 'string' ? JSON.parse(sideEffects) : sideEffects,
    image: row.image_url || '',
    requiresPrescription: row.requires_prescription || false,
    dosageForm: row.dosage_form || 'Tablet',
    strength: row.strength || '',
    packSize: row.pack_size || '',
    storeId: row.store_id,
    storeName: store?.store_name || '',
    approvalStatus: row.approval_status || 'approved',
  };
}

// ─── Medicines (from Supabase) ──────────────────────────────────────────────
export const medicinesApi = {
  getAll: async (): Promise<Medicine[]> => {
    const { data, error } = await supabase
      .from('medicines')
      .select('*, store:medical_stores!medicines_store_fk(store_name)')
      .eq('approval_status', 'approved')
      .eq('in_stock', true)
      .order('name');
    if (error || !data) {
      // Fallback to local mock data
      const { MEDICINES } = require('../../../../apps/patient/src/features/medicalStore/services/medicineData');
      return MEDICINES;
    }
    return data.map(mapMedicineFromDB);
  },
  getById: async (id: string): Promise<Medicine | undefined> => {
    const { data, error } = await supabase
      .from('medicines')
      .select('*, store:medical_stores!medicines_store_fk(store_name)')
      .eq('id', id)
      .single();
    if (error || !data) return undefined;
    return mapMedicineFromDB(data);
  },
  getByStore: async (storeId: string): Promise<Medicine[]> => {
    const { data, error } = await supabase
      .from('medicines')
      .select('*, store:medical_stores!medicines_store_fk(store_name)')
      .eq('store_id', storeId)
      .eq('approval_status', 'approved')
      .eq('in_stock', true)
      .order('name');
    if (error || !data) return [];
    return data.map(mapMedicineFromDB);
  },
  getByCategory: async (category: string): Promise<Medicine[]> => {
    const { data, error } = await supabase
      .from('medicines')
      .select('*, store:medical_stores!medicines_store_fk(store_name)')
      .eq('approval_status', 'approved')
      .eq('in_stock', true)
      .ilike('category', `%${category}%`)
      .order('name');
    if (error || !data) return [];
    return data.map(mapMedicineFromDB);
  },
  search: async (query: string): Promise<Medicine[]> => {
    const { data, error } = await supabase
      .from('medicines')
      .select('*, store:medical_stores!medicines_store_fk(store_name)')
      .eq('approval_status', 'approved')
      .eq('in_stock', true)
      .or(`name.ilike.%${query}%,manufacturer.ilike.%${query}%,category.ilike.%${query}%`)
      .order('name');
    if (error || !data) return [];
    return data.map(mapMedicineFromDB);
  },
};

// ─── Medical Stores (from Supabase) ─────────────────────────────────────────
export const storesApi = {
  getAll: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('medical_stores')
      .select('*')
      .order('rating', { ascending: false });
    if (error || !data) return MEDICAL_STORES;
    return data.map((s: any) => ({
      id: s.id,
      name: s.store_name,
      address: s.address || '',
      rating: Number(s.rating) || 0,
      phone: s.phone || '',
      isOpen: s.is_open ?? true,
      openTime: s.open_time || '08:00 AM',
      closeTime: s.close_time || '10:00 PM',
      image: s.store_image || '',
      latitude: s.latitude ? Number(s.latitude) : undefined,
      longitude: s.longitude ? Number(s.longitude) : undefined,
      deliveryAvailable: s.delivery_available ?? true,
      deliveryRadiusKm: s.delivery_radius_km ? Number(s.delivery_radius_km) : 5,
      licenseNumber: s.license_number,
    }));
  },
  getById: async (id: string): Promise<any | undefined> => {
    const { data, error } = await supabase
      .from('medical_stores')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return undefined;
    return {
      id: data.id,
      name: data.store_name,
      address: data.address || '',
      rating: Number(data.rating) || 0,
      phone: data.phone || '',
      isOpen: data.is_open ?? true,
      openTime: data.open_time || '08:00 AM',
      closeTime: data.close_time || '10:00 PM',
      image: data.store_image || '',
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined,
      deliveryAvailable: data.delivery_available ?? true,
      deliveryRadiusKm: data.delivery_radius_km ? Number(data.delivery_radius_km) : 5,
      licenseNumber: data.license_number,
    };
  },
};

// ─── Lab Tests (from Supabase via center_tests) ─────────────────────────────

function mapCenterTestFromDB(row: any): any {
  const catalog = Array.isArray(row.catalog) ? row.catalog[0] : row.catalog;
  const center = Array.isArray(row.center) ? row.center[0] : row.center;
  const price = Number(row.price) || 0;
  const discountPercent = row.discount_percentage || 0;
  const discountedPrice = Math.round(price * (1 - discountPercent / 100));
  const params = catalog?.parameters || [];
  const prep = catalog?.preparation;
  return {
    id: row.id, // center_test id (used for booking)
    catalogTestId: row.lab_test_id,
    name: catalog?.name || 'Lab Test',
    category: catalog?.category || 'General',
    price: discountedPrice,
    discountPercent,
    discountedPrice,
    reportTime: row.report_time || catalog?.report_time || '24 hours',
    description: catalog?.description || '',
    preparation: prep ? (Array.isArray(prep) ? prep : [prep]) : [],
    includes: typeof params === 'string' ? JSON.parse(params) : params,
    isPopular: false,
    image: '',
    homeCollection: row.home_collection ?? false,
    diagnosticsCenterId: row.diagnostics_center_id,
    centerName: center?.center_name || '',
    centerAddress: center?.address || '',
    originalPrice: price,
    sampleType: row.home_collection ? 'Blood / Urine' : 'At Center',
    preparationInstructions: prep ? (Array.isArray(prep) ? prep : [prep]) : [],
  };
}

export const labApi = {
  getAll: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('center_tests')
      .select('*, catalog:lab_tests!lab_test_id(name, category, description, preparation, parameters, report_time), center:diagnostics_centers!diagnostics_center_id(center_name, address)')
      .eq('is_available', true)
      .order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      // Fallback: try legacy lab_tests with diagnostics_center_id
      const { data: legacy, error: legErr } = await supabase
        .from('lab_tests')
        .select('*, center:diagnostics_centers!diagnostics_center_id(center_name, address)')
        .not('diagnostics_center_id', 'is', null)
        .order('name');
      if (legErr || !legacy) return [];
      return legacy.map(mapLegacyLabTestFromDB);
    }
    return data.map(mapCenterTestFromDB);
  },
  getById: async (id: string): Promise<any | undefined> => {
    // Try center_tests first
    const { data, error } = await supabase
      .from('center_tests')
      .select('*, catalog:lab_tests!lab_test_id(name, category, description, preparation, parameters, report_time), center:diagnostics_centers!diagnostics_center_id(center_name, address, phone)')
      .eq('id', id)
      .single();
    if (!error && data) return mapCenterTestFromDB(data);
    // Fallback: try legacy lab_tests
    const { data: legacy, error: legErr } = await supabase
      .from('lab_tests')
      .select('*, center:diagnostics_centers!diagnostics_center_id(center_name, address, phone)')
      .eq('id', id)
      .single();
    if (legErr || !legacy) return undefined;
    return mapLegacyLabTestFromDB(legacy);
  },
  search: async (query: string): Promise<any[]> => {
    // Search via catalog name through center_tests
    const { data, error } = await supabase
      .from('center_tests')
      .select('*, catalog:lab_tests!lab_test_id!inner(name, category, description, preparation, parameters, report_time), center:diagnostics_centers!diagnostics_center_id(center_name, address)')
      .eq('is_available', true)
      .ilike('catalog.name', `%${query}%`);
    if (error || !data || data.length === 0) {
      const { data: legacy, error: legErr } = await supabase
        .from('lab_tests')
        .select('*, center:diagnostics_centers!diagnostics_center_id(center_name, address)')
        .not('diagnostics_center_id', 'is', null)
        .ilike('name', `%${query}%`)
        .order('name');
      if (legErr || !legacy) return [];
      return legacy.map(mapLegacyLabTestFromDB);
    }
    return data.map(mapCenterTestFromDB);
  },
};

// Legacy mapper for old lab_tests rows (diagnostics_center_id directly on lab_tests)
function mapLegacyLabTestFromDB(row: any): any {
  const center = Array.isArray(row.center) ? row.center[0] : row.center;
  const price = Number(row.price) || 0;
  const discountPercent = row.discount_percentage || 0;
  const discountedPrice = Math.round(price * (1 - discountPercent / 100));
  const params = row.parameters || [];
  return {
    id: row.id,
    catalogTestId: row.id,
    name: row.name,
    category: row.category || 'General',
    price: discountedPrice,
    discountPercent,
    discountedPrice,
    reportTime: row.report_time || '24 hours',
    description: row.description || '',
    preparation: row.preparation ? (Array.isArray(row.preparation) ? row.preparation : [row.preparation]) : [],
    includes: typeof params === 'string' ? JSON.parse(params) : params,
    isPopular: false,
    image: '',
    homeCollection: row.home_collection ?? false,
    diagnosticsCenterId: row.diagnostics_center_id,
    centerName: center?.center_name || '',
    centerAddress: center?.address || '',
    originalPrice: price,
    sampleType: row.home_collection ? 'Blood / Urine' : 'At Center',
    preparationInstructions: row.preparation ? (Array.isArray(row.preparation) ? row.preparation : [row.preparation]) : [],
  };
}

// ─── storesApi is now defined above with Supabase integration ────────────────

// ─── Health Packages (from Supabase) ─────────────────────────────────────────
export const packagesApi = {
  getById: async (id: string): Promise<HealthPackage | null> => {
    const { data, error } = await supabase
      .from('health_packages')
      .select('*, center:diagnostics_centers!diagnostics_center_id(center_name, address)')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    const center = Array.isArray(data.center) ? data.center[0] : data.center;
    const price = Number(data.price) || 0;
    const originalPrice = Number(data.original_price) || price;
    const tests = typeof data.tests === 'string' ? JSON.parse(data.tests) : (data.tests || []);
    return {
      id: data.id,
      name: data.name,
      category: data.category || 'Basic',
      description: data.description || '',
      tests,
      price,
      originalPrice,
      discountPercent: Number(data.discount_percentage) || 0,
      discountedPrice: price,
      reportTime: data.report_time || '24 hours',
      image: '',
      isPopular: data.is_popular || false,
      centerName: center?.center_name || '',
      centerAddress: center?.address || '',
      homeCollection: data.home_collection ?? true,
      diagnosticsCenterId: data.diagnostics_center_id,
    };
  },
  getAll: async (): Promise<HealthPackage[]> => {
    const { data, error } = await supabase
      .from('health_packages')
      .select('*, center:diagnostics_centers!diagnostics_center_id(center_name, address)')
      .eq('is_active', true)
      .order('is_popular', { ascending: false })
      .order('name');
    if (error || !data || data.length === 0) return HEALTH_PACKAGES;
    return data.map((row: any) => {
      const center = Array.isArray(row.center) ? row.center[0] : row.center;
      const price = Number(row.price) || 0;
      const originalPrice = Number(row.original_price) || price;
      const discountPercent = Number(row.discount_percentage) || 0;
      const tests = typeof row.tests === 'string' ? JSON.parse(row.tests) : (row.tests || []);
      return {
        id: row.id,
        name: row.name,
        category: row.category || 'Basic',
        description: row.description || '',
        tests,
        price,
        originalPrice,
        discountPercent,
        discountedPrice: price,
        reportTime: row.report_time || '24 hours',
        image: '',
        isPopular: row.is_popular || false,
        centerName: center?.center_name || '',
        centerAddress: center?.address || '',
        homeCollection: row.home_collection ?? true,
        diagnosticsCenterId: row.diagnostics_center_id,
      };
    });
  },
};

// ─── Appointments ─────────────────────────────────────────────────────────────
export const appointmentsApi = {
  getAll: async (): Promise<Appointment[]> => {
    await delay();
    return SAMPLE_APPOINTMENTS;
  },
  getById: async (id: string): Promise<Appointment | undefined> => {
    await delay(200);
    return SAMPLE_APPOINTMENTS.find((a) => a.id === id);
  },
};

// ─── Notifications (Supabase) ─────────────────────────────────────────────────
export const notificationsApi = {
  getByUser: async (userId: string, role?: string): Promise<Notification[]> => {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (role) query = query.eq('role', role);
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      type: row.type || 'general',
      isRead: row.read ?? false,
      createdAt: row.created_at,
      actionType: row.action_type,
      actionId: row.action_id,
      role: row.role,
    }));
  },
  markRead: async (id: string): Promise<void> => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  },
  markAllRead: async (userId: string, role?: string): Promise<void> => {
    let query = supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
    if (role) query = query.eq('role', role);
    await query;
  },
  getUnreadCount: async (userId: string, role?: string): Promise<number> => {
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    if (role) query = query.eq('role', role);
    const { count } = await query;
    return count || 0;
  },
  // Keep backward compat
  getAll: async (): Promise<Notification[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];
    return notificationsApi.getByUser(session.user.id);
  },
};
