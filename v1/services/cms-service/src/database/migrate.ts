import db from './index';
import logger from '../utils/logger';

const migrations = [
    {
        name: 'create_announcements_table',
        sql: `
      CREATE TABLE IF NOT EXISTS announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'GENERAL',
        priority VARCHAR(20) DEFAULT 'NORMAL',
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        active BOOLEAN DEFAULT TRUE,
        target_kiosks JSONB,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(active);
      CREATE INDEX IF NOT EXISTS idx_announcements_dates ON announcements(start_date, end_date);
      CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
    `
    },
    {
        name: 'create_banners_table',
        sql: `
      CREATE TABLE IF NOT EXISTS banners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255),
        image_url VARCHAR(500),
        link_url VARCHAR(500),
        position VARCHAR(50) DEFAULT 'HOME',
        display_order INT DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        click_count INT DEFAULT 0,
        target_kiosks JSONB,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(active);
      CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
      CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(display_order);
    `
    },
    {
        name: 'create_content_versions_table',
        sql: `
      CREATE TABLE IF NOT EXISTS content_versions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_type VARCHAR(50) NOT NULL,
        content_id UUID NOT NULL,
        version_data JSONB NOT NULL,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_versions_content ON content_versions(content_type, content_id);
    `
    }
];

export async function runMigrations() {
    logger.info('Starting CMS database migrations...');

    for (const migration of migrations) {
        try {
            logger.info(`Running migration: ${migration.name}`);
            await db.query(migration.sql);
            logger.info(`✓ Migration ${migration.name} completed`);
        } catch (error) {
            logger.error(`✗ Migration ${migration.name} failed:`, error);
            throw error;
        }
    }

    logger.info('All migrations completed successfully');
}

if (require.main === module) {
    runMigrations()
        .then(() => {
            logger.info('Migration script completed');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Migration script failed:', error);
            process.exit(1);
        });
}
