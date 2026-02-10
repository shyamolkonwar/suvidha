"""Authentication Router - Email and Password authentication with Supabase"""
import uuid
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, status
from app.models import (
    TokenResponse,
    UserResponse,
    ApiResponse
)
from app.core.security import create_access_token, verify_token
from app.core.config import settings
from app.services.supabase_db import get_user_by_email, create_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=ApiResponse)
async def register(email: str, password: str, full_name: Optional[str] = None):
    """
    Register a new user with email and password
    In production, this would use Supabase Auth
    """
    # Check if user exists
    user = await get_user_by_email(email)

    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )

    # Create new user
    user = await create_user(
        email=email,
        full_name=full_name or email.split('@')[0].title(),
        consumer_id=email.split('@')[0].upper()
    )

    return ApiResponse(
        success=True,
        message="Registration successful",
        data={
            "user_id": user["id"],
            "email": user["email"]
        }
    )


@router.post("/login", response_model=TokenResponse)
async def login(email: str, password: str):
    """
    Login with email and password
    In production, this would verify with Supabase Auth
    """
    import asyncio

    # Simulate verification delay
    await asyncio.sleep(0.5)

    # Get or create user
    user = await get_user_by_email(email)
    if not user:
        # Create new user
        user = await create_user(
            email=email,
            full_name=email.split('@')[0].title(),
            consumer_id=email.split('@')[0].upper()
        )

    # Update last login
    if not settings.MOCK_MODE:
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
            supabase.table("users").update({"last_login": datetime.now().isoformat()}).eq("id", user["id"]).execute()
        except ImportError:
            pass  # Skip if supabase is not available

    # Generate JWT token
    access_token = create_access_token(
        data={"sub": user["id"], "email": email}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user["id"],
            "phone": user.get("phone") or email,  # For backward compatibility
            "email": user["email"],
            "consumer_id": user.get("consumer_id", email.split('@')[0].upper()),
            "full_name": user.get("full_name"),
            "language_preference": user.get("language_preference", "en")
        }
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    authorization: Optional[str] = Header(None)
):
    """
    Get current user from token
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

    # Verify token
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    # Get user from database
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(
        id=user["id"],
        phone=user["phone"],
        full_name=user.get("full_name"),
        email=user.get("email"),
        city_zone=user.get("city_zone"),
        user_type=user.get("user_type", "consumer"),
        created_at=datetime.fromisoformat(user["created_at"])
    )


@router.post("/logout", response_model=ApiResponse)
async def logout():
    """
    Logout user (client-side token removal)
    """
    return ApiResponse(
        success=True,
        message="Logged out successfully"
    )


# Helper function - import from services
async def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user by ID - re-exported from services"""
    from app.services.supabase_db import get_user_by_id as _get_user_by_id
    return await _get_user_by_id(user_id)


# Add missing imports
import asyncio
