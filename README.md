# SUVIDHA - Smart City Governance Platform

A modern web application for municipal service management including bill payments, grievance reporting, and city alerts.

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling

### Backend
- **FastAPI** - Modern Python web framework
- **Supabase** - Database and authentication
- **JWT (ES256/HS256)** - Token-based authentication

## Project Structure

```
SUDVIDA/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── core/        # Config, database, security
│   │   ├── routers/     # API endpoints
│   │   ├── services/    # Business logic
│   │   └── models/      # Pydantic models
│   ├── supabase/        # Database schema
│   └── requirements.txt # Python dependencies
├── frontend/
│   └── landing/         # Next.js frontend
│       ├── app/         # App router pages
│       ├── components/  # Reusable components
│       └── lib/         # API client
└── v1/                  # Legacy microservices (archived)
```

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- Supabase account

### 1. Clone & Install

```bash
# Frontend
cd frontend/landing
npm install
npm run dev
# Visit http://localhost:3000

# Backend (new terminal)
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Supabase credentials
uvicorn app.main:app --reload
# API runs at http://localhost:8000
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `backend/supabase/schema.sql` in Supabase SQL Editor
3. Get your credentials from Project Settings > API

### 3. Environment Variables

**Backend (backend/.env):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
MOCK_MODE=false
```

## Available Scripts

### Frontend
```bash
npm run dev    # Development server
npm run build  # Production build
npm run start  # Start production server
```

### Backend
```bash
uvicorn app.main:app --reload  # Development
uvicorn app.main:app --host 0.0.0.0 --port 8000  # Production
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `GET /auth/me` - Get current user

### Dashboard
- `GET /api/dashboard/summary` - User dashboard data
- `GET /api/dashboard/system-status` - System status

### Billing
- `GET /api/bills` - List user bills
- `GET /api/bills/pending` - Pending bills

### Grievances
- `GET /api/grievances` - List grievances
- `POST /api/grievances` - Create grievance

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment

## Features

| Feature | Status |
|---------|--------|
| Email/Password Auth | ✅ |
| Dashboard with 3-column layout | ✅ |
| Bill Management | ✅ |
| Grievance Tracking | ✅ |
| Payment Integration | ✅ |
| City Alerts | ✅ |
| Multi-language (i18n) | 🔜 Coming Soon |

## Design System

- **Primary Color:** Signal Green (#00D26A)
- **Secondary:** Deep Forest (#0A3D2E)
- **Font:** Inter (system UI stack)
- **Layout:** Bento grid, 3-column dashboard

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
