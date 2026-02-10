import axios from 'axios';
import { config } from '../config';
import logger from '../utils/logger';

export const verifyToken = async (token: string): Promise<any> => {
    try {
        const response = await axios.get(`${config.authServiceUrl}/verify`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.data.success && response.data.data.valid) {
            return response.data.data.user;
        }

        throw new Error('Invalid token');
    } catch (error) {
        logger.error('Token verification failed', error);
        throw new Error('Unauthorized');
    }
};

export const authMiddleware = async (req: any, res: any, next: any) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided',
            });
        }

        const token = authHeader.split(' ')[1];
        const user = await verifyToken(token);

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
        });
    }
};
