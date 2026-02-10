"""Security - JWT Token Management with ES256 (ECC P-256) and HS256 fallback"""
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from app.core.config import settings


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token
    Uses ES256 (ECC P-256) with HS256 fallback
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow()
    })

    # Try ES256 first (ECC P-256)
    try:
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET,
            algorithm="ES256"
        )
        return encoded_jwt
    except (ValueError, TypeError):
        # Fallback to HS256 if ES256 fails (key not in correct format)
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET,
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and verify JWT token
    Tries both ES256 and HS256 algorithms
    """
    # Try ES256 first
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=["ES256"]
        )
        return payload
    except (jwt.InvalidKeyError, jwt.InvalidAlgorithmError, jwt.DecodeError):
        pass

    # Fallback to HS256
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.PyJWTError:
        return None


def verify_token(token: str) -> Optional[str]:
    """
    Verify token and return user_id (sub claim) if valid
    """
    payload = decode_access_token(token)
    if payload:
        return payload.get("sub")
    return None


def decode_any_algorithm(token: str, public_keys: List[str] = None) -> Optional[Dict[str, Any]]:
    """
    Decode token trying multiple algorithms and public keys
    Useful for verifying tokens from different sources
    """
    algorithms = ["ES256", "HS256"]

    # If no public keys provided, use the secret
    if public_keys is None:
        public_keys = [settings.JWT_SECRET]

    for key in public_keys:
        for algo in algorithms:
            try:
                payload = jwt.decode(
                    token,
                    key,
                    algorithms=[algo]
                )
                return payload
            except (jwt.InvalidKeyError, jwt.InvalidAlgorithmError, jwt.DecodeError, jwt.InvalidSignatureError):
                continue

    return None
