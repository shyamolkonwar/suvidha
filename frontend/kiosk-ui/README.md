# Kiosk UI Frontend

## Overview

React + TypeScript frontend for the SUVIDHA Digital Receptionist Kiosk System.

## Features

- **Multi-language Support:** English and Hindi with i18next
- **Touch-Optimized UI:** Larger buttons and text for kiosk touch screens
- **Material Design:** Clean, modern UI with Material-UI components
- **Authentication:** JWT-based authentication with auto token refresh
- **Responsive:** Works on different screen sizes
- **State Management:** Zustand for global state

## Tech Stack

- React 18
- TypeScript
- Vite (build tool)
- Material-UI v5
- i18next (internationalization)
- React Router v6
- Axios (API client)
- Zustand (state management)

## Setup

```powershell
# Install dependencies
cd frontend/kiosk-ui
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## Available Pages

1. **Login Page** (`/login`)
   - Consumer ID and password login
   - Language selector
   - Auto-redirect if already logged in

2. **Dashboard** (`/dashboard`)
   - Service cards for quick navigation
   - Bills, Payments, Complaints, Meter Reading, Profile

3. **Bills** (`/bills`)
   - View electricity, gas, and water bills
   - Tab-based navigation
   - Pay button for pending bills
   - Bill status indicators

## API Integration

All API calls go through the centralized axios client with:
- Automatic token injection in headers
- Auto-redirect to login on 401 errors
- Request/response interceptors
- Proxy to backend during development

## Multilingual

Supports **10 languages** (currently English and Hindi implemented):
- English (en)
- Hindi (hi)

Languages can be easily added in `src/i18n/index.ts`.

## State Management

Using Zustand for:
- **Auth State:** User info, token, authentication status
- Persisted in localStorage
- Auto-hydration on page reload

## Folder Structure

```
src/
├── api/                  # API client and endpoints
│   ├── client.ts         # Axios instance with interceptors
│   └── index.ts          # API functions (authAPI, utilityAPI, etc.)
├── pages/                # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   └── BillsPage.tsx
├── store/                # Zustand stores
│   └── authStore.ts
├── i18n/                 # Internationalization
│   └── index.ts          # i18next configuration
├── App.tsx               # Main app with routing
└── main.tsx              # Entry point

## Scripts

```powershell
npm run dev           # Start development server (port 3000)
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint
```

## Docker

Build and run in production:

```powershell
docker build -t kiosk-ui .
docker run -p 3000:3000 kiosk-ui
```

## Next Steps

To complete the MVP:

1. **Add remaining pages:**
   - Payment page
   - Complaints page
   - Meter reading page
   - Profile page

2. **Add features:**
   - Form validation
   - Error handling
   - Toast notifications
   - Loading states
   - Payment gateway integration

3. **Accessibility:**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - High contrast mode

4. **Testing:**
   - Unit tests (Vitest)
   - Component tests (React Testing Library)
   - E2E tests (Playwright)
