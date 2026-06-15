# CLAUDE.md - Healthcare Monorepo

## Overview

Turborepo + pnpm monorepo with 4 Expo apps sharing common packages.

## Apps

| App | Package | Port | Description |
|-----|---------|------|-------------|
| Patient | `@healthcare/patient` | 8081 | Patient-facing: book doctors, order medicines, lab tests |
| Doctor | `@healthcare/doctor` | 8082 | Doctor panel: manage appointments, patients (skeleton) |
| Medical Store | `@healthcare/medical-store` | 8083 | Store panel: manage inventory, orders (skeleton) |
| Diagnostics | `@healthcare/diagnostics` | 8084 | Lab panel: manage bookings, reports (skeleton) |

## Commands

```bash
# Install
pnpm install

# Run individual apps
pnpm dev:patient          # Start patient app
pnpm dev:doctor           # Start doctor app
pnpm dev:medical-store    # Start medical store app
pnpm dev:diagnostics      # Start diagnostics app

# Run on Android
pnpm android:patient
pnpm android:doctor
pnpm android:medical-store
pnpm android:diagnostics

# Run all apps in parallel
pnpm dev

# Type check all
pnpm typecheck
```

## Structure

```
HealthcareApp/
├── apps/
│   ├── patient/              # Full patient app (complete)
│   │   ├── src/features/     # auth, patient, doctor, medicalStore, diagnostics
│   │   ├── App.tsx
│   │   ├── app.json
│   │   ├── metro.config.js
│   │   └── package.json
│   ├── doctor/               # Doctor panel (skeleton)
│   ├── medicalStore/         # Medical store panel (skeleton)
│   └── diagnostics/          # Diagnostics panel (skeleton)
├── packages/
│   ├── core/                 # @healthcare/core
│   │   └── src/
│   │       ├── api/          # Axios client, mock data
│   │       ├── constants/    # Colors, fonts, spacing, shadows
│   │       ├── hooks/        # React Query hooks
│   │       ├── navigation/   # AppNavigator (patient app)
│   │       ├── types/        # All TypeScript interfaces
│   │       └── utils/        # formatDate, currency, etc.
│   ├── shared/               # @healthcare/shared
│   │   └── src/
│   │       ├── components/   # Button, Card, Header, Input, etc.
│   │       └── assets/       # Images
│   └── providers/            # @healthcare/providers
│       └── src/
│           ├── AuthProvider.tsx
│           └── ThemeProvider.tsx
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Tech Stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Framework:** React Native (Expo SDK 51)
- **Language:** TypeScript (strict mode)
- **Navigation:** React Navigation v6
- **State:** Context API + TanStack React Query v5
- **HTTP:** Axios
- **Payments:** Razorpay

## Conventions

- Each app is an independent Expo project with its own `app.json`, `metro.config.js`
- Shared code lives in `packages/` with `workspace:*` dependencies
- Metro config includes monorepo root in `watchFolders` for package resolution
- Feature screens: `apps/<app>/src/features/<feature>/screens/`
- Feature-specific context stays in feature folder
- Global providers in `packages/providers/`
