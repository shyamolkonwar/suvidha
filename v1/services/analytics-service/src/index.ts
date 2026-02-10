import express from 'express';
import cors from 'cors';
import { config } from './config';
import logger from './utils/logger';
import analyticsRoutes from './routes/analytics';
import analyticsService from './services/analyticsService';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'analytics-service', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Background task: Aggregate daily stats at midnight
const scheduleDailyAggregation = () => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 5, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(async () => {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0];

            await analyticsService.aggregateDailyStats(dateStr);
            logger.info('Daily stats aggregation completed');
        } catch (error) {
            logger.error('Daily stats aggregation failed:', error);
        }

        // Schedule next run
        setInterval(async () => {
            try {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const dateStr = yesterday.toISOString().split('T')[0];

                await analyticsService.aggregateDailyStats(dateStr);
                logger.info('Daily stats aggregation completed');
            } catch (error) {
                logger.error('Daily stats aggregation failed:', error);
            }
        }, 24 * 60 * 60 * 1000); // Run daily
    }, msUntilMidnight);

    logger.info(`Daily aggregation scheduled for ${tomorrow.toISOString()}`);
};

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    logger.info(`Analytics Service started on port ${PORT}`);
    logger.info(`Environment: ${config.env}`);
    logger.info('Ready to analyze data');

    // Schedule daily aggregation
    scheduleDailyAggregation();
});

export default app;
