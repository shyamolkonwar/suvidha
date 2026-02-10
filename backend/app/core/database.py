"""Database Connection - Supabase Client"""
from typing import Optional, Any, TYPE_CHECKING
from app.core.config import settings

# Try to import Supabase, fail gracefully if not available
if TYPE_CHECKING:
    try:
        from supabase import Client
        SupabaseClient = Client
    except ImportError:
        SupabaseClient = Any
else:
    try:
        from supabase import Client, create_client
        SUPABASE_AVAILABLE = True
        SupabaseClient = Client
    except ImportError:
        SUPABASE_AVAILABLE = False
        SupabaseClient = Any
        def create_client(*args, **kwargs):  # type: ignore
            return None

# Global Supabase client
_supabase_client: Optional["SupabaseClient"] = None


def get_supabase() -> Optional["SupabaseClient"]:
    """
    Get Supabase client (singleton pattern)
    Creates client once and reuses it
    Returns None in mock mode or if Supabase is not configured
    """
    global _supabase_client

    if not SUPABASE_AVAILABLE or settings.MOCK_MODE:
        return None

    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        return None

    if _supabase_client is None:
        try:
            _supabase_client = create_client(  # type: ignore
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )
        except Exception:
            return None

    return _supabase_client


def get_supabase_admin() -> Optional["SupabaseClient"]:
    """
    Get Supabase client with service role key (bypasses RLS)
    Use only for admin operations
    Returns None in mock mode or if Supabase is not configured
    """
    if not SUPABASE_AVAILABLE:
        return None

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return None

    try:
        return create_client(  # type: ignore
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )
    except Exception:
        return None


# Mock data storage (in-memory for development)
mock_db = {
    "users": {},
    "bills": [],
    "grievances": [],
    "transactions": [],
}
