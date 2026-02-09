import { Request, Response } from 'express';
import { paymentService } from '../services/paymentService';
import logger from '../utils/logger';

export class PaymentController {
    /**
     * Initiate payment
     * POST /initiate
     */
    async initiatePayment(req: Request, res: Response) {
        try {
            const paymentRequest = req.body;

            if (!paymentRequest.consumer_id || !paymentRequest.amount || !paymentRequest.bill_ids) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: consumer_id, amount, bill_ids',
                });
            }

            const result = await paymentService.initiatePayment(paymentRequest);

            res.json({
                success: true,
                data: result,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Initiate payment error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Payment initiation failed',
                timestamp: new Date(),
            });
        }
    }

    /**
     * Verify payment
     * POST /verify
     */
    async verifyPayment(req: Request, res: Response) {
        try {
            const verification = req.body;

            if (!verification.transaction_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing transaction_id',
                });
            }

            const result = await paymentService.verifyPayment(verification);

            res.json({
                success: true,
                data: result,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Verify payment error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Payment verification failed',
                timestamp: new Date(),
            });
        }
    }

    /**
     * Get transaction history
     * GET /transactions/:consumer_id
     */
    async getTransactions(req: Request, res: Response) {
        try {
            const { consumer_id } = req.params;

            const transactions = await paymentService.getTransactions(consumer_id);

            res.json({
                success: true,
                data: transactions,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Get transactions error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get transactions',
                timestamp: new Date(),
            });
        }
    }

    /**
     * Get single transaction
     * GET /transaction/:transaction_id
     */
    async getTransaction(req: Request, res: Response) {
        try {
            const { transaction_id } = req.params;

            const transaction = await paymentService.getTransaction(transaction_id);

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    error: 'Transaction not found',
                });
            }

            res.json({
                success: true,
                data: transaction,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Get transaction error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get transaction',
                timestamp: new Date(),
            });
        }
    }
}

export const paymentController = new PaymentController();
