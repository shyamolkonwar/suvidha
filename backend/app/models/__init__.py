"""Pydantic Models for Request/Response Validation"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ==========================================
# Common Models
# ==========================================
class ApiResponse(BaseModel):
    """Standard API Response"""
    success: bool
    message: Optional[str] = None
    data: Optional[dict] = None


class ErrorResponse(BaseModel):
    """Error Response"""
    success: bool = False
    error: str
    detail: Optional[str] = None


# ==========================================
# Auth Models
# ==========================================
class LoginRequest(BaseModel):
    """Login Request with Phone Number"""
    phone: str = Field(..., pattern=r"^\\+?[1-9]\\d{1,14}$")

    class Config:
        json_schema_extra = {
            "example": {
                "phone": "+919876543210"
            }
        }


class VerifyOtpRequest(BaseModel):
    """OTP Verification Request"""
    phone: str
    otp: str = Field(..., min_length=4, max_length=6)

    class Config:
        json_schema_extra = {
            "example": {
                "phone": "+919876543210",
                "otp": "1234"
            }
        }


class TokenResponse(BaseModel):
    """JWT Token Response"""
    access_token: str
    token_type: str = "bearer"
    user: Optional[dict] = None


# ==========================================
# User Models
# ==========================================
class UserType(str, Enum):
    """User Type Enum"""
    CONSUMER = "consumer"
    KIOSK = "kiosk"
    ADMIN = "admin"


class UserBase(BaseModel):
    """Base User Fields"""
    phone: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    city_zone: Optional[str] = None
    user_type: UserType = UserType.CONSUMER


class UserCreate(UserBase):
    """User Creation Model"""
    consumer_id: Optional[str] = None


class UserResponse(UserBase):
    """User Response Model"""
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# Bill Models
# ==========================================
class ServiceType(str, Enum):
    """Utility Service Types"""
    ELECTRICITY = "electricity"
    WATER = "water"
    GAS = "gas"


class BillStatus(str, Enum):
    """Bill Status"""
    PENDING = "PENDING"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"


class BillBase(BaseModel):
    """Base Bill Fields"""
    service_type: ServiceType
    amount_due: float
    due_date: datetime
    units_consumed: Optional[float] = None
    bill_number: Optional[str] = None


class BillCreate(BillBase):
    """Bill Creation Model"""
    user_id: str


class BillResponse(BillBase):
    """Bill Response Model"""
    id: str
    user_id: str
    status: BillStatus
    created_at: datetime

    class Config:
        from_attributes = True


class BillSummary(BaseModel):
    """Aggregated Bill Summary"""
    total_due: float
    pending_bills: int
    service_breakdown: dict
    due_soon: List[BillResponse]


# ==========================================
# Grievance Models
# ==========================================
class GrievanceCategory(str, Enum):
    """Grievance Categories"""
    POWER_OUTAGE = "POWER_OUTAGE"
    BILLING_ISSUE = "BILLING_ISSUE"
    METER_PROBLEM = "METER_PROBLEM"
    NEW_CONNECTION = "NEW_CONNECTION"
    DISCONNECTION_ISSUE = "DISCONNECTION_ISSUE"
    WATER_SUPPLY = "WATER_SUPPLY"
    OTHER = "OTHER"


class GrievanceStatus(str, Enum):
    """Grievance Status"""
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
    REJECTED = "REJECTED"


class GrievancePriority(str, Enum):
    """Grievance Priority"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class GrievanceCreate(BaseModel):
    """Grievance Creation"""
    category: GrievanceCategory
    description: str
    audio_url: Optional[str] = None
    attachment_url: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "category": "POWER_OUTAGE",
                "description": "No power since 2 hours in Sector 4"
            }
        }


class GrievanceResponse(BaseModel):
    """Grievance Response"""
    ticket_id: str
    user_id: str
    category: GrievanceCategory
    description: str
    status: GrievanceStatus
    priority: GrievancePriority
    estimated_resolution: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# Payment Models
# ==========================================
class PaymentMethod(str, Enum):
    """Payment Methods"""
    CASH = "CASH"
    CARD = "CARD"
    UPI = "UPI"
    NET_BANKING = "NET_BANKING"


class PaymentStatus(str, Enum):
    """Payment Status"""
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class CreatePaymentRequest(BaseModel):
    """Create Payment Request"""
    amount: float
    bill_ids: List[str]
    payment_method: PaymentMethod = PaymentMethod.UPI

    class Config:
        json_schema_extra = {
            "example": {
                "amount": 2500.00,
                "bill_ids": ["bill-1", "bill-2"],
                "payment_method": "UPI"
            }
        }


class PaymentResponse(BaseModel):
    """Payment Response"""
    transaction_id: str
    order_id: str
    amount: float
    status: PaymentStatus
    created_at: datetime


# ==========================================
# City Data Models
# ==========================================
class WeatherData(BaseModel):
    """Weather Information"""
    temperature: float
    humidity: float
    condition: str
    feels_like: float
    location: str


class NewsItem(BaseModel):
    """News/Alert Item"""
    id: str
    title: str
    content: str
    priority: str
    category: str
    published_at: datetime


class CityDataResponse(BaseModel):
    """City/Location Data Response"""
    weather: Optional[WeatherData] = None
    alerts: List[NewsItem] = []
    news_ticker: List[str] = []
