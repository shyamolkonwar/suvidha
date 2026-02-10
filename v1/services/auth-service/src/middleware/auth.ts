import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import logger from '../utils/logger';

export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided',
            });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = await authService.verifyToken(token);
            (req as any).user = decoded;
            next();
        } catch (error) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or expired token',
            });
        }
    } catch (error) {
        logger.error('Token verification middleware error', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
