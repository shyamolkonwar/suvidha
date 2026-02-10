"""Payment Engine Service - Handles payment processing"""
import uuid
from datetime import datetime
from typing import Optional, List
from app.core.database import mock_db
from app.models import (
    PaymentStatus,
    PaymentMethod,
    CreatePaymentRequest,
    PaymentResponse,
    BillResponse
)


class PaymentEngine:
    """Payment processing engine"""

    @staticmethod
    def generate_order_id() -> str:
        """Generate unique order ID"""
        return f"ORDER-{uuid.uuid4().hex[:12].upper()}"

    @staticmethod
    def generate_transaction_id() -> str:
        """Generate unique transaction ID"""
        return f"TXN-{uuid.uuid4().hex[:12].upper()}"

    @staticmethod
    async def create_payment(
        user_id: str,
        request: CreatePaymentRequest
    ) -> PaymentResponse:
        """
        Create a new payment order
        In mock mode, simulates payment gateway
        """
        order_id = PaymentEngine.generate_order_id()
        transaction_id = PaymentEngine.generate_transaction_id()

        # Create transaction record
        transaction = {
            "transaction_id": transaction_id,
            "order_id": order_id,
            "user_id": user_id,
            "amount": request.amount,
            "bill_ids": request.bill_ids,
            "payment_method": request.payment_method.value,
            "status": PaymentStatus.PENDING.value,
            "created_at": datetime.now().isoformat()
        }

        mock_db["transactions"].append(transaction)

        return PaymentResponse(
            transaction_id=transaction_id,
            order_id=order_id,
            amount=request.amount,
            status=PaymentStatus.PENDING,
            created_at=datetime.now()
        )

    @staticmethod
    async def verify_payment(
        order_id: str,
        payment_id: str
    ) -> Optional[PaymentResponse]:
        """
        Verify payment completion
        In mock mode, auto-successes for demo
        """
        # Find transaction
        transaction = None
        for txn in mock_db["transactions"]:
            if txn["order_id"] == order_id:
                transaction = txn
                break

        if not transaction:
            return None

        # Update transaction status (mock: always success)
        transaction["status"] = PaymentStatus.SUCCESS.value
        transaction["payment_id"] = payment_id
        transaction["verified_at"] = datetime.now().isoformat()

        # Mark bills as paid
        for bill in mock_db["bills"]:
            if bill["id"] in transaction["bill_ids"]:
                bill["status"] = "PAID"

        return PaymentResponse(
            transaction_id=transaction["transaction_id"],
            order_id=transaction["order_id"],
            amount=transaction["amount"],
            status=PaymentStatus.SUCCESS,
            created_at=datetime.fromisoformat(transaction["created_at"])
        )

    @staticmethod
    def _get_current_time() -> datetime:
        """Get current time"""
        return datetime.now()

    @staticmethod
    async def get_user_transactions(user_id: str) -> List[dict]:
        """Get all transactions for a user"""
        user_transactions = [
            txn for txn in mock_db["transactions"]
            if txn.get("user_id") == user_id
        ]
        return user_transactions


payment_engine = PaymentEngine()
