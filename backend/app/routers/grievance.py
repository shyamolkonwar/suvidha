"""Grievance Router - Complaint submission and tracking with Supabase"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, Header, Body, status
from typing import List, Optional
from app.models import (
    GrievanceCreate,
    GrievanceResponse,
    GrievanceStatus,
    ApiResponse
)
from app.core.security import verify_token
from app.services.supabase_db import (
    create_grievance,
    get_user_grievances,
    get_grievance_by_ticket,
    update_grievance as update_grievance_db
)
from app.services.ai_processor import ai_processor

router = APIRouter(prefix="/grievance", tags=["Grievance"])


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


def _grievance_to_response(grievance: dict) -> GrievanceResponse:
    """Convert database grievance to response model"""
    return GrievanceResponse(
        ticket_id=grievance["ticket_id"],
        user_id=grievance["user_id"],
        category=grievance["category"],
        description=grievance["description"],
        status=grievance["status"],
        priority=grievance["priority"],
        estimated_resolution=grievance.get("estimated_resolution"),
        created_at=datetime.fromisoformat(grievance["created_at"].replace("Z", "+00:00")) if isinstance(grievance["created_at"], str) else grievance["created_at"],
        resolved_at=datetime.fromisoformat(grievance["resolved_at"].replace("Z", "+00:00")) if grievance.get("resolved_at") and isinstance(grievance["resolved_at"], str) else grievance.get("resolved_at")
    )


@router.post("/submit", response_model=GrievanceResponse)
async def submit_grievance(
    grievance: GrievanceCreate,
    authorization: Optional[str] = Header(None)
):
    """
    Submit a new grievance/complaint
    - Analyzes priority using AI processor
    - Estimates resolution time
    - Returns ticket ID
    """
    user_id = await _get_user_from_token(authorization)

    # Analyze priority and estimate resolution time
    priority = ai_processor.analyze_priority(grievance.description, grievance.category)
    estimated_resolution = ai_processor.estimate_resolution_time(priority)
    ticket_id = ai_processor.generate_ticket_id()

    # Create grievance record
    grievance_data = {
        "ticket_id": ticket_id,
        "user_id": user_id,
        "category": grievance.category.value,
        "description": grievance.description,
        "audio_url": grievance.audio_url,
        "attachment_url": grievance.attachment_url,
        "status": "OPEN",
        "priority": priority.value,
        "estimated_resolution": estimated_resolution
    }

    created_grievance = await create_grievance(grievance_data)

    return _grievance_to_response(created_grievance)


@router.get("/list", response_model=List[GrievanceResponse])
async def get_grievances(authorization: Optional[str] = Header(None)):
    """
    Get all grievances for the authenticated user
    """
    user_id = await _get_user_from_token(authorization)

    grievances = await get_user_grievances(user_id)

    return [_grievance_to_response(g) for g in grievances]


@router.get("/{ticket_id}", response_model=GrievanceResponse)
async def get_grievance(
    ticket_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Get details of a specific grievance
    """
    user_id = await _get_user_from_token(authorization)

    grievance = await get_grievance_by_ticket(ticket_id, user_id)

    if not grievance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grievance not found"
        )

    return _grievance_to_response(grievance)


@router.put("/{ticket_id}", response_model=ApiResponse)
async def update_grievance(
    ticket_id: str,
    description: Optional[str] = Body(None, embed=True),
    authorization: Optional[str] = Header(None)
):
    """
    Update grievance description
    """
    user_id = await _get_user_from_token(authorization)

    update_data = {}
    if description:
        update_data["description"] = description

    success = await update_grievance_db(ticket_id, user_id, update_data)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grievance not found"
        )

    return ApiResponse(
        success=True,
        message="Grievance updated successfully"
    )
