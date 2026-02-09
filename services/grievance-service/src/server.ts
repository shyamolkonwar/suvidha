import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import logger from './utils/logger';
import grievanceRoutes from './routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(rateLimit({ windowMs: 60000, max: 100 }));
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'grievance-service', timestamp: new Date() });
});

app.use('/', grievanceRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error', { error: err.message });
    res.status(500).json({ success: false, error: 'Internal server error' });
});

const PORT = config.port;

app.listen(PORT, () => {
    logger.info(`Grievance Service running on port ${PORT}`);
});

export default app;
