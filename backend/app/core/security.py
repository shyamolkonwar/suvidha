"""Security - JWT Token Verification using Supabase"""
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.database import get_supabase_admin


async def verify_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a Supabase JWT token using Supabase's built-in verification.

    This uses Supabase's auth.get_user() method which properly validates
    the token signature and expiration using Supabase's JWKS.

    Args:
        token: The JWT access token from Supabase

    Returns:
        The user object if valid, None otherwise
    """
    try:
        supabase = get_supabase_admin()
        if not supabase:
            print("Supabase client not available")
            return None

        # Use Supabase's built-in token verification
        response = supabase.auth.get_user(token)

        if response.user:
            return {
                "id": response.user.id,
                "email": response.user.email,
                "full_name": response.user.user_metadata.get("full_name"),
                "role": response.user.role,
                "sub": response.user.id,  # For compatibility
            }

        return None

    except Exception as e:
        # Token is invalid or expired
        print(f"Token verification error: {str(e)}")
        return None


async def get_user_id_from_token(token: str) -> Optional[str]:
    """
    Extract user ID from Supabase JWT token.

    Args:
        token: The JWT token from Supabase

    Returns:
        The user ID if valid, None otherwise
    """
    user_data = await verify_supabase_token(token)
    if not user_data:
        return None

    return user_data.get("id") or user_data.get("sub")


async def get_email_from_token(token: str) -> Optional[str]:
    """
    Extract email from Supabase JWT token.

    Args:
        token: The JWT token from Supabase

    Returns:
        The email if present, None otherwise
    """
    user_data = await verify_supabase_token(token)
    if not user_data:
        return None

    return user_data.get("email")


# Legacy functions for backward compatibility
def create_access_token(data: Dict[str, Any]) -> str:
    """
    Create JWT access token (deprecated - use Supabase auth)
    Kept for backward compatibility with mock mode
    """
    import uuid
    from datetime import datetime, timedelta, timezone
    import jwt

    to_encode = data.copy()
    to_encode.update({
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
        "iat": datetime.now(timezone.utc),
        "jti": str(uuid.uuid4())
    })

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str) -> Optional[str]:
    """
    Verify token synchronously and return user_id if valid.
    This is a synchronous wrapper for backward compatibility.
    """
    import asyncio
    try:
        loop = asyncio.get_running_loop()
        # We're in an async context, create a task
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as pool:
            return loop.run_in_executor(pool, lambda: asyncio.run(get_user_id_from_token(token))).result()
    except RuntimeError:
        # No event loop running, run directly
        return asyncio.run(get_user_id_from_token(token))


async def verify_token_async(token: str) -> Optional[str]:
    """
    Verify token asynchronously and return user_id if valid.
    Use this in async endpoints.
    """
    return await get_user_id_from_token(token)
