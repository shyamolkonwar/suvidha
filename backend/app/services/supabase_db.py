"""Supabase Client Integration

This module provides functions to interact with Supabase database.
When MOCK_MODE is enabled or Supabase is unavailable, it falls back to in-memory mock data.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.core.config import settings
from app.core.database import get_supabase, get_supabase_admin, mock_db


def _should_use_mock() -> bool:
    """Check if we should use mock mode"""
    return settings.MOCK_MODE or not get_supabase()


# ==========================================
# USERS
# ==========================================
async def get_user_by_email(email: str) -> Optional[Dict]:
    """Get user by email address"""
    # Try mock mode first
    for user_data in mock_db["users"].values():
        if user_data.get("email") == email or user_data.get("phone") == email:
            return user_data

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase()
        if supabase:
            try:
                response = supabase.table("users").select("*").eq("email", email).execute()
                if response.data:
                    return response.data[0]
            except Exception:
                pass  # Fall back to mock

    return None


async def get_user_by_phone(phone: str) -> Optional[Dict]:
    """Get user by phone number (legacy - for backward compatibility)"""
    # Try email first since we now use email as primary identifier
    return await get_user_by_email(phone)


async def create_user(email: str, full_name: Optional[str] = None, consumer_id: Optional[str] = None, phone: Optional[str] = None) -> Dict:
    """Create a new user with email"""
    import uuid

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase_admin()
        if supabase:
            try:
                user_data = {
                    "email": email,
                    "phone": phone,
                    "full_name": full_name,
                    "consumer_id": consumer_id,
                    "user_type": "consumer",
                    "language_preference": "en"
                }
                response = supabase.table("users").insert(user_data).execute()
                if response.data:
                    return response.data[0]
            except Exception:
                pass  # Fall back to mock

    # Fall back to mock mode
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": email,
        "phone": phone,
        "full_name": full_name,
        "city_zone": None,
        "consumer_id": consumer_id,
        "user_type": "consumer",
        "language_preference": "en",
        "created_at": datetime.now().isoformat()
    }
    mock_db["users"][email] = user
    return user


async def get_user_by_id(user_id: str) -> Optional[Dict]:
    """Get user by ID"""
    # Try mock mode first
    for user_data in mock_db["users"].values():
        if user_data["id"] == user_id:
            return user_data

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase()
        if supabase:
            try:
                response = supabase.table("users").select("*").eq("id", user_id).execute()
                if response.data:
                    return response.data[0]
            except Exception:
                pass

    return None


# ==========================================
# BILLS
# ==========================================
async def get_user_bills(user_id: str) -> List[Dict]:
    """Get all bills for a user"""
    # Try mock mode first
    mock_bills = [bill for bill in mock_db["bills"] if bill["user_id"] == user_id]
    if mock_bills:
        return mock_bills

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase()
        if supabase:
            try:
                response = supabase.table("bills").select("*").eq("user_id", user_id).execute()
                if response.data:
                    return response.data
            except Exception:
                pass

    return mock_bills


async def get_user_pending_bills(user_id: str) -> List[Dict]:
    """Get pending bills for a user"""
    # Try mock mode first
    mock_pending = [bill for bill in mock_db["bills"]
                    if bill["user_id"] == user_id and bill["status"] == "PENDING"]
    if mock_pending:
        return mock_pending

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase()
        if supabase:
            try:
                response = supabase.table("bills").select("*").eq("user_id", user_id).eq("status", "PENDING").execute()
                if response.data:
                    return response.data
            except Exception:
                pass

    return mock_pending


async def update_bill_status(bill_id: str, status: str) -> bool:
    """Update bill status (e.g., mark as paid)"""
    # Try mock mode first
    for bill in mock_db["bills"]:
        if bill["id"] == bill_id:
            bill["status"] = status
            if status == "PAID":
                bill["paid_at"] = datetime.now().isoformat()
            return True

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase_admin()
        if supabase:
            try:
                update_data = {"status": status}
                if status == "PAID":
                    update_data["paid_at"] = datetime.now().isoformat()
                response = supabase.table("bills").update(update_data).eq("id", bill_id).execute()
                if response.data:
                    return True
            except Exception:
                pass

    return False


async def create_bill(bill_data: Dict) -> Dict:
    """Create a new bill"""
    import uuid

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase_admin()
        if supabase:
            try:
                response = supabase.table("bills").insert(bill_data).execute()
                if response.data:
                    return response.data[0]
            except Exception:
                pass

    # Fall back to mock mode
    bill = {
        "id": str(uuid.uuid4()),
        **bill_data,
        "created_at": datetime.now().isoformat()
    }
    mock_db["bills"].append(bill)
    return bill


# ==========================================
# GRIEVANCES
# ==========================================
async def create_grievance(grievance_data: Dict) -> Dict:
    """Create a new grievance"""
    import uuid

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase()
        if supabase:
            try:
                response = supabase.table("grievances").insert(grievance_data).execute()
                if response.data:
                    return response.data[0]
            except Exception:
                pass

    # Fall back to mock mode
    grievance = {
        "id": str(uuid.uuid4()),
        **grievance_data,
        "created_at": datetime.now().isoformat()
    }
    mock_db["grievances"].append(grievance)
    return grievance


async def get_user_grievances(user_id: str) -> List[Dict]:
    """Get all grievances for a user"""
    # Try mock mode first
    mock_grievances = [g for g in mock_db["grievances"] if g["user_id"] == user_id]
    if mock_grievances:
        return mock_grievances

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase()
        if supabase:
            try:
                response = supabase.table("grievances").select("*").eq("user_id", user_id).execute()
                if response.data:
                    return response.data
            except Exception:
                pass

    return mock_grievances


async def get_grievance_by_ticket(ticket_id: str, user_id: str) -> Optional[Dict]:
    """Get grievance by ticket ID"""
    # Try mock mode first
    for g in mock_db["grievances"]:
        if g["ticket_id"] == ticket_id and g["user_id"] == user_id:
            return g

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase()
        if supabase:
            try:
                response = supabase.table("grievances").select("*").eq("ticket_id", ticket_id).eq("user_id", user_id).execute()
                if response.data:
                    return response.data[0]
            except Exception:
                pass

    return None


async def update_grievance(ticket_id: str, user_id: str, update_data: Dict) -> bool:
    """Update grievance"""
    # Try mock mode first
    for g in mock_db["grievances"]:
        if g["ticket_id"] == ticket_id and g["user_id"] == user_id:
            g.update(update_data)
            return True

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase()
        if supabase:
            try:
                response = supabase.table("grievances").update(update_data).eq("ticket_id", ticket_id).eq("user_id", user_id).execute()
                if response.data:
                    return True
            except Exception:
                pass

    return False


# ==========================================
# TRANSACTIONS
# ==========================================
async def create_transaction(transaction_data: Dict) -> Dict:
    """Create a new transaction"""
    import uuid

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase()
        if supabase:
            try:
                response = supabase.table("transactions").insert(transaction_data).execute()
                if response.data:
                    return response.data[0]
            except Exception:
                pass

    # Fall back to mock mode
    transaction = {
        "id": str(uuid.uuid4()),
        **transaction_data,
        "created_at": datetime.now().isoformat()
    }
    mock_db["transactions"].append(transaction)
    return transaction


async def get_user_transactions(user_id: str) -> List[Dict]:
    """Get all transactions for a user"""
    # Try mock mode first
    mock_transactions = [t for t in mock_db["transactions"] if t["user_id"] == user_id]
    if mock_transactions:
        return mock_transactions

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase()
        if supabase:
            try:
                response = supabase.table("transactions").select("*").eq("user_id", user_id).execute()
                if response.data:
                    return response.data
            except Exception:
                pass

    return mock_transactions


async def update_transaction_status(order_id: str, status: str, payment_id: Optional[str] = None) -> bool:
    """Update transaction status after payment verification"""
    # Try mock mode first
    for t in mock_db["transactions"]:
        if t["order_id"] == order_id:
            t["status"] = status
            if payment_id:
                t["payment_id"] = payment_id
            t["verified_at"] = datetime.now().isoformat()
            return True

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase_admin()
        if supabase:
            try:
                update_data = {
                    "status": status,
                    "verified_at": datetime.now().isoformat()
                }
                if payment_id:
                    update_data["payment_id"] = payment_id
                response = supabase.table("transactions").update(update_data).eq("order_id", order_id).execute()
                if response.data:
                    return True
            except Exception:
                pass

    return False


# ==========================================
# CITY ALERTS
# ==========================================
async def get_active_alerts() -> List[Dict]:
    """Get all active city alerts"""
    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase()
        if supabase:
            try:
                response = supabase.table("city_alerts").select("*").eq("is_active", True).execute()
                if response.data:
                    return response.data
            except Exception:
                pass

    # Fall back to mock mode (empty list)
    return []


# ==========================================
# METER READINGS
# ==========================================
async def create_meter_reading(reading_data: Dict) -> Dict:
    """Create a new meter reading"""
    import uuid

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase()
        if supabase:
            try:
                response = supabase.table("meter_readings").insert(reading_data).execute()
                if response.data:
                    return response.data[0]
            except Exception:
                pass

    # Fall back to mock mode
    reading = {
        "id": str(uuid.uuid4()),
        **reading_data,
        "created_at": datetime.now().isoformat()
    }
    mock_db["meter_readings"].append(reading)
    return reading


async def get_user_meter_readings(user_id: str, service_type: Optional[str] = None) -> List[Dict]:
    """Get meter readings for a user"""
    # Try mock mode first
    readings = [r for r in mock_db.get("meter_readings", []) if r["user_id"] == user_id]
    if service_type:
        readings = [r for r in readings if r["service_type"] == service_type]
    if readings:
        return readings

    # Try Supabase if available
    if not _should_use_mock():
        supabase = get_supabase()
        if supabase:
            try:
                query = supabase.table("meter_readings").select("*").eq("user_id", user_id)
                if service_type:
                    query = query.eq("service_type", service_type)
                response = query.execute()
                if response.data:
                    return response.data
            except Exception:
                pass

    return readings
