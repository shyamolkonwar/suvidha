import { Request, Response } from 'express';
import { grievanceService } from '../services/grievanceService';
import logger from '../utils/logger';

export class GrievanceController {
    /**
     * File a complaint
     * POST /complaints
     */
    async fileComplaint(req: Request, res: Response) {
        try {
            const complaint = req.body;

            if (!complaint.consumer_id || !complaint.category || !complaint.subject || !complaint.description) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: consumer_id, category, subject, description',
                });
            }

            const validCategories = ['billing', 'supply', 'quality', 'meter', 'connection', 'other'];
            if (!validCategories.includes(complaint.category)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid category. Must be one of: ' + validCategories.join(', '),
                });
            }

            const result = await grievanceService.fileComplaint(complaint);

            res.status(201).json({
                success: true,
                message: 'Complaint filed successfully',
                data: result,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('File complaint error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to file complaint',
            });
        }
    }

    /**
     * Get complaints for a consumer
     * GET /complaints/:consumer_id
     */
    async getComplaints(req: Request, res: Response) {
        try {
            const { consumer_id } = req.params;
            const status = req.query.status as string | undefined;

            const complaints = await grievanceService.getComplaints(consumer_id, status);

            res.json({
                success: true,
                data: complaints,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Get complaints error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get complaints',
            });
        }
    }

    /**
     * Get single complaint
     * GET /complaint/:complaint_id
     */
    async getComplaint(req: Request, res: Response) {
        try {
            const { complaint_id } = req.params;

            const complaint = await grievanceService.getComplaint(complaint_id);

            if (!complaint) {
                return res.status(404).json({
                    success: false,
                    error: 'Complaint not found',
                });
            }

            res.json({
                success: true,
                data: complaint,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Get complaint error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get complaint',
            });
        }
    }

    /**
     * Update complaint status (admin endpoint)
     * PUT /complaint/:complaint_id/status
     */
    async updateComplaintStatus(req: Request, res: Response) {
        try {
            const { complaint_id } = req.params;
            const { status, resolution } = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    error: 'Status is required',
                });
            }

            const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
                });
            }

            await grievanceService.updateComplaintStatus(complaint_id, status, resolution);

            res.json({
                success: true,
                message: 'Complaint status updated',
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Update complaint status error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update complaint status',
            });
        }
    }

    /**
     * Create service request
     * POST /service-requests
     */
    async createServiceRequest(req: Request, res: Response) {
        try {
            const serviceRequest = req.body;

            if (!serviceRequest.consumer_id || !serviceRequest.service_type) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: consumer_id, service_type',
                });
            }

            const validTypes = ['new_connection', 'disconnection', 'meter_installation', 'repair', 'inspection'];
            if (!validTypes.includes(serviceRequest.service_type)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid service type. Must be one of: ' + validTypes.join(', '),
                });
            }

            const result = await grievanceService.createServiceRequest(serviceRequest);

            res.status(201).json({
                success: true,
                message: 'Service request created successfully',
                data: result,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Create service request error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to create service request',
            });
        }
    }

    /**
     * Get service requests for a consumer
     * GET /service-requests/:consumer_id
     */
    async getServiceRequests(req: Request, res: Response) {
        try {
            const { consumer_id } = req.params;

            const requests = await grievanceService.getServiceRequests(consumer_id);

            res.json({
                success: true,
                data: requests,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Get service requests error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get service requests',
            });
        }
    }

    /**
     * Get all pending complaints (admin endpoint)
     * GET /admin/pending-complaints
     */
    async getAllPendingComplaints(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 100;

            const complaints = await grievanceService.getAllPendingComplaints(limit);

            res.json({
                success: true,
                data: complaints,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Get pending complaints error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get pending complaints',
            });
        }
    }
}

export const grievanceController = new GrievanceController();
