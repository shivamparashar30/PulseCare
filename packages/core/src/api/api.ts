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
import { DOCTORS } from '../../../../apps/patient/src/features/doctor/services/doctorData';
import { MEDICINES } from '../../../../apps/patient/src/features/medicalStore/services/medicineData';
import {
  LAB_TESTS,
  MEDICAL_STORES,
  HEALTH_PACKAGES,
  SAMPLE_APPOINTMENTS,
  NOTIFICATIONS,
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

// ─── Doctors ─────────────────────────────────────────────────────────────────
export const doctorsApi = {
  getAll: async (): Promise<Doctor[]> => {
    await delay();
    return DOCTORS;
  },
  getById: async (id: string): Promise<Doctor | undefined> => {
    await delay(200);
    return DOCTORS.find((d) => d.id === id);
  },
  getBySpecialization: async (spec: string): Promise<Doctor[]> => {
    await delay();
    return DOCTORS.filter((d) =>
      d.specialization.toLowerCase().includes(spec.toLowerCase()),
    );
  },
  search: async (query: string): Promise<Doctor[]> => {
    await delay(300);
    const q = query.toLowerCase();
    return DOCTORS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.hospital.toLowerCase().includes(q),
    );
  },
};

// ─── Medicines ────────────────────────────────────────────────────────────────
export const medicinesApi = {
  getAll: async (): Promise<Medicine[]> => {
    await delay();
    return MEDICINES;
  },
  getById: async (id: string): Promise<Medicine | undefined> => {
    await delay(200);
    return MEDICINES.find((m) => m.id === id);
  },
  getByCategory: async (category: string): Promise<Medicine[]> => {
    await delay();
    return MEDICINES.filter((m) =>
      m.category.toLowerCase().includes(category.toLowerCase()),
    );
  },
  search: async (query: string): Promise<Medicine[]> => {
    await delay(300);
    const q = query.toLowerCase();
    return MEDICINES.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q),
    );
  },
};

// ─── Lab Tests ────────────────────────────────────────────────────────────────
export const labApi = {
  getAll: async (): Promise<LabTest[]> => {
    await delay();
    return LAB_TESTS;
  },
  getById: async (id: string): Promise<LabTest | undefined> => {
    await delay(200);
    return LAB_TESTS.find((t) => t.id === id);
  },
  search: async (query: string): Promise<LabTest[]> => {
    await delay(300);
    const q = query.toLowerCase();
    return LAB_TESTS.filter((t) => t.name.toLowerCase().includes(q));
  },
};

// ─── Medical Stores ───────────────────────────────────────────────────────────
export const storesApi = {
  getAll: async (): Promise<MedicalStore[]> => {
    await delay();
    return MEDICAL_STORES;
  },
};

// ─── Health Packages ──────────────────────────────────────────────────────────
export const packagesApi = {
  getAll: async (): Promise<HealthPackage[]> => {
    await delay();
    return HEALTH_PACKAGES;
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

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    await delay();
    return NOTIFICATIONS;
  },
};
