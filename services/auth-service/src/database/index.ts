import { Pool, PoolClient } from 'pg';
import { config } from '../config';
import logger from '../utils/logger';

class Database {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            host: config.database.host,
            port: config.database.port,
            database: config.database.database,
            user: config.database.user,
            password: config.database.password,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        this.pool.on('error', (err: Error) => {
            logger.error('Unexpected database error', err);
        });
    }

    async query(text: string, params?: any[]) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            logger.debug('Executed query', { text, duration, rows: result.rowCount });
            return result;
        } catch (error) {
            logger.error('Database query error', { text, error });
            throw error;
        }
    }

    async getClient(): Promise<PoolClient> {
        return await this.pool.connect();
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}

export const db = new Database();
