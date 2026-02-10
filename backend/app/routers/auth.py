"""Authentication Router - Uses Supabase for authentication

This router handles:
- Getting current user info (using Supabase JWT token)
- Logout (client-side only, clears session)

Note: Registration and login are handled client-side using Supabase JS client.
See: frontend/landing/src/lib/supabase.ts
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, status
from app.models import UserResponse, ApiResponse
from app.core.security import get_user_id_from_token
from app.services.supabase_db import get_user_by_id

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    authorization: Optional[str] = Header(None)
):
    """
    Get current user from Supabase JWT token.

    The token is passed in the Authorization header as: Bearer <token>

    This endpoint:
    1. Verifies the Supabase JWT token using Supabase's auth.get_user()
    2. Extracts the user ID from the token
    3. Fetches the user profile from public.users table
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    # Extract token
    if authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    else:
        token = authorization

    # Verify Supabase JWT token and get user_id
    user_id = await get_user_id_from_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    # Get user from database (public.users table)
    user = await get_user_by_id(user_id)
    if not user:
        # User exists in auth.users but not in public.users
        # This can happen if the trigger hasn't run yet
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please complete registration."
        )

    return UserResponse(
        id=user["id"],
        phone=user.get("phone") or user.get("email", ""),
        full_name=user.get("full_name"),
        email=user.get("email"),
        city_zone=user.get("city_zone"),
        user_type=user.get("user_type", "consumer"),
        created_at=datetime.fromisoformat(user["created_at"])
    )


@router.post("/logout", response_model=ApiResponse)
async def logout():
    """
    Logout user (client-side token removal).

    Note: This endpoint is for API completeness.
    The actual logout is handled client-side by calling:
    supabase.auth.signOut()
    """
    return ApiResponse(
        success=True,
        message="Logged out successfully"
    )
