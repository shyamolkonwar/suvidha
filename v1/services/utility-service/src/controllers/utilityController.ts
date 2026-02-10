import { Request, Response } from 'express';
import { utilityService } from '../services/utilityService';
import logger from '../utils/logger';

export class UtilityController {
    /**
     * Get bills for consumer
     * GET /bills/:consumer_id
     */
    async getBills(req: Request, res: Response) {
        try {
            const { consumer_id } = req.params;
            const utilityType = req.query.type as 'electricity' | 'gas' | 'water' | undefined;

            if (utilityType && !['electricity', 'gas', 'water'].includes(utilityType)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid utility type. Must be electricity, gas, or water',
                });
            }

            let bills;
            if (utilityType) {
                bills = await utilityService.getBills(consumer_id, utilityType);
            } else {
                bills = await utilityService.getAllBills(consumer_id);
            }

            res.json({
                success: true,
                data: bills,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Get bills error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to retrieve bills',
                timestamp: new Date(),
            });
        }
    }

    /**
     * Get single bill by ID
     * GET /bills/:utility_type/:bill_id
     */
    async getBillById(req: Request, res: Response) {
        try {
            const { utility_type, bill_id } = req.params;

            if (!['electricity', 'gas', 'water'].includes(utility_type)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid utility type',
                });
            }

            const bill = await utilityService.getBillById(bill_id, utility_type as any);

            if (!bill) {
                return res.status(404).json({
                    success: false,
                    error: 'Bill not found',
                });
            }

            res.json({
                success: true,
                data: bill,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Get bill error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to retrieve bill',
                timestamp: new Date(),
            });
        }
    }

    /**
     * Submit meter reading
     * POST /meter-reading
     */
    async submitMeterReading(req: Request, res: Response) {
        try {
            const reading = req.body;

            if (!reading.consumer_id || !reading.utility_type || !reading.reading_value) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: consumer_id, utility_type, reading_value',
                });
            }

            if (!['electricity', 'gas', 'water'].includes(reading.utility_type)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid utility type',
                });
            }

            const result = await utilityService.submitMeterReading(reading);

            res.status(201).json({
                success: true,
                message: 'Meter reading submitted successfully',
                data: result,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Submit meter reading error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to submit meter reading',
                timestamp: new Date(),
            });
        }
    }

    /**
     * Get meter reading history
     * GET /meter-readings/:consumer_id
     */
    async getMeterReadings(req: Request, res: Response) {
        try {
            const { consumer_id } = req.params;
            const utilityType = req.query.type as 'electricity' | 'gas' | 'water' | undefined;

            const readings = await utilityService.getMeterReadings(consumer_id, utilityType);

            res.json({
                success: true,
                data: readings,
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Get meter readings error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to retrieve meter readings',
                timestamp: new Date(),
            });
        }
    }

    /**
     * Mark bill as paid (internal endpoint for payment service)
     * PUT /bills/:utility_type/:bill_id/paid
     */
    async markBillAsPaid(req: Request, res: Response) {
        try {
            const { utility_type, bill_id } = req.params;

            if (!['electricity', 'gas', 'water'].includes(utility_type)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid utility type',
                });
            }

            await utilityService.markBillAsPaid(bill_id, utility_type as any);

            res.json({
                success: true,
                message: 'Bill marked as paid',
                timestamp: new Date(),
            });
        } catch (error: any) {
            logger.error('Mark bill as paid error', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update bill status',
                timestamp: new Date(),
            });
        }
    }
}

export const utilityController = new UtilityController();
