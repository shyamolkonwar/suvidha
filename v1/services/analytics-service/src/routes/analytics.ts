import { Router, Request, Response } from 'express';
import analyticsService from '../services/analyticsService';
import { authenticateAdmin } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

// All endpoints require admin authentication

// GET /api/analytics/dashboard - Dashboard summary
router.get('/dashboard', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const result = await analyticsService.getDashboardSummary();
        res.json(result);
    } catch (error) {
        logger.error('Dashboard endpoint error:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve dashboard data' });
    }
});

// GET /api/analytics/transactions - Transaction analytics
router.get('/transactions', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                error: 'start_date and end_date are required'
            });
        }

        const result = await analyticsService.getTransactionAnalytics(
            start_date as string,
            end_date as string
        );
        res.json(result);
    } catch (error) {
        logger.error('Transaction analytics endpoint error:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve transaction analytics' });
    }
});

// GET /api/analytics/revenue - Revenue analytics
router.get('/revenue', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                error: 'start_date and end_date are required'
            });
        }

        const result = await analyticsService.getRevenueAnalytics(
            start_date as string,
            end_date as string
        );
        res.json(result);
    } catch (error) {
        logger.error('Revenue analytics endpoint error:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve revenue analytics' });
    }
});

// GET /api/analytics/services - Service usage statistics
router.get('/services', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                error: 'start_date and end_date are required'
            });
        }

        const result = await analyticsService.getServiceUsage(
            start_date as string,
            end_date as string
        );
        res.json(result);
    } catch (error) {
        logger.error('Service usage endpoint error:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve service usage' });
    }
});

// GET /api/analytics/demographics - User demographics
router.get('/demographics', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const result = await analyticsService.getUserDemographics();
        res.json(result);
    } catch (error) {
        logger.error('Demographics endpoint error:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve demographics' });
    }
});

// GET /api/analytics/export/csv - Export data to CSV
router.get('/export/csv', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { report_type, start_date, end_date } = req.query;

        if (!report_type || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                error: 'report_type, start_date, and end_date are required'
            });
        }

        const result = await analyticsService.exportToCsv(
            report_type as string,
            start_date as string,
            end_date as string
        );

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${report_type}_${start_date}_${end_date}.csv"`);
        res.send(result.data);
    } catch (error: any) {
        logger.error('Export CSV endpoint error:', error);
        res.status(error.message === 'Invalid report type' ? 400 : 500).json({
            success: false,
            error: error.message || 'Failed to export data'
        });
    }
});

export default router;
