import { Router, Request, Response } from 'express';
import cmsService from '../services/cmsService';
import { authenticateAdmin } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

// Public endpoints (for kiosks to fetch content)

// GET /api/cms/announcements/active - Get active announcements
router.get('/announcements/active', async (req: Request, res: Response) => {
    try {
        const { kiosk_id } = req.query;
        const result = await cmsService.getActiveAnnouncements(kiosk_id as string);
        res.json(result);
    } catch (error) {
        logger.error('Get active announcements error:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve announcements' });
    }
});

// GET /api/cms/banners/active - Get active banners
router.get('/banners/active', async (req: Request, res: Response) => {
    try {
        const { position, kiosk_id } = req.query;
        const result = await cmsService.getActiveBanners(position as string, kiosk_id as string);
        res.json(result);
    } catch (error) {
        logger.error('Get active banners error:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve banners' });
    }
});

// POST /api/cms/banners/:id/click - Track banner click
router.post('/banners/:id/click', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await cmsService.incrementBannerClick(id);
        res.json(result);
    } catch (error) {
        logger.error('Track banner click error:', error);
        res.status(500).json({ success: false, error: 'Failed to track click' });
    }
});

// Admin endpoints (require authentication)

// Announcements CRUD

router.post('/announcements', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const result = await cmsService.createAnnouncement(req.body, user.consumer_id || user.email);
        res.json(result);
    } catch (error) {
        logger.error('Create announcement error:', error);
        res.status(500).json({ success: false, error: 'Failed to create announcement' });
    }
});

router.get('/announcements', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { active, type } = req.query;
        const result = await cmsService.getAnnouncements({
            active: active === 'true' ? true : active === 'false' ? false : undefined,
            type: type as string
        });
        res.json(result);
    } catch (error) {
        logger.error('Get announcements error:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve announcements' });
    }
});

router.put('/announcements/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await cmsService.updateAnnouncement(id, req.body);
        res.json(result);
    } catch (error: any) {
        logger.error('Update announcement error:', error);
        res.status(error.message === 'Announcement not found' ? 404 : 500).json({
            success: false,
            error: error.message || 'Failed to update announcement'
        });
    }
});

router.delete('/announcements/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await cmsService.deleteAnnouncement(id);
        res.json(result);
    } catch (error: any) {
        logger.error('Delete announcement error:', error);
        res.status(error.message === 'Announcement not found' ? 404 : 500).json({
            success: false,
            error: error.message || 'Failed to delete announcement'
        });
    }
});

// Banners CRUD

router.post('/banners', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const result = await cmsService.createBanner(req.body, user.consumer_id || user.email);
        res.json(result);
    } catch (error) {
        logger.error('Create banner error:', error);
        res.status(500).json({ success: false, error: 'Failed to create banner' });
    }
});

router.get('/banners', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { active, position } = req.query;
        const result = await cmsService.getBanners({
            active: active === 'true' ? true : active === 'false' ? false : undefined,
            position: position as string
        });
        res.json(result);
    } catch (error) {
        logger.error('Get banners error:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve banners' });
    }
});

router.put('/banners/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await cmsService.updateBanner(id, req.body);
        res.json(result);
    } catch (error: any) {
        logger.error('Update banner error:', error);
        res.status(error.message === 'Banner not found' ? 404 : 500).json({
            success: false,
            error: error.message || 'Failed to update banner'
        });
    }
});

router.delete('/banners/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await cmsService.deleteBanner(id);
        res.json(result);
    } catch (error: any) {
        logger.error('Delete banner error:', error);
        res.status(error.message === 'Banner not found' ? 404 : 500).json({
            success: false,
            error: error.message || 'Failed to delete banner'
        });
    }
});

export default router;
