import { Router } from 'express';
import { utilityController } from '../controllers/utilityController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.get('/bills/:consumer_id', authMiddleware, (req, res) => utilityController.getBills(req, res));
router.get('/bills/:utility_type/:bill_id', authMiddleware, (req, res) => utilityController.getBillById(req, res));
router.post('/meter-reading', authMiddleware, (req, res) => utilityController.submitMeterReading(req, res));
router.get('/meter-readings/:consumer_id', authMiddleware, (req, res) => utilityController.getMeterReadings(req, res));

// Internal endpoint (should be called only by payment service)
router.put('/bills/:utility_type/:bill_id/paid', (req, res) => utilityController.markBillAsPaid(req, res));

export default router;
