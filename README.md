# SUVIDHA - Digital Receptionist Kiosk System

A comprehensive microservices-based platform for citizen utility services including bill payments, meter readings, grievance management, and service requests.

## System Architecture

- **Citizen Kiosk Interface**: Touch-based, multilingual frontend
- **Admin Dashboard**: Web-based management portal
- **Backend Microservices**: Secure, scalable architecture

## Technology Stack

### Backend
- Node.js 18+ with TypeScript
- Express.js for microservices
- PostgreSQL 15
- Redis 7
- Kong API Gateway

### Frontend
- React 18 + TypeScript
- Material-UI (Kiosk)
- Ant Design (Admin)
- i18next for multilingual support

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Kubernetes (production)

## Project Structure

```
SUDVIDA/
├── services/
│   ├── auth-service/          # Authentication & session management
│   ├── utility-service/       # Bill retrieval & meter readings
│   ├── payment-service/       # Payment processing
│   ├── grievance-service/     # Complaints & service requests
│   ├── notification-service/  # Real-time notifications
│   ├── kiosk-monitor-service/ # Kiosk health monitoring
│   ├── cms-service/           # Content management
│   └── analytics-service/     # Analytics & reporting
├── api-gateway/               # Kong API Gateway configuration
├── frontend/
│   ├── kiosk-ui/             # Citizen-facing kiosk interface
│   └── admin-dashboard/      # Admin management portal
├── shared/
│   ├── types/                # Shared TypeScript types
│   ├── utils/                # Common utilities
│   └── configs/              # Shared configurations
├── infrastructure/
│   ├── docker/               # Dockerfiles
│   ├── k8s/                  # Kubernetes manifests
│   └── scripts/              # Deployment scripts
└── docs/
    └── api/                  # API documentation
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

### Local Development

1. Clone the repository
```bash
git clone <repository-url>
cd SUDVIDA
```

2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start services with Docker Compose
```bash
docker-compose up -d
```

4. Run database migrations
```bash
npm run migrate
```

5. Access the applications
- Kiosk UI: http://localhost:3000
- Admin Dashboard: http://localhost:3001
- API Gateway: http://localhost:8000

## Environment Variables

See `.env.example` for required configuration.

## API Documentation

API documentation is available at: http://localhost:8000/docs

## License

Proprietary - All Rights Reserved
