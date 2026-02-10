import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.post('/initiate', authMiddleware, (req, res) => paymentController.initiatePayment(req, res));
router.post('/verify', authMiddleware, (req, res) => paymentController.verifyPayment(req, res));
router.get('/transactions/:consumer_id', authMiddleware, (req, res) => paymentController.getTransactions(req, res));
router.get('/transaction/:transaction_id', authMiddleware, (req, res) => paymentController.getTransaction(req, res));

export default router;
