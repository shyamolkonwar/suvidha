import { db } from './index';
import logger from '../utils/logger';

async function migrate() {
    try {
        logger.info('Starting payment database migration...');

        // Create transactions table
        await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        consumer_id VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        gateway_order_id VARCHAR(200),
        gateway_payment_id VARCHAR(200),
        gateway_response JSON,
        status VARCHAR(20) DEFAULT 'PENDING',
        bill_ids JSON,
        kiosk_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        receipt_url VARCHAR(500),
        CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'))
      );
    `);

        logger.info('Created transactions table');

        // Create indexes
        await db.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_consumer ON transactions(consumer_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
      CREATE INDEX IF NOT EXISTS idx_transactions_gateway_order ON transactions(gateway_order_id);
    `);

        logger.info('Created indexes');
        logger.info('Migration completed successfully');
    } catch (error) {
        logger.error('Migration failed', error);
        throw error;
    } finally {
        await db.close();
    }
}

if (require.main === module) {
    migrate().catch(console.error);
}

export default migrate;
