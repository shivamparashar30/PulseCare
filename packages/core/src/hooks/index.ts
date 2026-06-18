/**
 * Custom React Query hooks
 * ─────────────────────────────────────────────────────────────────────────────
 * All data-fetching logic lives here so screens stay clean.
 */

import { useQuery } from '@tanstack/react-query';
import {
  doctorsApi,
  medicinesApi,
  labApi,
  storesApi,
  packagesApi,
  appointmentsApi,
  notificationsApi,
} from '../api/api';

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const useDoctors = () =>
  useQuery({ queryKey: ['doctors'], queryFn: doctorsApi.getAll });

export const useDoctor = (id: string) =>
  useQuery({ queryKey: ['doctor', id], queryFn: async () => (await doctorsApi.getById(id)) ?? null });

export const useDoctorsBySpec = (spec: string) =>
  useQuery({
    queryKey: ['doctors', 'spec', spec],
    queryFn: () => doctorsApi.getBySpecialization(spec),
    enabled: !!spec,
  });

export const useDoctorSearch = (query: string) =>
  useQuery({
    queryKey: ['doctors', 'search', query],
    queryFn: () => doctorsApi.search(query),
    enabled: query.length > 1,
  });

// ─── Medicines ────────────────────────────────────────────────────────────────
export const useMedicines = () =>
  useQuery({ queryKey: ['medicines'], queryFn: medicinesApi.getAll });

export const useMedicine = (id: string) =>
  useQuery({ queryKey: ['medicine', id], queryFn: () => medicinesApi.getById(id) });

export const useMedicinesByCategory = (category: string) =>
  useQuery({
    queryKey: ['medicines', 'cat', category],
    queryFn: () => medicinesApi.getByCategory(category),
    enabled: !!category,
  });

export const useMedicineSearch = (query: string) =>
  useQuery({
    queryKey: ['medicines', 'search', query],
    queryFn: () => medicinesApi.search(query),
    enabled: query.length > 1,
  });

// ─── Lab Tests ────────────────────────────────────────────────────────────────
export const useLabTests = () =>
  useQuery({ queryKey: ['labTests'], queryFn: labApi.getAll });

export const useLabTest = (id: string | undefined) =>
  useQuery({ queryKey: ['labTest', id], queryFn: () => labApi.getById(id!), enabled: !!id });

// ─── Stores ───────────────────────────────────────────────────────────────────
export const useMedicalStores = () =>
  useQuery({ queryKey: ['stores'], queryFn: storesApi.getAll });

export const useMedicalStore = (id: string) =>
  useQuery({ queryKey: ['store', id], queryFn: () => storesApi.getById(id), enabled: !!id });

export const useMedicinesByStore = (storeId: string) =>
  useQuery({ queryKey: ['medicines', 'store', storeId], queryFn: () => medicinesApi.getByStore(storeId), enabled: !!storeId });

// ─── Health Packages ──────────────────────────────────────────────────────────
export const useHealthPackages = () =>
  useQuery({ queryKey: ['packages'], queryFn: packagesApi.getAll });

export const useHealthPackage = (id: string | undefined) =>
  useQuery({ queryKey: ['package', id], queryFn: () => packagesApi.getById(id!), enabled: !!id });

// ─── Appointments ─────────────────────────────────────────────────────────────
export const useAppointments = () =>
  useQuery({ queryKey: ['appointments'], queryFn: appointmentsApi.getAll });

export const useAppointment = (id: string) =>
  useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentsApi.getById(id),
  });

// ─── Notifications ────────────────────────────────────────────────────────────
export const useNotifications = (userId?: string, role?: string) =>
  useQuery({
    queryKey: ['notifications', userId, role],
    queryFn: () => notificationsApi.getByUser(userId!, role),
    enabled: !!userId,
  });

export const useUnreadCount = (userId?: string, role?: string) =>
  useQuery({
    queryKey: ['unreadCount', userId, role],
    queryFn: () => notificationsApi.getUnreadCount(userId!, role),
    enabled: !!userId,
    refetchInterval: 30000, // poll every 30s
  });
