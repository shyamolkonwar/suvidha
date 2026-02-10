"""Database Connection - Supabase Client"""
from typing import Optional, TYPE_CHECKING
from app.core.config import settings

# Try to import Supabase, fail gracefully if not available
try:
    from supabase import Client, create_client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    Client = object  # type: ignore
    def create_client(*args, **kwargs):  # type: ignore
        return None

# Global Supabase client
_supabase_client: Optional["Client"] = None


def get_supabase() -> Optional["Client"]:
    """
    Get Supabase client (singleton pattern)
    Creates client once and reuses it
    Returns None in mock mode
    """
    global _supabase_client

    if not SUPABASE_AVAILABLE:
        return None

    if _supabase_client is None and not settings.MOCK_MODE:
        _supabase_client = create_client(  # type: ignore
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )

    return _supabase_client


def get_supabase_admin() -> Optional["Client"]:
    """
    Get Supabase client with service role key (bypasses RLS)
    Use only for admin operations
    Returns None in mock mode
    """
    if not SUPABASE_AVAILABLE:
        return None

    return create_client(  # type: ignore
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_KEY
    )


# Mock data storage (in-memory for development)
mock_db = {
    "users": {},
    "bills": [],
    "grievances": [],
    "transactions": [],
}
