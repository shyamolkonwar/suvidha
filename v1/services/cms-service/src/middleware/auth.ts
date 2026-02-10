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

        const response = await axios.get(`${config.authServiceUrl}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
            (req as any).user = response.data.data.user;
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
