import { db } from './index';
import logger from '../utils/logger';

async function migrate() {
    try {
        logger.info('Starting grievance database migration...');

        // Create complaints table
        await db.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        complaint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        consumer_id VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        attachments JSON,
        status VARCHAR(20) DEFAULT 'PENDING',
        priority VARCHAR(20) DEFAULT 'NORMAL',
        assigned_to VARCHAR(100),
        resolution TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED')),
        CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
        CHECK (category IN ('billing', 'supply', 'quality', 'meter', 'connection', 'other'))
      );
    `);

        logger.info('Created complaints table');

        // Create service_requests table
        await db.query(`
      CREATE TABLE IF NOT EXISTS service_requests (
        request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        consumer_id VARCHAR(50) NOT NULL,
        service_type VARCHAR(50) NOT NULL,
        details TEXT,
        preferred_date DATE,
        status VARCHAR(20) DEFAULT 'PENDING',
        scheduled_date TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK (status IN ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
        CHECK (service_type IN ('new_connection', 'disconnection', 'meter_installation', 'repair', 'inspection'))
      );
    `);

        logger.info('Created service_requests table');

        // Create indexes
        await db.query(`
      CREATE INDEX IF NOT EXISTS idx_complaints_consumer ON complaints(consumer_id);
      CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
      CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
      CREATE INDEX IF NOT EXISTS idx_service_requests_consumer ON service_requests(consumer_id);
      CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
    `);

        logger.info('Created indexes');

        // Insert sample data
        await db.query(`
      INSERT INTO complaints (consumer_id, category, subject, description, status)
      VALUES 
        ('TEST001', 'billing', 'Incorrect bill amount', 'My last bill shows incorrect meter reading', 'RESOLVED')
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
