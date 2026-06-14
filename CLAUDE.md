# CLAUDE.md - Project Guide for Claude Code

## Project Overview

**PulseCare / Medico** — A healthcare super app built with React Native (Expo) and TypeScript. Features doctor appointment booking, e-pharmacy, lab test scheduling, health records, and Razorpay payments.

## Tech Stack

- **Framework:** React Native (Expo SDK 51)
- **Language:** TypeScript (strict mode)
- **Navigation:** React Navigation v6 (native-stack + bottom-tabs)
- **State:** Context API (Auth, Cart, Theme) + Zustand
- **Server State:** TanStack React Query v5
- **HTTP:** Axios
- **Forms:** React Hook Form
- **Payments:** Razorpay
- **Animations:** react-native-reanimated + react-native-gesture-handler

## Project Structure

```
src/
├── components/common/   # Shared UI components
├── screens/
│   ├── auth/            # Login, Signup, ForgotPassword
│   ├── home/            # Home, Search, Notifications, MedicalStores, HealthPackages
│   ├── doctors/         # DoctorsList, DoctorDetail, BookAppointment, Payment, Success
│   ├── pharmacy/        # PharmacyHome, MedicineDetail, Cart, Checkout, OrderSuccess, Wishlist
│   ├── lab/             # LabTests, LabTestDetail, LabBooking
│   ├── appointments/    # AppointmentsList, AppointmentDetail
│   └── profile/         # Profile, EditProfile, HealthRecords, HelpCenter, PrivacyPolicy
├── navigation/          # AppNavigator (stack + tab config)
├── context/             # AuthContext, CartContext, ThemeContext
├── services/            # API layer (Axios)
├── hooks/               # Custom hooks
├── data/                # Static data (doctors, medicines)
├── utils/               # Utility functions
├── constants/           # App-wide constants
└── types/               # TypeScript type definitions
```

## Key Commands

```bash
npm install              # Install dependencies
npx expo start           # Start dev server
npx expo start --ios     # Run on iOS
npx expo start --android # Run on Android
npm run typecheck         # TypeScript type checking (tsc --noEmit)
```

## Architecture Notes

- **Entry point:** `App.tsx` — wraps app in GestureHandlerRootView > SafeAreaProvider > QueryClientProvider > ThemeProvider > AuthProvider > CartProvider
- **Path alias:** `@/*` maps to `src/*` (configured in tsconfig.json)
- **React Query defaults:** 2 retries, 5min stale time, 10min GC time, no refetch on window focus
- **Dark mode:** Managed via ThemeContext, StatusBar auto-flips style

## Conventions

- Use TypeScript strict mode — avoid `any`
- Screens follow the pattern: `src/screens/<module>/<ScreenName>Screen.tsx`
- Shared components go in `src/components/common/`
- Types are centralized in `src/types/index.ts`
- Constants are centralized in `src/constants/index.ts`
