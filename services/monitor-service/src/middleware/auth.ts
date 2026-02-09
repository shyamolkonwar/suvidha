import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { config } from '../config';
import logger from '../utils/logger';

export const authenticateAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const token = authHeader.substring(7);

        // Verify token with auth service
        const response = await axios.get(`${config.authServiceUrl}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
            (req as any).user = response.data.data.user;

            // Check if user is admin (you can customize this logic)
            if ((req as any).user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
            }

            next();
        } else {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }
    } catch (error) {
        logger.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

// Middleware for kiosk authentication (using kiosk API keys)
export const authenticateKiosk = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const apiKey = req.headers['x-api-key'] as string;
        const kioskId = req.headers['x-kiosk-id'] as string;

        if (!apiKey || !kioskId) {
            return res.status(401).json({
                success: false,
                error: 'Missing authentication headers'
            });
        }

        // In production, validate API key against database
        // For now, we'll use a simple check
        const expectedKey = process.env.KIOSK_API_KEY || 'kiosk-secret-key';

        if (apiKey !== expectedKey) {
            return res.status(401).json({
                success: false,
                error: 'Invalid API key'
            });
        }

        (req as any).kioskId = kioskId;
        next();
    } catch (error) {
        logger.error('Kiosk authentication error:', error);
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};
