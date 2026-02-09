import db from '../database';
import logger from '../utils/logger';

export interface Announcement {
    id?: string;
    title: string;
    content: string;
    type?: string;
    priority?: string;
    start_date?: Date;
    end_date?: Date;
    active?: boolean;
    target_kiosks?: string[];
    created_by?: string;
}

export interface Banner {
    id?: string;
    title?: string;
    image_url?: string;
    link_url?: string;
    position?: string;
    display_order?: number;
    active?: boolean;
    start_date?: Date;
    end_date?: Date;
    target_kiosks?: string[];
    created_by?: string;
}

class CMSService {
    // Announcements

    async createAnnouncement(announcement: Announcement, createdBy: string) {
        try {
            const result = await db.query(
                `INSERT INTO announcements (
          title, content, type, priority, start_date, end_date,
          active, target_kiosks, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
                [
                    announcement.title,
                    announcement.content,
                    announcement.type || 'GENERAL',
                    announcement.priority || 'NORMAL',
                    announcement.start_date,
                    announcement.end_date,
                    announcement.active !== false,
                    JSON.stringify(announcement.target_kiosks || []),
                    createdBy
                ]
            );

            return { success: true, data: result.rows[0] };
        } catch (error) {
            logger.error('Create announcement error:', error);
            throw error;
        }
    }

    async getAnnouncements(filters?: { active?: boolean; type?: string }) {
        try {
            let query = 'SELECT * FROM announcements WHERE 1=1';
            const params: any[] = [];
            let paramIndex = 1;

            if (filters?.active !== undefined) {
                query += ` AND active = $${paramIndex}`;
                params.push(filters.active);
                paramIndex++;
            }

            if (filters?.type) {
                query += ` AND type = $${paramIndex}`;
                params.push(filters.type);
                paramIndex++;
            }

            query += ' ORDER BY created_at DESC';

            const result = await db.query(query, params);
            return { success: true, data: result.rows };
        } catch (error) {
            logger.error('Get announcements error:', error);
            throw error;
        }
    }

    async getActiveAnnouncements(kioskId?: string) {
        try {
            const result = await db.query(
                `SELECT * FROM announcements
         WHERE active = true
         AND (start_date IS NULL OR start_date <= NOW())
         AND (end_date IS NULL OR end_date >= NOW())
         ORDER BY priority DESC, created_at DESC`
            );

            // Filter by target kiosks if specified
            let announcements = result.rows;
            if (kioskId) {
                announcements = announcements.filter((a: any) => {
                    if (!a.target_kiosks || a.target_kiosks.length === 0) return true;
                    return a.target_kiosks.includes(kioskId);
                });
            }

            return { success: true, data: announcements };
        } catch (error) {
            logger.error('Get active announcements error:', error);
            throw error;
        }
    }

    async updateAnnouncement(id: string, updates: Partial<Announcement>) {
        try {
            const fields: string[] = [];
            const params: any[] = [];
            let paramIndex = 1;

            if (updates.title !== undefined) {
                fields.push(`title = $${paramIndex}`);
                params.push(updates.title);
                paramIndex++;
            }
            if (updates.content !== undefined) {
                fields.push(`content = $${paramIndex}`);
                params.push(updates.content);
                paramIndex++;
            }
            if (updates.type !== undefined) {
                fields.push(`type = $${paramIndex}`);
                params.push(updates.type);
                paramIndex++;
            }
            if (updates.priority !== undefined) {
                fields.push(`priority = $${paramIndex}`);
                params.push(updates.priority);
                paramIndex++;
            }
            if (updates.active !== undefined) {
                fields.push(`active = $${paramIndex}`);
                params.push(updates.active);
                paramIndex++;
            }
            if (updates.start_date !== undefined) {
                fields.push(`start_date = $${paramIndex}`);
                params.push(updates.start_date);
                paramIndex++;
            }
            if (updates.end_date !== undefined) {
                fields.push(`end_date = $${paramIndex}`);
                params.push(updates.end_date);
                paramIndex++;
            }

            fields.push(`updated_at = NOW()`);
            params.push(id);

            const result = await db.query(
                `UPDATE announcements SET ${fields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING *`,
                params
            );

            if (result.rows.length === 0) {
                throw new Error('Announcement not found');
            }

            return { success: true, data: result.rows[0] };
        } catch (error) {
            logger.error('Update announcement error:', error);
            throw error;
        }
    }

    async deleteAnnouncement(id: string) {
        try {
            const result = await db.query(
                'DELETE FROM announcements WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                throw new Error('Announcement not found');
            }

            return { success: true, data: result.rows[0] };
        } catch (error) {
            logger.error('Delete announcement error:', error);
            throw error;
        }
    }

    // Banners

    async createBanner(banner: Banner, createdBy: string) {
        try {
            const result = await db.query(
                `INSERT INTO banners (
          title, image_url, link_url, position, display_order,
          active, start_date, end_date, target_kiosks, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
                [
                    banner.title,
                    banner.image_url,
                    banner.link_url,
                    banner.position || 'HOME',
                    banner.display_order || 0,
                    banner.active !== false,
                    banner.start_date,
                    banner.end_date,
                    JSON.stringify(banner.target_kiosks || []),
                    createdBy
                ]
            );

            return { success: true, data: result.rows[0] };
        } catch (error) {
            logger.error('Create banner error:', error);
            throw error;
        }
    }

    async getBanners(filters?: { active?: boolean; position?: string }) {
        try {
            let query = 'SELECT * FROM banners WHERE 1=1';
            const params: any[] = [];
            let paramIndex = 1;

            if (filters?.active !== undefined) {
                query += ` AND active = $${paramIndex}`;
                params.push(filters.active);
                paramIndex++;
            }

            if (filters?.position) {
                query += ` AND position = $${paramIndex}`;
                params.push(filters.position);
                paramIndex++;
            }

            query += ' ORDER BY display_order ASC, created_at DESC';

            const result = await db.query(query, params);
            return { success: true, data: result.rows };
        } catch (error) {
            logger.error('Get banners error:', error);
            throw error;
        }
    }

    async getActiveBanners(position?: string, kioskId?: string) {
        try {
            let query = `
        SELECT * FROM banners
        WHERE active = true
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
      `;
            const params: any[] = [];

            if (position) {
                query += ' AND position = $1';
                params.push(position);
            }

            query += ' ORDER BY display_order ASC';

            const result = await db.query(query, params);

            // Filter by target kiosks if specified
            let banners = result.rows;
            if (kioskId) {
                banners = banners.filter((b: any) => {
                    if (!b.target_kiosks || b.target_kiosks.length === 0) return true;
                    return b.target_kiosks.includes(kioskId);
                });
            }

            return { success: true, data: banners };
        } catch (error) {
            logger.error('Get active banners error:', error);
            throw error;
        }
    }

    async updateBanner(id: string, updates: Partial<Banner>) {
        try {
            const fields: string[] = [];
            const params: any[] = [];
            let paramIndex = 1;

            if (updates.title !== undefined) {
                fields.push(`title = $${paramIndex}`);
                params.push(updates.title);
                paramIndex++;
            }
            if (updates.image_url !== undefined) {
                fields.push(`image_url = $${paramIndex}`);
                params.push(updates.image_url);
                paramIndex++;
            }
            if (updates.link_url !== undefined) {
                fields.push(`link_url = $${paramIndex}`);
                params.push(updates.link_url);
                paramIndex++;
            }
            if (updates.position !== undefined) {
                fields.push(`position = $${paramIndex}`);
                params.push(updates.position);
                paramIndex++;
            }
            if (updates.display_order !== undefined) {
                fields.push(`display_order = $${paramIndex}`);
                params.push(updates.display_order);
                paramIndex++;
            }
            if (updates.active !== undefined) {
                fields.push(`active = $${paramIndex}`);
                params.push(updates.active);
                paramIndex++;
            }

            fields.push(`updated_at = NOW()`);
            params.push(id);

            const result = await db.query(
                `UPDATE banners SET ${fields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING *`,
                params
            );

            if (result.rows.length === 0) {
                throw new Error('Banner not found');
            }

            return { success: true, data: result.rows[0] };
        } catch (error) {
            logger.error('Update banner error:', error);
            throw error;
        }
    }

    async deleteBanner(id: string) {
        try {
            const result = await db.query(
                'DELETE FROM banners WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                throw new Error('Banner not found');
            }

            return { success: true, data: result.rows[0] };
        } catch (error) {
            logger.error('Delete banner error:', error);
            throw error;
        }
    }

    async incrementBannerClick(id: string) {
        try {
            await db.query(
                'UPDATE banners SET click_count = click_count + 1 WHERE id = $1',
                [id]
            );
            return { success: true };
        } catch (error) {
            logger.error('Increment banner click error:', error);
            throw error;
        }
    }
}

export default new CMSService();
