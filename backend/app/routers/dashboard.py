"""Dashboard Router - Summary endpoint for dashboard page"""
from fastapi import APIRouter, HTTPException, Header, status
from typing import Optional, Dict, Any
from app.core.security import verify_token
from app.services.supabase_db import (
    get_user_pending_bills,
    get_active_alerts,
    get_user_grievances
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


async def _get_user_from_token(authorization: Optional[str]) -> str:
    """Extract user ID from authorization header"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    token = authorization.split(" ")[1] if authorization.startswith("Bearer ") else authorization
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    return user_id


@router.get("/summary")
async def get_dashboard_summary(authorization: Optional[str] = Header(None)):
    """
    Get dashboard summary - Aggregates all data for the dashboard
    - Total outstanding dues
    - Service breakdown
    - Pending bills
    - Active alerts
    - Recent grievances
    """
    user_id = await _get_user_from_token(authorization)

    # Get pending bills
    pending_bills = await get_user_pending_bills(user_id)

    # Calculate totals
    total_due = sum(float(bill["amount_due"]) for bill in pending_bills)

    # Service breakdown
    service_breakdown: Dict[str, Any] = {
        "electricity": {"amount": 0, "count": 0, "status": "active"},
        "water": {"amount": 0, "count": 0, "status": "active"},
        "gas": {"amount": 0, "count": 0, "status": "inactive"}
    }

    for bill in pending_bills:
        service = bill["service_type"]
        if service in service_breakdown:
            service_breakdown[service]["amount"] += float(bill["amount_due"])
            service_breakdown[service]["count"] += 1

    # Get active alerts
    alerts = await get_active_alerts()

    # Get user grievances
    grievances = await get_user_grievances(user_id)
    open_grievances = [g for g in grievances if g["status"] in ["OPEN", "IN_PROGRESS"]]

    return {
        "user_id": user_id,
        "total_due": total_due,
        "service_breakdown": service_breakdown,
        "pending_bills_count": len(pending_bills),
        "bills": pending_bills,
        "alerts": alerts,
        "grievances": open_grievances,
        "grievances_count": len(open_grievances)
    }


@router.get("/status")
async def get_system_status():
    """
    Get system status for dashboard
    - Service availability
    - System health
    """
    return {
        "status": "online",
        "services": {
            "electricity": {"status": "active", "load": "2.4kW"},
            "water": {"status": "active", "next_reading": "6 PM"},
            "gas": {"status": "inactive", "note": "Not available in your area"}
        },
        "cache": "enabled",
        "database": "connected"
    }
