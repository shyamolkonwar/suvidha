"""Security - JWT Token Verification using Supabase"""
import jwt
from typing import Optional, Dict, Any
from app.core.config import settings


def verify_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a Supabase JWT token and return the decoded payload.

    Supabase uses HS256 algorithm with the JWT secret.

    Args:
        token: The JWT token from Supabase

    Returns:
        The decoded token payload if valid, None otherwise
    """
    try:
        # Decode and verify the token using Supabase JWT secret
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_aud": False,  # Supabase tokens may not have aud
            }
        )

        # Check if this is a valid auth token
        if payload.get("role") not in ["anon", "authenticated", "service_role"]:
            return None

        return payload

    except jwt.ExpiredSignatureError:
        # Token has expired
        return None
    except jwt.InvalidTokenError:
        # Invalid token
        return None
    except Exception:
        # Other errors
        return None


def get_user_id_from_token(token: str) -> Optional[str]:
    """
    Extract user ID from Supabase JWT token.

    Args:
        token: The JWT token from Supabase

    Returns:
        The user ID if valid, None otherwise
    """
    payload = verify_supabase_token(token)
    if not payload:
        return None

    # Supabase stores user ID in 'sub' claim
    return payload.get("sub")


def get_email_from_token(token: str) -> Optional[str]:
    """
    Extract email from Supabase JWT token.

    Args:
        token: The JWT token from Supabase

    Returns:
        The email if present, None otherwise
    """
    payload = verify_supabase_token(token)
    if not payload:
        return None

    return payload.get("email")


# Legacy functions for backward compatibility
def create_access_token(data: Dict[str, Any]) -> str:
    """
    Create JWT access token (deprecated - use Supabase auth)
    Kept for backward compatibility with mock mode
    """
    import uuid
    from datetime import datetime, timedelta

    to_encode = data.copy()
    to_encode.update({
        "exp": datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
        "iat": datetime.utcnow(),
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
    Verify token and return user_id (sub claim) if valid
    Now uses Supabase token verification
    """
    return get_user_id_from_token(token)
