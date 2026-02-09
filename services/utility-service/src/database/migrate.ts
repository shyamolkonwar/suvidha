import { db } from './index';
import logger from '../utils/logger';

async function migrate() {
    try {
        logger.info('Starting utility database migration...');

        // Create electricity bills table
        await db.query(`
      CREATE TABLE IF NOT EXISTS electricity_bills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        consumer_id VARCHAR(50) NOT NULL,
        billing_period DATE NOT NULL,
        units_consumed DECIMAL(10, 2) NOT NULL,
        amount_due DECIMAL(10, 2) NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        late_fee DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP,
        CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED'))
      );
    `);

        logger.info('Created electricity_bills table');

        // Create gas bills table
        await db.query(`
      CREATE TABLE IF NOT EXISTS gas_bills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        consumer_id VARCHAR(50) NOT NULL,
        billing_period DATE NOT NULL,
        units_consumed DECIMAL(10, 2) NOT NULL,
        amount_due DECIMAL(10, 2) NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        late_fee DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP,
        CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED'))
      );
    `);

        logger.info('Created gas_bills table');

        // Create water bills table
        await db.query(`
      CREATE TABLE IF NOT EXISTS water_bills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        consumer_id VARCHAR(50) NOT NULL,
        billing_period DATE NOT NULL,
        units_consumed DECIMAL(10, 2) NOT NULL,
        amount_due DECIMAL(10, 2) NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        late_fee DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP,
        CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED'))
      );
    `);

        logger.info('Created water_bills table');

        // Create meter readings table
        await db.query(`
      CREATE TABLE IF NOT EXISTS meter_readings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        consumer_id VARCHAR(50) NOT NULL,
        utility_type VARCHAR(20) NOT NULL,
        reading_value DECIMAL(10, 2) NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified BOOLEAN DEFAULT FALSE,
        photo_url VARCHAR(500),
        notes TEXT,
        CHECK (utility_type IN ('electricity', 'gas', 'water'))
      );
    `);

        logger.info('Created meter_readings table');

        // Create indexes
        await db.query(`
      CREATE INDEX IF NOT EXISTS idx_electricity_bills_consumer ON electricity_bills(consumer_id);
      CREATE INDEX IF NOT EXISTS idx_electricity_bills_status ON electricity_bills(status);
      CREATE INDEX IF NOT EXISTS idx_gas_bills_consumer ON gas_bills(consumer_id);
      CREATE INDEX IF NOT EXISTS idx_water_bills_consumer ON water_bills(consumer_id);
      CREATE INDEX IF NOT EXISTS idx_meter_readings_consumer ON meter_readings(consumer_id);
    `);

        logger.info('Created indexes');

        // Insert sample data for testing
        await db.query(`
      INSERT INTO electricity_bills (consumer_id, billing_period, units_consumed, amount_due, due_date, status)
      VALUES 
        ('TEST001', '2026-01-01', 150.5, 1250.75, '2026-02-15', 'PENDING'),
        ('TEST001', '2025-12-01', 140.2, 1180.50, '2026-01-15', 'PAID')
      ON CONFLICT DO NOTHING;
    `);

        logger.info('Inserted sample data');
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
