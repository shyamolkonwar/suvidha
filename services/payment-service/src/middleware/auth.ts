import axios from 'axios';
import { config } from '../config';

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
        const response = await axios.get(`${config.authServiceUrl}/verify`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success && response.data.data.valid) {
            req.user = response.data.data.user;
            next();
        } else {
            throw new Error('Invalid token');
        }
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
        });
    }
};
