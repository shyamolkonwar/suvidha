# SUVIDHA Kiosk System - Development Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** ([Download](https://git-scm.com/))

## Quick Start

### 1. Clone and Setup

```powershell
# Navigate to project directory
cd e:\SUDVIDA

# Run quick start script
.\quickstart.ps1
```

The quick start script will:
- Check prerequisites
- Create `.env` from template
- Install dependencies
- Start all Docker containers
- Run database migrations

### 2. Manual Setup (Alternative)

If you prefer manual setup:

```powershell
# Create environment file
cp .env.example .env

# Install root dependencies
npm install

# Install auth service dependencies
cd services/auth-service
npm install
cd ../..

# Start Docker containers
docker-compose up -d --build

# Wait for databases to initialize (30 seconds)
Start-Sleep -Seconds 30

# Run database migrations
docker-compose exec auth-service npm run migrate
```

### 3. Verify Installation

Check if all services are running:

```powershell
# View container status
docker-compose ps

# Check logs
docker-compose logs -f

# Test auth service
curl http://localhost:8000/api/auth/health
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Load Balancer                      │
│                  (localhost:8000)                    │
└──────────────────┬──────────────────────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
┌───▼────┐                   ┌────▼─────┐
│ Kiosk  │                   │  Admin   │
│   UI   │                   │Dashboard │
│  :3000 │                   │  :3001   │
└────────┘                   └──────────┘
                   │
          ┌────────▼────────┐
          │  API Gateway    │
          │  (Nginx :8000)  │
          └────────┬────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐    ┌───▼────┐    ┌───▼────┐
│  Auth  │    │Utility │    │Payment │
│Service │    │Service │    │Service │
│ :8001  │    │ :8002  │    │ :8003  │
└───┬────┘    └───┬────┘    └───┬────┘
    │             │              │
┌───▼────┐    ┌───▼────┐    ┌───▼────┐
│Auth DB │    │Util DB │    │Pay DB  │
│ :5432  │    │ :5433  │    │ :5434  │
└────────┘    └────────┘    └────────┘
```

## API Endpoints

### Authentication Service (`/api/auth/`)

```http
POST   /api/auth/register     # Register new user
POST   /api/auth/login        # Login user
POST   /api/auth/logout       # Logout user
POST   /api/auth/refresh      # Refresh access token
GET    /api/auth/verify       # Verify token
GET    /api/auth/me           # Get current user profile
GET    /api/auth/health       # Health check
```

### Example: Register User

```powershell
curl -X POST http://localhost:8000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "consumer_id": "TEST001",
    "password": "Test@1234",
    "phone": "+919876543210",
    "email": "test@example.com",
    "language_preference": "en"
  }'
```

### Example: Login

```powershell
curl -X POST http://localhost:8000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "consumer_id": "TEST001",
    "password": "Test@1234",
    "kiosk_id": "KIOSK_001"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "consumer_id": "TEST001",
      "language_preference": "en"
    },
    "expires_in": 86400
  }
}
```

## Development Workflow

### Start Development Environment

```powershell
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Rebuild containers
docker-compose up --build
```

### View Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
docker-compose logs -f utility-service
```

### Database Management

```powershell
# Run migrations
npm run db:migrate

# Access PostgreSQL
docker-compose exec auth-db psql -U auth_user -d auth_db

# View tables
\dt

# Query users
SELECT * FROM users;
```

### Stop Services

```powershell
# Stop containers (keep data)
docker-compose down

# Stop and remove volumes (delete data)
docker-compose down -v

# Remove everything
docker-compose down -v --rmi all
```

## Environment Variables

Key variables in `.env`:

```env
# JWT Configuration
JWT_SECRET=change-this-to-a-very-secure-random-string
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=7d

# Database Passwords
AUTH_DB_PASSWORD=secure_password_here
UTILITY_DB_PASSWORD=secure_password_here
PAYMENT_DB_PASSWORD=secure_password_here

# Payment Gateway (for production)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# CORS Origins
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

## Testing

### Manual API Testing

Use curl, Postman, or Thunder Client:

```powershell
# Health check
curl http://localhost:8000/api/auth/health

# Register user
curl -X POST http://localhost:8000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"consumer_id":"TEST001","password":"Test@1234"}'

# Login
curl -X POST http://localhost:8000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"consumer_id":"TEST001","password":"Test@1234"}'
```

### Automated Tests

```powershell
# Run all tests
npm test

# Run specific service tests
cd services/auth-service
npm test
```

## Troubleshooting

### Containers won't start

```powershell
# Check Docker is running
docker ps

# View Docker logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

### Database connection errors

```powershell
# Ensure databases are healthy
docker-compose ps

# Wait longer for DB initialization
Start-Sleep -Seconds 30

# Check database logs
docker-compose logs auth-db
```

### Port already in use

```powershell
# Find process using port (example: 8000)
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in .env
```

### Permission denied errors

```powershell
# Run PowerShell as Administrator

# Or fix Docker permissions
docker-compose down
docker system prune -a
docker-compose up
```

## Project Structure

```
SUDVIDA/
├── services/                    # Microservices
│   ├── auth-service/           # ✅ Completed
│   ├── utility-service/        # 🚧 To be built
│   ├── payment-service/        # 🚧 To be built
│   └── grievance-service/      # 🚧 To be built
│
├── frontend/                    # Frontend applications
│   ├── kiosk-ui/               # 🚧 To be built
│   └── admin-dashboard/        # 🚧 To be built
│
├── api-gateway/                # ✅ Nginx configuration
├── shared/                     # ✅ Shared types and utils
├── infrastructure/             # Deployment configs
├── docs/                       # Documentation
│
├── docker-compose.yml          # ✅ Created
├── .env.example                # ✅ Created
├── quickstart.ps1              # ✅ Quick start script
└── README.md                   # ✅ Main readme
```

## Current Status (MVP Phase 1)

### ✅ Completed
- Project structure and configuration
- Docker Compose setup with all databases
- Nginx API Gateway
- Shared TypeScript types
- **Auth Service** (fully functional)
  - User registration with validation
  - Login with JWT tokens
  - Refresh token mechanism
  - Session management
  - Account lockout protection
  - Password hashing with bcrypt

### 🚧 In Progress
- Utility Service (electricity bills)
- Payment Service
- Grievance Service

### 📋 Planned
- Frontend Kiosk UI (React + TypeScript)
- Admin Dashboard
- Additional utility services (gas, water)
- WebSocket notification service
- Analytics service

## Next Steps

1. **Test Auth Service**
   - Create test user
   - Login and get JWT token
   - Verify token works

2. **Build Utility Service**
   - Bill retrieval endpoints
   - Meter reading submission

3. **Build Payment Service**
   - Payment gateway integration (mock for now)
   - Receipt generation

4. **Build Frontend**
   - Kiosk UI with React
   - Admin Dashboard

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Manual](https://www.postgresql.org/docs/)

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Review this documentation
4. Check Docker container status: `docker-compose ps`

---

**Last Updated**: February 2026
**Status**: MVP Phase 1 - Auth Service Complete
