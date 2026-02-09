import { Router } from 'express';
import { grievanceController } from '../controllers/grievanceController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Complaint routes
router.post('/complaints', authMiddleware, (req, res) => grievanceController.fileComplaint(req, res));
router.get('/complaints/:consumer_id', authMiddleware, (req, res) => grievanceController.getComplaints(req, res));
router.get('/complaint/:complaint_id', authMiddleware, (req, res) => grievanceController.getComplaint(req, res));
router.put('/complaint/:complaint_id/status', (req, res) => grievanceController.updateComplaintStatus(req, res));

// Service request routes
router.post('/service-requests', authMiddleware, (req, res) => grievanceController.createServiceRequest(req, res));
router.get('/service-requests/:consumer_id', authMiddleware, (req, res) => grievanceController.getServiceRequests(req, res));

// Admin routes
router.get('/admin/pending-complaints', (req, res) => grievanceController.getAllPendingComplaints(req, res));

export default router;
