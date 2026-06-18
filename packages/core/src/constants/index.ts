// ============================================
// DESIGN TOKENS & CONSTANTS
// ============================================

export const COLORS = {
  // Primary palette — deep medical blue
  primary: '#0066CC',
  primaryDark: '#004999',
  primaryLight: '#3385D6',
  primaryUltraLight: '#E8F2FF',

  // Accent — health green
  accent: '#00A86B',
  accentDark: '#007A4F',
  accentLight: '#33BA88',
  accentUltraLight: '#E6F7F2',

  // Warning / Alert
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  success: '#10B981',
  successLight: '#D1FAE5',

  // Neutrals
  white: '#FFFFFF',
  black: '#0A0A0A',
  background: '#F7F9FC',
  card: '#FFFFFF',
  border: '#E8ECF0',
  divider: '#F0F4F8',

  // Text
  textPrimary: '#1A1F36',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Dark mode
  darkBackground: '#0F172A',
  darkCard: '#1E293B',
  darkBorder: '#334155',
  darkTextPrimary: '#F1F5F9',
  darkTextSecondary: '#94A3B8',

  // Category colors
  categoryBlue: '#3B82F6',
  categoryGreen: '#10B981',
  categoryPurple: '#8B5CF6',
  categoryOrange: '#F59E0B',
  categoryRed: '#EF4444',
  categoryTeal: '#14B8A6',
  categoryPink: '#EC4899',
  categoryIndigo: '#6366F1',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const FONT_SIZES = {
  xs: 11,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Razorpay Test Mode Key
export const RAZORPAY_KEY = 'rzp_test_T2JtfeGzvhRvDg';

export const APP_NAME = 'HealthCare+';

export const SPECIALIZATIONS = [
  'Cardiologist',
  'Dermatologist',
  'General Physician',
  'Neurologist',
  'Orthopedic',
  'Pediatrician',
  'Psychiatrist',
  'Gynecologist',
  'Ophthalmologist',
  'ENT Specialist',
  'Dentist',
  'Urologist',
  'Endocrinologist',
  'Pulmonologist',
  'Oncologist',
];

export const MEDICINE_CATEGORIES = [
  'All',
  'Tablets',
  'Capsules',
  'Syrups',
  'Injections',
  'Drops',
  'Ointments',
  'Vitamins',
  'Ayurvedic',
];

export const LAB_CATEGORIES = [
  'All',
  'Blood Tests',
  'Urine Tests',
  'Imaging',
  'Cardiac',
  'Thyroid',
  'Diabetes',
  'Vitamins',
  'Packages',
];

export const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
  { label: 'Experience', value: 'experience' },
];
