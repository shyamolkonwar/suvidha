import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validate, registerSchema, loginSchema, refreshTokenSchema } from '../middleware/validation';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), (req, res) => authController.register(req, res));
router.post('/login', validate(loginSchema), (req, res) => authController.login(req, res));
router.post('/refresh', validate(refreshTokenSchema), (req, res) => authController.refreshToken(req, res));
router.get('/verify', (req, res) => authController.verifyToken(req, res));

// Protected routes
router.post('/logout', verifyToken, (req, res) => authController.logout(req, res));
router.get('/me', verifyToken, (req, res) => authController.getProfile(req, res));

export default router;
