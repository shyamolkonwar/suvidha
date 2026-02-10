import { Request, Response } from 'express';
import { authService } from '../services/authService';
import logger from '../utils/logger';

export class AuthController {
    /**
     * Register a new user
     * POST /register
     */
    async register(req: Request, res: Response) {
        try {
            const result = await authService.register(req.body);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Registration error', { error: error.message, body: req.body });

            res.status(400).json({
                success: false,
                error: error.message || 'Registration failed',
                timestamp: new Date(),
            });
        }
    }

    /**
     * Login user
     * POST /login
     */
    async login(req: Request, res: Response) {
        try {
            const loginData = {
                ...req.body,
                ip_address: req.ip,
                user_agent: req.headers['user-agent'],
            };

            const result = await authService.login(loginData);

            res.json({
                success: true,
                data: result,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Login error', { error: error.message, consumer_id: req.body.consumer_id });

            res.status(401).json({
                success: false,
                error: error.message || 'Login failed',
                timestamp: new Date(),
            });
        }
    }

    /**
     * Refresh access token
     * POST /refresh
     */
    async refreshToken(req: Request, res: Response) {
        try {
            const { refresh_token } = req.body;
            const result = await authService.refreshToken(refresh_token);

            res.json({
                success: true,
                data: result,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Token refresh error', { error: error.message });

            res.status(401).json({
                success: false,
                error: error.message || 'Token refresh failed',
                timestamp: new Date(),
            });
        }
    }

    /**
     * Logout user
     * POST /logout
     */
    async logout(req: Request, res: Response) {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(400).json({
                    success: false,
                    error: 'No token provided',
                    timestamp: new Date(),
                });
            }

            await authService.logout(token);

            res.json({
                success: true,
                message: 'Logged out successfully',
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Logout error', { error: error.message });

            res.status(500).json({
                success: false,
                error: 'Logout failed',
                timestamp: new Date(),
            });
        }
    }

    /**
     * Verify token
     * GET /verify
     */
    async verifyToken(req: Request, res: Response) {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(400).json({
                    success: false,
                    error: 'No token provided',
                    timestamp: new Date(),
                });
            }

            const decoded = await authService.verifyToken(token);

            res.json({
                success: true,
                data: {
                    valid: true,
                    user: decoded,
                },
                timestamp: new Date(),
            });
        } catch (error: any) {
            res.status(401).json({
                success: false,
                data: {
                    valid: false,
                },
                error: error.message,
                timestamp: new Date(),
            });
        }
    }

    /**
     * Get current user profile
     * GET /me
     */
    async getProfile(req: Request, res: Response) {
        try {
            const user = (req as any).user;

            res.json({
                success: true,
                data: user,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Get profile error', { error: error.message });

            res.status(500).json({
                success: false,
                error: 'Failed to get profile',
                timestamp: new Date(),
            });
        }
    }
}

export const authController = new AuthController();
