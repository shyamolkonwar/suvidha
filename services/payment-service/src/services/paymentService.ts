import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { db } from '../database';
import { config } from '../config';
import logger from '../utils/logger';
import { PDFDocument, rgb } from 'pdf-lib';

interface PaymentRequest {
    consumer_id: string;
    amount: number;
    bill_ids: string[];
    payment_method?: string;
    kiosk_id?: string;
}

interface PaymentVerification {
    transaction_id: string;
    payment_id?: string;
    signature?: string;
}

export class PaymentService {
    /**
     * Initiate payment
     */
    async initiatePayment(request: PaymentRequest): Promise<any> {
        try {
            const transaction_id = uuidv4();

            // For MVP, using mock payment
            if (config.payment.gateway === 'mock') {
                // Create mock order
                const mockOrderId = `MOCK_${Date.now()}`;

                // Store transaction
                await db.query(
                    `INSERT INTO transactions (transaction_id, consumer_id, amount, payment_method, gateway_order_id, status, bill_ids, kiosk_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [transaction_id, request.consumer_id, request.amount, request.payment_method || 'MOCK', mockOrderId, 'PENDING', JSON.stringify(request.bill_ids), request.kiosk_id]
                );

                logger.info('Mock payment initiated', { transaction_id, amount: request.amount });

                return {
                    transaction_id,
                    order_id: mockOrderId,
                    amount: request.amount,
                    currency: config.payment.currency,
                    gateway: 'mock',
                };
            }

            // Razorpay integration would go here
            throw new Error('Razorpay integration not implemented yet');
        } catch (error: any) {
            logger.error('Payment initiation failed', { error: error.message, request });
            throw error;
        }
    }

    /**
     * Verify payment
     */
    async verifyPayment(verification: PaymentVerification): Promise<any> {
        try {
            // For mock payment, auto-approve
            if (!verification.payment_id) {
                verification.payment_id = `MOCK_PAY_${Date.now()}`;
            }

            // Update transaction status
            await db.query(
                `UPDATE transactions 
         SET status = $1, gateway_payment_id = $2, completed_at = CURRENT_TIMESTAMP, gateway_response = $3
         WHERE transaction_id = $4`,
                ['SUCCESS', verification.payment_id, JSON.stringify(verification), verification.transaction_id]
            );

            // Get transaction details
            const result = await db.query(
                'SELECT * FROM transactions WHERE transaction_id = $1',
                [verification.transaction_id]
            );

            const transaction = result.rows[0];

            if (!transaction) {
                throw new Error('Transaction not found');
            }

            // Mark bills as paid in utility service
            const billIds = JSON.parse(transaction.bill_ids);
            for (const billId of billIds) {
                try {
                    // Assuming all bills are electricity for now
                    await axios.put(`${config.utilityServiceUrl}/bills/electricity/${billId}/paid`);
                } catch (error) {
                    logger.warn('Failed to mark bill as paid', { billId, error });
                }
            }

            // Generate receipt
            const receiptUrl = await this.generateReceipt(transaction);

            // Update receipt URL
            await db.query(
                'UPDATE transactions SET receipt_url = $1 WHERE transaction_id = $2',
                [receiptUrl, verification.transaction_id]
            );

            logger.info('Payment verified', { transaction_id: verification.transaction_id });

            return {
                success: true,
                transaction_id: verification.transaction_id,
                receipt_url: receiptUrl,
            };
        } catch (error: any) {
            logger.error('Payment verification failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Generate PDF receipt
     */
    async generateReceipt(transaction: any): Promise<string> {
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([600, 800]);
            const { height } = page.getSize();

            // Add content to PDF
            page.drawText('SUVIDHA KIOSK SYSTEM', {
                x: 50,
                y: height - 50,
                size: 24,
                color: rgb(0, 0.2, 0.5),
            });

            page.drawText('Payment Receipt', {
                x: 50,
                y: height - 100,
                size: 18,
            });

            page.drawText(`Transaction ID: ${transaction.transaction_id}`, {
                x: 50,
                y: height - 150,
                size: 12,
            });

            page.drawText(`Consumer ID: ${transaction.consumer_id}`, {
                x: 50,
                y: height - 180,
                size: 12,
            });

            page.drawText(`Amount Paid: ₹${transaction.amount}`, {
                x: 50,
                y: height - 210,
                size: 14,
                color: rgb(0, 0.5, 0),
            });

            page.drawText(`Payment Method: ${transaction.payment_method}`, {
                x: 50,
                y: height - 240,
                size: 12,
            });

            page.drawText(`Date: ${new Date(transaction.completed_at).toLocaleString()}`, {
                x: 50,
                y: height - 270,
                size: 12,
            });

            page.drawText(`Status: ${transaction.status}`, {
                x: 50,
                y: height - 300,
                size: 12,
            });

            page.drawText('Thank you for using SUVIDHA services!', {
                x: 50,
                y: height - 350,
                size: 10,
            });

            const pdfBytes = await pdfDoc.save();

            // In production, upload to S3 or file storage
            // For now, store as file path
            const receiptPath = `/receipts/${transaction.transaction_id}.pdf`;

            // TODO: Save pdfBytes to file system or cloud storage

            logger.info('Receipt generated', { transaction_id: transaction.transaction_id, receiptPath });

            return receiptPath;
        } catch (error: any) {
            logger.error('Receipt generation failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Get transaction history
     */
    async getTransactions(consumer_id: string): Promise<any[]> {
        try {
            const result = await db.query(
                `SELECT * FROM transactions 
         WHERE consumer_id = $1 
         ORDER BY created_at DESC 
         LIMIT 50`,
                [consumer_id]
            );

            return result.rows;
        } catch (error: any) {
            logger.error('Failed to get transactions', { error: error.message });
            throw error;
        }
    }

    /**
     * Get single transaction
     */
    async getTransaction(transaction_id: string): Promise<any> {
        try {
            const result = await db.query(
                'SELECT * FROM transactions WHERE transaction_id = $1',
                [transaction_id]
            );

            return result.rows[0] || null;
        } catch (error: any) {
            logger.error('Failed to get transaction', { error: error.message });
            throw error;
        }
    }
}

export const paymentService = new PaymentService();
