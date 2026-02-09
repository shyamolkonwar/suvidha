import { Router, Request, Response } from 'express';
import monitorService from '../services/monitorService';
import { authenticateAdmin, authenticateKiosk } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

// Kiosk endpoints (authenticated with API key)

// POST /api/monitor/heartbeat - Kiosk sends heartbeat
router.post('/heartbeat', authenticateKiosk, async (req: Request, res: Response) => {
    try {
        const kioskId = (req as any).kioskId;
        const { location, ip_address, version, metadata } = req.body;

        const result = await monitorService.recordHeartbeat(kioskId, {
            location,
            ip_address,
            version,
            metadata
        });

        res.json(result);
    } catch (error) {
        logger.error('Heartbeat endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record heartbeat'
        });
    }
});

// POST /api/monitor/metrics - Kiosk sends metrics
router.post('/metrics', authenticateKiosk, async (req: Request, res: Response) => {
    try {
        const kioskId = (req as any).kioskId;
        const metrics = req.body;

        const result = await monitorService.recordMetrics(kioskId, metrics);

        res.json(result);
    } catch (error) {
        logger.error('Metrics endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record metrics'
        });
    }
});

// Admin endpoints (authenticated with JWT)

// GET /api/monitor/kiosks - Get all kiosks
router.get('/kiosks', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { status } = req.query;

        const result = await monitorService.getAllKiosks({
            status: status as string
        });

        res.json(result);
    } catch (error) {
        logger.error('Get kiosks endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve kiosks'
        });
    }
});

// GET /api/monitor/kiosks/:kioskId - Get kiosk details
router.get('/kiosks/:kioskId', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { kioskId } = req.params;

        const result = await monitorService.getKioskDetails(kioskId);

        res.json(result);
    } catch (error: any) {
        logger.error('Get kiosk details endpoint error:', error);
        res.status(error.message === 'Kiosk not found' ? 404 : 500).json({
            success: false,
            error: error.message || 'Failed to retrieve kiosk details'
        });
    }
});

// GET /api/monitor/alerts - Get alerts
router.get('/alerts', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { resolved, severity } = req.query;

        const result = await monitorService.getAlerts({
            resolved: resolved === 'true' ? true : resolved === 'false' ? false : undefined,
            severity: severity as string
        });

        res.json(result);
    } catch (error) {
        logger.error('Get alerts endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve alerts'
        });
    }
});

// PUT /api/monitor/alerts/:alertId/resolve - Resolve alert
router.put('/alerts/:alertId/resolve', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { alertId } = req.params;
        const user = (req as any).user;

        const result = await monitorService.resolveAlert(
            alertId,
            user.consumer_id || user.email || 'admin'
        );

        res.json(result);
    } catch (error: any) {
        logger.error('Resolve alert endpoint error:', error);
        res.status(error.message === 'Alert not found' ? 404 : 500).json({
            success: false,
            error: error.message || 'Failed to resolve alert'
        });
    }
});

// GET /api/monitor/stats - Get system statistics
router.get('/stats', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const result = await monitorService.getSystemStats();
        res.json(result);
    } catch (error) {
        logger.error('Get stats endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve statistics'
        });
    }
});

export default router;
