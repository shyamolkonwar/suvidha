# SUVIDHA Digital Receptionist Kiosk System - Quick Start Guide

## Prerequisites

- Docker Desktop installed and running
- Node.js 18+ (for local frontend development)
- PowerShell (Windows)

## Quick Start (Docker Compose)

### 1. Start All Services

```powershell
# From project root
docker-compose up -d
```

This will start:
- PostgreSQL databases (4 instances)
- Redis
- API Gateway (Nginx)
- Auth Service
- Utility Service
- Payment Service
- Grievance Service
- Kiosk UI Frontend

### 2. Run Database Migrations

```powershell
# Auth Service
docker-compose exec auth-service npm run migrate

# Utility Service
docker-compose exec utility-service npm run migrate

# Payment Service
docker-compose exec payment-service npm run migrate

# Grievance Service
docker-compose exec grievance-service npm run migrate
```

### 3. Access the Application

- **Kiosk UI:** http://localhost:3000
- **API Gateway:** http://localhost:8000
- **API Documentation:** See `docs/api/`

### 4. Test Login

Use the test user created by migrations:

- **Consumer ID:** TEST001
- **Password:** Test@1234

## Development Setup

### Backend Services

Each service can be run independently for development:

```powershell
# Auth Service
cd services/auth-service
npm install
npm run dev  # Port 8001

# Utility Service
cd services/utility-service
npm install
npm run dev  # Port 8002

# Payment Service
cd services/payment-service
npm install
npm run dev  # Port 8003

# Grievance Service
cd services/grievance-service
npm install
npm run dev  # Port 8004
```

### Frontend

```powershell
cd frontend/kiosk-ui
npm install
cp .env.example .env
npm run dev  # Port 3000
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Backend Services
NODE_ENV=development
PORT=8001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_db
DB_USER=auth_user
DB_PASSWORD=auth_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=24h

# Frontend
VITE_API_URL=http://localhost:8000
VITE_KIOSK_ID=KIOSK_DEV_01
```

## Service Ports

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 8000 | Nginx reverse proxy |
| Auth Service | 8001 | Authentication & user management |
| Utility Service | 8002 | Bills & meter readings |
| Payment Service | 8003 | Payment processing |
| Grievance Service | 8004 | Complaints & service requests |
| Kiosk UI | 3000 | React frontend |
| PostgreSQL Auth | 5432 | Auth database |
| PostgreSQL Utility | 5433 | Utility database |
| PostgreSQL Payment | 5434 | Payment database |
| PostgreSQL Grievance | 5435 | Grievance database |
| Redis | 6379 | Session store |

## API Testing

### Using PowerShell

```powershell
# Register
$body = @{
    consumer_id = "TEST002"
    password = "Test@1234"
    phone = "+919876543210"
    email = "test@example.com"
    language_preference = "en"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:8000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# Login
$body = @{
    consumer_id = "TEST001"
    password = "Test@1234"
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri "http://localhost:8000/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$token = $response.data.token
$headers = @{ Authorization = "Bearer $token" }

# Get Bills
Invoke-RestMethod `
    -Uri "http://localhost:8000/api/utility/bills/TEST001" `
    -Headers $headers
```

## Troubleshooting

### Services not starting
```powershell
# Check logs
docker-compose logs -f [service-name]

# Restart specific service
docker-compose restart [service-name]
```

### Database connection issues
```powershell
# Verify databases are running
docker-compose ps

# Check database logs
docker-compose logs postgres-auth
```

### Port conflicts
```powershell
# Stop all services
docker-compose down

# Check if ports are in use
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Kill process using the port
taskkill /PID [process_id] /F
```

### Frontend not connecting to backend
- Verify API Gateway is running on port 8000
- Check `.env` file has correct `VITE_API_URL`
- Clear browser cache and restart dev server

## Stopping Services

```powershell
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes all data)
docker-compose down -v
```

## Next Steps

1. ✅ System is running
2. ✅ Login to Kiosk UI
3. ✅ Test all features
4. 📝 Review API documentation in `docs/api/`
5. 🚀 Start building admin dashboard or additional features

## Need Help?

- **Documentation:** `docs/DEVELOPMENT.md`
- **API Reference:** `docs/api/API_REFERENCE.md`
- **Project Status:** `docs/PROJECT_STATUS.md`
