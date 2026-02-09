# SUVIDHA API Quick Reference

## Service Overview

| Service | Port | Base URL | Endpoints | Status |
|---------|------|----------|-----------|--------|
| Auth Service | 8001 | `/api/auth` | 7 | ✅ Complete |
| Utility Service | 8002 | `/api/utility` | 5 | ✅ Complete |
| Payment Service | 8003 | `/api/payment` | 4 | ✅ Complete |
| Grievance Service | 8004 | `/api/grievance` | 7 | ✅ Complete |

**Total Endpoints:** 23

---

## Authentication Flow

All services (except auth endpoints) require JWT authentication.

```powershell
# 1. Login
$body = @{
    consumer_id = "TEST001"
    password = "Test@1234"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod `
    -Uri "http://localhost:8000/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$token = $loginResponse.data.token

# 2. Use token in subsequent requests
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/utility/bills/TEST001" -Headers $headers
```

---

## Quick API Reference

### Auth Service
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Get JWT token
- `POST /api/auth/refresh` - Refresh expired token
- `GET /api/auth/verify` - Verify token validity ⚠️ Needs token
- `POST /api/auth/logout` - Revoke session ⚠️ Needs token
- `GET /api/auth/me` - Get user profile ⚠️ Needs token
- `GET /api/auth/health` - Health check

### Utility Service ⚠️ All need token
- `GET /api/utility/bills/:consumer_id` - Get bills (optional `?type=electricity|gas|water`)
- `GET /api/utility/bills/:type/:bill_id` - Get single bill
- `POST /api/utility/meter-reading` - Submit meter reading
- `GET /api/utility/meter-readings/:consumer_id` - Get reading history
- `PUT /api/utility/bills/:type/:bill_id/paid` - Mark as paid (internal)

### Payment Service ⚠️ All need token
- `POST /api/payment/initiate` - Start payment
- `POST /api/payment/verify` - Complete payment
- `GET /api/payment/transactions/:consumer_id` - Get payment history
- `GET /api/payment/transaction/:transaction_id` - Get single transaction

### Grievance Service ⚠️ All need token
- `POST /api/grievance/complaints` - File complaint
- `GET /api/grievance/complaints/:consumer_id` - Get complaints
- `GET /api/grievance/complaint/:complaint_id` - Get single complaint
- `PUT /api/grievance/complaint/:complaint_id/status` - Update status (admin)
- `POST /api/grievance/service-requests` - Create service request
- `GET /api/grievance/service-requests/:consumer_id` - Get service requests
- `GET /api/grievance/admin/pending-complaints` - Get all pending (admin)

---

## Common Use Cases

### Use Case 1: User Registration & Login

```powershell
# Register
$body = @{
    consumer_id = "CITIZEN001"
    password = "SecurePass123"
    phone = "+919876543210"
    email = "citizen@example.com"
    language_preference = "en"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:8000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# Login
$body = @{
    consumer_id = "CITIZEN001"
    password = "SecurePass123"
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri "http://localhost:8000/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$token = $response.data.token
```

### Use Case 2: Check Bills & Pay

```powershell
$headers = @{ Authorization = "Bearer $token" }

# Get all bills
$bills = Invoke-RestMethod `
    -Uri "http://localhost:8000/api/utility/bills/CITIZEN001" `
    -Headers $headers

# Initiate payment
$body = @{
    consumer_id = "CITIZEN001"
    amount = 1250.75
    bill_ids = @($bills.data.electricity[0].id)
    payment_method = "MOCK"
} | ConvertTo-Json

$payment = Invoke-RestMethod `
    -Uri "http://localhost:8000/api/payment/initiate" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"

# Verify payment
$body = @{
    transaction_id = $payment.data.transaction_id
    payment_id = "MOCK_PAY_" + (Get-Date).Ticks
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:8000/api/payment/verify" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

### Use Case 3: Submit Meter Reading

```powershell
$body = @{
    consumer_id = "CITIZEN001"
    utility_type = "electricity"
    reading_value = 12450.5
    notes = "Monthly self-reading"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:8000/api/utility/meter-reading" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

### Use Case 4: File a Complaint

```powershell
$body = @{
    consumer_id = "CITIZEN001"
    category = "billing"
    subject = "Incorrect bill amount"
    description = "My electricity bill shows incorrect meter reading. Expected 150 units but bill shows 500 units."
    priority = "HIGH"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:8000/api/grievance/complaints" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

---

## Response Format

All services follow a consistent response format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-02-09T15:00:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2026-02-09T15:00:00Z"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Limit:** 100 requests per minute per IP
- **Burst:** 20 requests
- **Response:** 429 Too Many Requests

---

## Running Migrations

Before using the services, run database migrations:

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

---

## Health Checks

All services expose a `/health` endpoint:

```powershell
curl http://localhost:8001/health  # Auth
curl http://localhost:8002/health  # Utility
curl http://localhost:8003/health  # Payment
curl http://localhost:8004/health  # Grievance
curl http://localhost:8000/health  # API Gateway
```

---

## Environment Variables

Key environment variables to configure:

```env
# Service Ports
AUTH_SERVICE_PORT=8001
UTILITY_SERVICE_PORT=8002
PAYMENT_SERVICE_PORT=8003
GRIEVANCE_SERVICE_PORT=8004

# Database (separate DB per service)
DB_HOST=postgres-auth
DB_PORT=5432
DB_NAME=auth_db
DB_USER=auth_user
DB_PASSWORD=auth_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

# Payment Gateway
PAYMENT_GATEWAY=mock  # or 'razorpay' for production
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

---

## Detailed Documentation

For detailed API documentation, see:

- [Auth Service API](AUTH_SERVICE.md)
- [Utility Service API](UTILITY_SERVICE.md)
- [Payment Service API](PAYMENT_SERVICE.md)
- [Grievance Service API](GRIEVANCE_SERVICE.md)

---

## Support

For issues or questions:
- Check service logs: `docker-compose logs -f [service-name]`
- View health status: `curl http://localhost:800X/health`
- Review [DEVELOPMENT.md](../DEVELOPMENT.md) for troubleshooting
