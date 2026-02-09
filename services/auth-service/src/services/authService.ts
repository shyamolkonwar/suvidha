import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { config } from '../config';
import logger from '../utils/logger';

interface User {
    id: string;
    consumer_id: string;
    phone?: string;
    email?: string;
    password_hash: string;
    language_preference: string;
    created_at: Date;
    last_login?: Date;
    is_active: boolean;
    failed_login_attempts: number;
    locked_until?: Date;
}

interface RegisterData {
    consumer_id: string;
    password: string;
    phone?: string;
    email?: string;
    language_preference?: string;
}

interface LoginData {
    consumer_id: string;
    password: string;
    kiosk_id?: string;
    ip_address?: string;
    user_agent?: string;
}

interface AuthResponse {
    token: string;
    refresh_token: string;
    user: {
        id: string;
        consumer_id: string;
        language_preference: string;
    };
    expires_in: number;
}

export class AuthService {
    /**
     * Register a new user
     */
    async register(data: RegisterData): Promise<{ user_id: string }> {
        // Check if user already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE consumer_id = $1',
            [data.consumer_id]
        );

        if (existingUser.rows.length > 0) {
            throw new Error('User already exists with this consumer ID');
        }

        // Validate password strength
        if (data.password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        // Hash password
        const password_hash = await bcrypt.hash(data.password, config.bcrypt.rounds);

        // Create user
        const result = await db.query(
            `INSERT INTO users (id, consumer_id, phone, email, password_hash, language_preference)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
            [
                uuidv4(),
                data.consumer_id,
                data.phone,
                data.email,
                password_hash,
                data.language_preference || 'en',
            ]
        );

        logger.info('User registered', { consumer_id: data.consumer_id });

        return { user_id: result.rows[0].id };
    }

    /**
     * Login user
     */
    async login(data: LoginData): Promise<AuthResponse> {
        // Fetch user
        const userResult = await db.query(
            'SELECT * FROM users WHERE consumer_id = $1',
            [data.consumer_id]
        );

        if (userResult.rows.length === 0) {
            logger.warn('Login attempt with invalid consumer ID', { consumer_id: data.consumer_id });
            throw new Error('Invalid credentials');
        }

        const user: User = userResult.rows[0];

        // Check if account is locked
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            throw new Error('Account is locked due to multiple failed login attempts');
        }

        // Check if account is active
        if (!user.is_active) {
            throw new Error('Account is deactivated');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(data.password, user.password_hash);

        if (!isValidPassword) {
            // Increment failed login attempts
            const newAttempts = user.failed_login_attempts + 1;
            const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // Lock for 15 minutes after 5 failed attempts

            await db.query(
                'UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3',
                [newAttempts, lockUntil, user.id]
            );

            logger.warn('Failed login attempt', {
                consumer_id: data.consumer_id,
                attempts: newAttempts,
            });

            throw new Error('Invalid credentials');
        }

        // Reset failed login attempts
        await db.query(
            'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            {
                user_id: user.id,
                consumer_id: user.consumer_id,
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiry }
        );

        // Generate refresh token
        const refresh_token = jwt.sign(
            {
                user_id: user.id,
                type: 'refresh',
            },
            config.jwt.secret,
            { expiresIn: config.jwt.refreshExpiry }
        );

        // Store refresh token
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

        await db.query(
            `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
       VALUES ($1, $2, $3, $4)`,
            [uuidv4(), user.id, refresh_token, refreshTokenExpiry]
        );

        // Create session
        const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await db.query(
            `INSERT INTO sessions (session_id, user_id, jwt_token, refresh_token, expires_at, kiosk_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                uuidv4(),
                user.id,
                token,
                refresh_token,
                sessionExpiry,
                data.kiosk_id,
                data.ip_address,
                data.user_agent,
            ]
        );

        logger.info('User logged in', { consumer_id: user.consumer_id, kiosk_id: data.kiosk_id });

        return {
            token,
            refresh_token,
            user: {
                id: user.id,
                consumer_id: user.consumer_id,
                language_preference: user.language_preference,
            },
            expires_in: 24 * 60 * 60, // 24 hours in seconds
        };
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<{ token: string }> {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;

            // Check if refresh token exists and is not revoked
            const tokenResult = await db.query(
                'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND revoked = FALSE AND expires_at > CURRENT_TIMESTAMP',
                [refreshToken, decoded.user_id]
            );

            if (tokenResult.rows.length === 0) {
                throw new Error('Invalid or expired refresh token');
            }

            // Get user
            const userResult = await db.query(
                'SELECT id, consumer_id FROM users WHERE id = $1 AND is_active = TRUE',
                [decoded.user_id]
            );

            if (userResult.rows.length === 0) {
                throw new Error('User not found or inactive');
            }

            const user = userResult.rows[0];

            // Generate new access token
            const token = jwt.sign(
                {
                    user_id: user.id,
                    consumer_id: user.consumer_id,
                },
                config.jwt.secret,
                { expiresIn: config.jwt.expiry }
            );

            logger.info('Token refreshed', { user_id: user.id });

            return { token };
        } catch (error) {
            logger.error('Token refresh failed', error);
            throw new Error('Invalid refresh token');
        }
    }

    /**
     * Logout user (revoke session)
     */
    async logout(token: string): Promise<void> {
        await db.query(
            'UPDATE sessions SET revoked = TRUE WHERE jwt_token = $1',
            [token]
        );

        logger.info('User logged out');
    }

    /**
     * Verify JWT token
     */
    async verifyToken(token: string): Promise<any> {
        try {
            const decoded = jwt.verify(token, config.jwt.secret);

            // Check if session is revoked
            const sessionResult = await db.query(
                'SELECT revoked FROM sessions WHERE jwt_token = $1',
                [token]
            );

            if (sessionResult.rows.length > 0 && sessionResult.rows[0].revoked) {
                throw new Error('Session has been revoked');
            }

            return decoded;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

export const authService = new AuthService();
