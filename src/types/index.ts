// ============================================
// CORE APPLICATION TYPES
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  address?: Address;
  familyMembers?: FamilyMember[];
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  gender: string;
  bloodGroup?: string;
}

// ============================================
// DOCTOR TYPES
// ============================================

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  rating: number;
  reviewCount: number;
  fees: number;
  hospital: string;
  hospitalAddress: string;
  avatar: string;
  availableDays: string[];
  availableTimings: TimeSlot[];
  about: string;
  languages: string[];
  isAvailable: boolean;
  nextAvailable?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  isBooked: boolean;
}

// ============================================
// APPOINTMENT TYPES
// ============================================

export interface Appointment {
  id: string;
  doctorId: string;
  doctor: Doctor;
  patientName: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled' | 'Pending';
  type: 'In-Clinic' | 'Video';
  amount: number;
  symptoms?: string;
  notes?: string;
  prescription?: Prescription;
  paymentId?: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorName: string;
  date: string;
  medicines: PrescribedMedicine[];
  notes: string;
  followUp?: string;
}

export interface PrescribedMedicine {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

// ============================================
// PHARMACY TYPES
// ============================================

export interface Medicine {
  id: string;
  name: string;
  company: string;
  category: string;
  price: number;
  discountPercent: number;
  discountedPrice: number;
  stock: number;
  description: string;
  uses: string[];
  sideEffects: string[];
  image: string;
  requiresPrescription: boolean;
  dosageForm: string;
  strength: string;
  packSize: string;
  isWishlisted?: boolean;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  discount: number;
  deliveryFee: number;
  payableAmount: number;
  status: 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  placedAt: string;
  deliveryAddress: Address;
  paymentId?: string;
}

// ============================================
// LAB TEST TYPES
// ============================================

export interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPercent: number;
  discountedPrice: number;
  reportTime: string;
  description: string;
  preparation: string[];
  includes?: string[];
  isPopular: boolean;
  image: string;
}

export interface LabBooking {
  id: string;
  testId: string;
  test: LabTest;
  patientName: string;
  date: string;
  timeSlot: string;
  status: 'Scheduled' | 'Sample Collected' | 'Processing' | 'Report Ready' | 'Cancelled';
  amount: number;
  address: Address;
  paymentId?: string;
  reportUrl?: string;
}

// ============================================
// MEDICAL STORE TYPES
// ============================================

export interface MedicalStore {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  phone: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  image: string;
  services: string[];
}

// ============================================
// HEALTH PACKAGE TYPES
// ============================================

export interface HealthPackage {
  id: string;
  name: string;
  description: string;
  tests: string[];
  price: number;
  discountPercent: number;
  discountedPrice: number;
  reportTime: string;
  image: string;
  isPopular: boolean;
}

// ============================================
// NAVIGATION TYPES
// ============================================

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Doctors: undefined;
  Pharmacy: undefined;
  Appointments: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Notifications: undefined;
  Search: undefined;
  LabTests: undefined;
  LabTestDetail: { testId: string };
  LabBooking: { testId: string };
  MedicalStores: undefined;
  HealthPackages: undefined;
  HealthRecords: undefined;
};

export type DoctorStackParamList = {
  DoctorsList: undefined;
  DoctorDetail: { doctorId: string };
  BookAppointment: { doctorId: string };
  AppointmentPayment: { doctorId: string; date: string; time: string; amount: number };
  AppointmentSuccess: { appointmentId: string };
};

export type PharmacyStackParamList = {
  PharmacyHome: undefined;
  MedicineDetail: { medicineId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
  Wishlist: undefined;
};

export type AppointmentStackParamList = {
  AppointmentsList: undefined;
  AppointmentDetail: { appointmentId: string };
  LabBookings: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  SavedAddresses: undefined;
  FamilyMembers: undefined;
  HealthRecords: undefined;
  PaymentHistory: undefined;
  NotificationSettings: undefined;
  HelpCenter: undefined;
  PrivacyPolicy: undefined;
};

// ============================================
// PAYMENT TYPES
// ============================================

export interface PaymentOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  orderId?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color: string;
  };
}

export interface PaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

// ============================================
// MISC TYPES
// ============================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'order' | 'lab' | 'general';
  isRead: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  route: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  color: string;
  actionText: string;
}
