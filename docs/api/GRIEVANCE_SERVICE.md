# Grievance Service API Documentation

## Overview

The Grievance Service manages customer complaints and service requests for utility services.

**Base URL:** `http://localhost:8000/api/grievance`  
**Port:** 8004  
**Authentication:** Required (JWT Bearer token)

---

## Complaint Endpoints

### 1. File a Complaint

Submit a new complaint.

**Endpoint:** `POST /complaints`

**Request Body:**
```json
{
  "consumer_id": "TEST001",
  "category": "billing",
  "subject": "Incorrect bill amount",
  "description": "My electricity bill shows 500 units but I consumed only 150 units this month.",
  "attachments": ["/uploads/bill-photo.jpg"],
  "priority": "HIGH"
}
```

**Categories:**
- `billing`: Bill-related issues
- `supply`: Power/gas/water supply issues
- `quality`: Quality of service
- `meter`: Meter-related problems
- `connection`: New connection or disconnection
- `other`: Other issues

**Priority Levels:**
- `LOW`: Non-urgent issues
- `NORMAL`: Standard priority (default)
- `HIGH`: Important issues
- `URGENT`: Critical issues requiring immediate attention

**Example Request:**
```powershell
$body = @{
    consumer_id = "TEST001"
    category = "billing"
    subject = "Incorrect bill amount"
    description = "My bill shows wrong meter reading"
    priority = "HIGH"
} | ConvertTo-Json

$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod `
    -Uri "http://localhost:8000/api/grievance/complaints" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Complaint filed successfully",
  "data": {
    "complaint_id": "uuid"
  },
  "timestamp": "2026-02-09T15:00:00Z"
}
```

---

### 2. Get Complaints for Consumer

Retrieve all complaints for a consumer.

**Endpoint:** `GET /complaints/:consumer_id`

**Query Parameters:**
- `status` (optional): Filter by status

**Example Request:**
```powershell
# Get all complaints
Invoke-RestMethod -Uri "http://localhost:8000/api/grievance/complaints/TEST001" -Headers $headers

# Get only pending complaints
Invoke-RestMethod -Uri "http://localhost:8000/api/grievance/complaints/TEST001?status=PENDING" -Headers $headers
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "complaint_id": "uuid",
      "consumer_id": "TEST001",
      "category": "billing",
      "subject": "Incorrect bill amount",
      "description": "My bill shows wrong meter reading",
      "attachments": [],
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "assigned_to": "support@suvidha.gov",
      "resolution": null,
      "created_at": "2026-02-09T10:00:00Z",
      "updated_at": "2026-02-09T11:00:00Z",
      "resolved_at": null
    }
  ],
  "timestamp": "2026-02-09T15:00:00Z"
}
```

---

### 3. Get Single Complaint

Get details of a specific complaint.

**Endpoint:** `GET /complaint/:complaint_id`

**Example Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/grievance/complaint/$complaint_id" -Headers $headers
```

---

### 4. Update Complaint Status (Admin)

Update the status and resolution of a complaint.

**Endpoint:** `PUT /complaint/:complaint_id/status`

**Request Body:**
```json
{
  "status": "RESOLVED",
  "resolution": "Bill has been corrected. New bill will be issued within 3 days."
}
```

**Complaint Statuses:**
- `PENDING`: Complaint filed, awaiting review
- `IN_PROGRESS`: Being worked on
- `RESOLVED`: Issue resolved
- `CLOSED`: Complaint closed
- `REJECTED`: Complaint rejected (with reason)

**Example Request:**
```powershell
$body = @{
    status = "RESOLVED"
    resolution = "Bill corrected. New bill issued."
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:8000/api/grievance/complaint/$complaint_id/status" `
    -Method PUT `
    -Body $body `
    -ContentType "application/json"
```

---

## Service Request Endpoints

### 5. Create Service Request

Request a new service (connection, meter installation, etc.).

**Endpoint:** `POST /service-requests`

**Request Body:**
```json
{
  "consumer_id": "TEST001",
  "service_type": "meter_installation",
  "details": "Need new smart meter installed",
  "preferred_date": "2026-02-15"
}
```

**Service Types:**
- `new_connection`: New utility connection
- `disconnection`: Disconnect service
- `meter_installation`: Install new meter
- `repair`: Repair request
- `inspection`: Inspection request

**Example Request:**
```powershell
$body = @{
    consumer_id = "TEST001"
    service_type = "meter_installation"
    details = "Replace old meter with smart meter"
    preferred_date = "2026-02-15"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:8000/api/grievance/service-requests" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Service request created successfully",
  "data": {
    "request_id": "uuid"
  },
  "timestamp": "2026-02-09T15:00:00Z"
}
```

---

### 6. Get Service Requests

Retrieve all service requests for a consumer.

**Endpoint:** `GET /service-requests/:consumer_id`

**Example Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/grievance/service-requests/TEST001" -Headers $headers
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "request_id": "uuid",
      "consumer_id": "TEST001",
      "service_type": "meter_installation",
      "details": "Replace old meter",
      "preferred_date": "2026-02-15",
      "status": "SCHEDULED",
      "scheduled_date": "2026-02-15T10:00:00Z",
      "completed_at": null,
      "created_at": "2026-02-09T10:00:00Z"
    }
  ],
  "timestamp": "2026-02-09T15:00:00Z"
}
```

**Service Request Statuses:**
- `PENDING`: Request submitted, awaiting scheduling
- `SCHEDULED`: Appointment scheduled
- `IN_PROGRESS`: Service in progress
- `COMPLETED`: Service completed
- `CANCELLED`: Request cancelled

---

## Admin Endpoints

### 7. Get All Pending Complaints

Retrieve all pending complaints across all consumers (admin dashboard).

**Endpoint:** `GET /admin/pending-complaints`

**Query Parameters:**
- `limit` (optional): Number of results (default: 100)

**Example Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/grievance/admin/pending-complaints?limit=50"
```

**Response:** Returns complaints sorted by priority (URGENT → HIGH → NORMAL → LOW) and then by creation date.

---

## Database Schema

### Complaints Table
```sql
CREATE TABLE complaints (
  complaint_id UUID PRIMARY KEY,
  consumer_id VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  attachments JSON,
  status VARCHAR(20) DEFAULT 'PENDING',
  priority VARCHAR(20) DEFAULT 'NORMAL',
  assigned_to VARCHAR(100),
  resolution TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);
```

### Service Requests Table
```sql
CREATE TABLE service_requests (
  request_id UUID PRIMARY KEY,
  consumer_id VARCHAR(50) NOT NULL,
  service_type VARCHAR(50) NOT NULL,
  details TEXT,
  preferred_date DATE,
  status VARCHAR(20) DEFAULT 'PENDING',
  scheduled_date TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## File Uploads

The service supports file attachments (photos, documents) for complaints.

**Supported Formats:**
- Images: JPEG, PNG, JPG
- Documents: PDF

**Max File Size:** 5MB

**Note:** File upload implementation using Multer is configured but requires additional endpoint setup for actual file handling.

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Missing required fields | Required fields not provided |
| 400 | Invalid category | Category must be one of the allowed values |
| 400 | Invalid service type | Service type must be one of the allowed values |
| 400 | Invalid status | Status must be one of the allowed values |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Complaint not found | Complaint ID does not exist |
| 500 | Internal server error | Database or server error |
