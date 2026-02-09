# Utility Service API Documentation

## Overview

The Utility Service handles bill retrieval and meter reading submissions for electricity, gas, and water utilities.

**Base URL:** `http://localhost:8000/api/utility`  
**Port:** 8002  
**Authentication:** Required (JWT Bearer token)

---

## Endpoints

### 1. Get Bills for Consumer

Retrieve all bills or bills for a specific utility type.

**Endpoint:** `GET /bills/:consumer_id`

**Query Parameters:**
- `type` (optional): Filter by utility type (`electricity`, `gas`, `water`)

**Example Request:**
```powershell
$headers = @{ Authorization = "Bearer $token" }

# Get all bills
Invoke-RestMethod -Uri "http://localhost:8000/api/utility/bills/TEST001" -Headers $headers

# Get electricity bills only
Invoke-RestMethod -Uri "http://localhost:8000/api/utility/bills/TEST001?type=electricity" -Headers $headers
```

**Response:**
```json
{
  "success": true,
  "data": {
    "electricity": [
      {
        "id": "uuid",
        "consumer_id": "TEST001",
        "billing_period": "2026-01-01",
        "units_consumed": 150.5,
        "amount_due": 1250.75,
        "due_date": "2026-02-15",
        "status": "PENDING",
        "late_fee": 0,
        "created_at": "2026-01-05T10:00:00Z"
      }
    ],
    "gas": [],
    "water": []
  },
  "timestamp": "2026-02-09T15:00:00Z"
}
```

---

### 2. Get Single Bill

Retrieve details of a specific bill.

**Endpoint:** `GET /bills/:utility_type/:bill_id`

**Path Parameters:**
- `utility_type`: One of `electricity`, `gas`, `water`
- `bill_id`: UUID of the bill

**Example Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/utility/bills/electricity/bill-uuid" -Headers $headers
```

---

### 3. Submit Meter Reading

Submit a new meter reading for any utility.

**Endpoint:** `POST /meter-reading`

**Request Body:**
```json
{
  "consumer_id": "TEST001",
  "utility_type": "electricity",
  "reading_value": 12450.5,
  "photo_url": "/uploads/meter123.jpg",
  "notes": "Monthly reading"
}
```

**Example Request:**
```powershell
$body = @{
    consumer_id = "TEST001"
    utility_type = "electricity"
    reading_value = 12450.5
    notes = "Monthly reading"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:8000/api/utility/meter-reading" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Meter reading submitted successfully",
  "data": {
    "reading_id": "uuid"
  },
  "timestamp": "2026-02-09T15:00:00Z"
}
```

---

### 4. Get Meter Reading History

Get past meter reading submissions.

**Endpoint:** `GET /meter-readings/:consumer_id`

**Query Parameters:**
- `type` (optional): Filter by utility type

**Example Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/utility/meter-readings/TEST001" -Headers $headers
```

---

### 5. Mark Bill as Paid (Internal)

Internal endpoint called by Payment Service to update bill status.

**Endpoint:** `PUT /bills/:utility_type/:bill_id/paid`

**Note:** This endpoint should only be called by the Payment Service.

---

## Bill Statuses

- `PENDING`: Bill not yet paid
- `PAID`: Bill paid successfully
- `OVERDUE`: Payment overdue
- `CANCELLED`: Bill cancelled

---

## Database Schema

### Electricity/Gas/Water Bills Tables
```sql
CREATE TABLE electricity_bills (
  id UUID PRIMARY KEY,
  consumer_id VARCHAR(50) NOT NULL,
  billing_period DATE NOT NULL,
  units_consumed DECIMAL(10, 2) NOT NULL,
  amount_due DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  late_fee DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP
);
```

### Meter Readings Table
```sql
CREATE TABLE meter_readings (
  id UUID PRIMARY KEY,
  consumer_id VARCHAR(50) NOT NULL,
  utility_type VARCHAR(20) NOT NULL,
  reading_value DECIMAL(10, 2) NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified BOOLEAN DEFAULT FALSE,
  photo_url VARCHAR(500),
  notes TEXT
);
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid utility type | Utility type must be electricity, gas, or water |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Bill not found | Bill ID does not exist |
| 500 | Internal server error | Database or server error |
