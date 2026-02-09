# API Documentation - Auth Service

Base URL: `http://localhost:8000/api/auth`

## Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### 1. Register User

Create a new user account.

**Endpoint:** `POST /register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "consumer_id": "string (required, 3-50 chars, alphanumeric + _ -)",
  "password": "string (required, min 8 chars, must contain uppercase, lowercase, number)",
  "phone": "string (optional, E.164 format)",
  "email": "string (optional, valid email)",
  "language_preference": "string (optional: en|hi|bn|te|mr|ta|gu|kn|ml|pa)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": "uuid"
  },
  "timestamp": "2026-02-09T20:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "User already exists with this consumer ID",
  "timestamp": "2026-02-09T20:00:00.000Z"
}
```

**Validation Errors (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
  ]
}
```

---

### 2. Login

Authenticate user and receive JWT tokens.

**Endpoint:** `POST /login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "consumer_id": "string (required)",
  "password": "string (required)",
  "kiosk_id": "string (optional)"
}
```

**Success Response (200):**
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
  },
  "timestamp": "2026-02-09T20:00:00.000Z"
}
```

**Error Responses:**

*Invalid Credentials (401):*
```json
{
  "success": false,
  "error": "Invalid credentials",
  "timestamp": "2026-02-09T20:00:00.000Z"
}
```

*Account Locked (401):*
```json
{
  "success": false,
  "error": "Account is locked due to multiple failed login attempts",
  "timestamp": "2026-02-09T20:00:00.000Z"
}
```

*Account Deactivated (401):*
```json
{
  "success": false,
  "error": "Account is deactivated",
  "timestamp": "2026-02-09T20:00:00.000Z"
}
```

**Notes:**
- Account locks for 15 minutes after 5 failed login attempts
- Failed login attempts reset upon successful login

---

### 3. Refresh Token

Get a new access token using refresh token.

**Endpoint:** `POST /refresh`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refresh_token": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-02-09T20:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid or expired refresh token",
  "timestamp": "2026-02-09T20:00:00.000Z"
}
```

---

### 4. Verify Token

Verify if a JWT token is valid.

**Endpoint:** `GET /verify`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "user_id": "uuid",
      "consumer_id": "TEST001",
      "iat": 1707508800,
      "exp": 1707595200
    }
  },
  "timestamp": "2026-02-09T20:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "data": {
    "valid": false
  },
  "error": "Invalid token",
  "timestamp": "2026-02-09T20:00:00.000Z"
}
```

---

### 5. Logout

Revoke current session.

**Endpoint:** `POST /logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "timestamp": "2026-02-09T20:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "No token provided",
  "timestamp": "2026-02-09T20:00:00.000Z"
}
```

---

### 6. Get Profile

Get current authenticated user's profile.

**Endpoint:** `GET /me`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "consumer_id": "TEST001",
    "iat": 1707508800,
    "exp": 1707595200
  },
  "timestamp": "2026-02-09T20:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "No token provided",
  "timestamp": "2026-02-09T20:00:00.000Z"
}
```

---

### 7. Health Check

Check if the service is running.

**Endpoint:** `GET /health`

**Success Response (200):**
```json
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2026-02-09T20:00:00.000Z"
}
```

---

## Common Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Valid credentials but insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

## Rate Limiting

- **Limit:** 100 requests per minute per IP address
- **Response when exceeded:**
```json
{
  "message": "Too many requests from this IP, please try again later"
}
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- Recommended: Include special characters

## Consumer ID Requirements

- 3-50 characters
- Only letters, numbers, hyphens (-), and underscores (_)
- Case-sensitive
- Must be unique

## Supported Languages

- `en` - English
- `hi` - Hindi
- `bn` - Bengali
- `te` - Telugu
- `mr` - Marathi
- `ta` - Tamil
- `gu` - Gujarati
- `kn` - Kannada
- `ml` - Malayalam
- `pa` - Punjabi

## Example Usage (PowerShell)

### Register
```powershell
$body = @{
    consumer_id = "TEST001"
    password = "Test@1234"
    phone = "+919876543210"
    email = "test@example.com"
    language_preference = "en"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Login
```powershell
$body = @{
    consumer_id = "TEST001"
    password = "Test@1234"
    kiosk_id = "KIOSK_001"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$token = $response.data.token
```

### Authenticated Request
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/me" `
    -Method GET `
    -Headers $headers
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  consumer_id VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(15),
  email VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  language_preference VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  session_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  jwt_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP NOT NULL,
  kiosk_id VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE
);
```
