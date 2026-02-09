import { db } from '../database';
import logger from '../utils/logger';

interface ComplaintRequest {
    consumer_id: string;
    category: string;
    subject: string;
    description: string;
    attachments?: string[];
    priority?: string;
}

interface ServiceRequest {
    consumer_id: string;
    service_type: string;
    details?: string;
    preferred_date?: Date;
}

export class GrievanceService {
    /**
     * File a new complaint
     */
    async fileComplaint(complaint: ComplaintRequest): Promise<{ complaint_id: string }> {
        try {
            const result = await db.query(
                `INSERT INTO complaints (consumer_id, category, subject, description, attachments, priority)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING complaint_id`,
                [
                    complaint.consumer_id,
                    complaint.category,
                    complaint.subject,
                    complaint.description,
                    JSON.stringify(complaint.attachments || []),
                    complaint.priority || 'NORMAL',
                ]
            );

            logger.info('Complaint filed', { complaint_id: result.rows[0].complaint_id, consumer_id: complaint.consumer_id });

            return { complaint_id: result.rows[0].complaint_id };
        } catch (error: any) {
            logger.error('Failed to file complaint', { error: error.message });
            throw error;
        }
    }

    /**
     * Get complaints for a consumer
     */
    async getComplaints(consumer_id: string, status?: string): Promise<any[]> {
        try {
            let query = 'SELECT * FROM complaints WHERE consumer_id = $1';
            const params: any[] = [consumer_id];

            if (status) {
                query += ' AND status = $2';
                params.push(status);
            }

            query += ' ORDER BY created_at DESC LIMIT 50';

            const result = await db.query(query, params);

            return result.rows;
        } catch (error: any) {
            logger.error('Failed to get complaints', { error: error.message });
            throw error;
        }
    }

    /**
     * Get single complaint
     */
    async getComplaint(complaint_id: string): Promise<any> {
        try {
            const result = await db.query(
                'SELECT * FROM complaints WHERE complaint_id = $1',
                [complaint_id]
            );

            return result.rows[0] || null;
        } catch (error: any) {
            logger.error('Failed to get complaint', { error: error.message });
            throw error;
        }
    }

    /**
     * Update complaint status (admin function)
     */
    async updateComplaintStatus(complaint_id: string, status: string, resolution?: string): Promise<void> {
        try {
            let query = 'UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP';
            const params: any[] = [status, complaint_id];

            if (status === 'RESOLVED' || status === 'CLOSED') {
                query += ', resolved_at = CURRENT_TIMESTAMP';
            }

            if (resolution) {
                query += ', resolution = $3';
                params.splice(1, 0, resolution);
            }

            query += ' WHERE complaint_id = $' + params.length;

            await db.query(query, params);

            logger.info('Complaint status updated', { complaint_id, status });
        } catch (error: any) {
            logger.error('Failed to update complaint status', { error: error.message });
            throw error;
        }
    }

    /**
     * Create service request
     */
    async createServiceRequest(request: ServiceRequest): Promise<{ request_id: string }> {
        try {
            const result = await db.query(
                `INSERT INTO service_requests (consumer_id, service_type, details, preferred_date)
         VALUES ($1, $2, $3, $4)
         RETURNING request_id`,
                [request.consumer_id, request.service_type, request.details, request.preferred_date]
            );

            logger.info('Service request created', { request_id: result.rows[0].request_id });

            return { request_id: result.rows[0].request_id };
        } catch (error: any) {
            logger.error('Failed to create service request', { error: error.message });
            throw error;
        }
    }

    /**
     * Get service requests for a consumer
     */
    async getServiceRequests(consumer_id: string): Promise<any[]> {
        try {
            const result = await db.query(
                `SELECT * FROM service_requests 
         WHERE consumer_id = $1 
         ORDER BY created_at DESC 
         LIMIT 50`,
                [consumer_id]
            );

            return result.rows;
        } catch (error: any) {
            logger.error('Failed to get service requests', { error: error.message });
            throw error;
        }
    }

    /**
     * Get all pending grievances (admin function)
     */
    async getAllPendingComplaints(limit: number = 100): Promise<any[]> {
        try {
            const result = await db.query(
                `SELECT * FROM complaints 
         WHERE status IN ('PENDING', 'IN_PROGRESS')
         ORDER BY 
           CASE priority 
             WHEN 'URGENT' THEN 1
             WHEN 'HIGH' THEN 2
             WHEN 'NORMAL' THEN 3
             WHEN 'LOW' THEN 4
           END,
           created_at DESC
         LIMIT $1`,
                [limit]
            );

            return result.rows;
        } catch (error: any) {
            logger.error('Failed to get pending complaints', { error: error.message });
            throw error;
        }
    }
}

export const grievanceService = new GrievanceService();
