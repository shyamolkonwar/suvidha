"""Payments Router - Payment processing with Supabase"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, Header, status
from typing import List, Optional
from app.models import (
    CreatePaymentRequest,
    PaymentResponse,
    ApiResponse,
    PaymentStatus
)
from app.core.security import verify_token
from app.services.supabase_db import (
    create_transaction,
    get_user_transactions,
    update_transaction_status
)

router = APIRouter(prefix="/payments", tags=["Payments"])


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


@router.post("/create-order", response_model=PaymentResponse)
async def create_payment_order(
    request: CreatePaymentRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Create a new payment order
    Returns order ID for payment gateway
    """
    user_id = await _get_user_from_token(authorization)

    # Generate order and transaction IDs
    from app.services.payment_engine import PaymentEngine
    order_id = PaymentEngine.generate_order_id()
    transaction_id = PaymentEngine.generate_transaction_id()

    # Create transaction record
    transaction_data = {
        "transaction_id": transaction_id,
        "order_id": order_id,
        "user_id": user_id,
        "amount": request.amount,
        "bill_ids": request.bill_ids,
        "payment_method": request.payment_method.value,
        "status": "PENDING"
    }

    await create_transaction(transaction_data)

    return PaymentResponse(
        transaction_id=transaction_id,
        order_id=order_id,
        amount=request.amount,
        status=PaymentStatus.PENDING,
        created_at=datetime.now()
    )


@router.post("/verify", response_model=ApiResponse)
async def verify_payment(
    order_id: str,
    payment_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Verify payment completion from payment gateway
    """
    await _get_user_from_token(authorization)

    # Update transaction status
    success = await update_transaction_status(order_id, "SUCCESS", payment_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    return ApiResponse(
        success=True,
        message="Payment verified successfully",
        data={
            "order_id": order_id,
            "payment_id": payment_id,
            "status": "SUCCESS"
        }
    )


@router.get("/transactions", response_model=List[dict])
async def get_transactions(authorization: Optional[str] = Header(None)):
    """
    Get all transactions for the authenticated user
    """
    user_id = await _get_user_from_token(authorization)

    transactions = await get_user_transactions(user_id)

    return transactions


@router.get("/methods", response_model=List[str])
async def get_payment_methods():
    """
    Get available payment methods
    """
    return ["CASH", "CARD", "UPI", "NET_BANKING"]
