import express from 'express';
import cors from 'cors';
import { config } from './config';
import logger from './utils/logger';
import cmsRoutes from './routes/cms';

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
    res.json({ status: 'ok', service: 'cms-service', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/cms', cmsRoutes);

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

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    logger.info(`CMS Service started on port ${PORT}`);
    logger.info(`Environment: ${config.env}`);
    logger.info('Ready to serve content');
});

export default app;
