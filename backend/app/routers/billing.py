"""Billing Router - Electricity, Water, Gas bills with Supabase"""
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Header, status
from app.models import (
    BillResponse,
    BillSummary,
)
from app.core.security import verify_token
from app.services.supabase_db import (
    get_user_bills,
    get_user_pending_bills,
    update_bill_status
)

router = APIRouter(prefix="/billing", tags=["Billing"])


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


def _bill_to_response(bill: dict) -> BillResponse:
    """Convert database bill to response model"""
    return BillResponse(
        id=bill["id"],
        user_id=bill["user_id"],
        service_type=bill["service_type"],
        bill_number=bill.get("bill_number"),
        amount_due=float(bill["amount_due"]),
        due_date=datetime.fromisoformat(bill["due_date"].replace("Z", "+00:00")) if isinstance(bill["due_date"], str) else bill["due_date"],
        units_consumed=float(bill["units_consumed"]) if bill.get("units_consumed") else None,
        status=bill["status"],
        created_at=datetime.fromisoformat(bill["created_at"].replace("Z", "+00:00")) if isinstance(bill["created_at"], str) else bill["created_at"]
    )


@router.get("/bills", response_model=List[BillResponse])
async def get_bills(authorization: Optional[str] = Header(None)):
    """
    Get all bills for the authenticated user
    """
    user_id = await _get_user_from_token(authorization)

    # Get bills from database
    bills = await get_user_bills(user_id)

    return [_bill_to_response(bill) for bill in bills]


@router.get("/summary", response_model=BillSummary)
async def get_billing_summary(authorization: Optional[str] = Header(None)):
    """
    Get aggregated billing summary
    - Total due amount
    - Pending bills count
    - Service-wise breakdown
    - Bills due soon (within 7 days)
    """
    user_id = await _get_user_from_token(authorization)

    # Get user's pending bills
    pending_bills = await get_user_pending_bills(user_id)

    # Calculate total due
    total_due = sum(float(bill["amount_due"]) for bill in pending_bills)

    # Service breakdown
    service_breakdown = {}
    for bill in pending_bills:
        service = bill["service_type"]
        if service not in service_breakdown:
            service_breakdown[service] = {"count": 0, "amount": 0}
        service_breakdown[service]["count"] += 1
        service_breakdown[service]["amount"] += float(bill["amount_due"])

    # Find bills due soon (within 7 days)
    seven_days_from_now = datetime.now() + timedelta(days=7)
    due_soon = []
    for bill in pending_bills:
        due_date = datetime.fromisoformat(bill["due_date"].replace("Z", "+00:00")) if isinstance(bill["due_date"], str) else bill["due_date"]
        if due_date <= seven_days_from_now:
            due_soon.append(_bill_to_response(bill))

    return BillSummary(
        total_due=total_due,
        pending_bills=len(pending_bills),
        service_breakdown=service_breakdown,
        due_soon=due_soon
    )


@router.get("/bills/{bill_id}", response_model=BillResponse)
async def get_bill(bill_id: str, authorization: Optional[str] = Header(None)):
    """
    Get details of a specific bill
    """
    user_id = await _get_user_from_token(authorization)

    # Get all user bills and find the specific one
    bills = await get_user_bills(user_id)
    bill = next((b for b in bills if b["id"] == bill_id), None)

    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found"
        )

    return _bill_to_response(bill)
