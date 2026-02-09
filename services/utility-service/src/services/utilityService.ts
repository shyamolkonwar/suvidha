import { db } from '../database';
import logger from '../utils/logger';

type UtilityType = 'electricity' | 'gas' | 'water';

interface Bill {
    id: string;
    consumer_id: string;
    billing_period: Date;
    units_consumed: number;
    amount_due: number;
    due_date: Date;
    status: string;
    late_fee?: number;
    created_at: Date;
    paid_at?: Date;
}

interface MeterReading {
    consumer_id: string;
    utility_type: UtilityType;
    reading_value: number;
    photo_url?: string;
    notes?: string;
}

export class UtilityService {
    /**
     * Get bills for a consumer
     */
    async getBills(consumer_id: string, utilityType?: UtilityType): Promise<Bill[]> {
        try {
            let tableName = 'electricity_bills';

            if (utilityType === 'gas') {
                tableName = 'gas_bills';
            } else if (utilityType === 'water') {
                tableName = 'water_bills';
            }

            const result = await db.query(
                `SELECT * FROM ${tableName} 
         WHERE consumer_id = $1 
         ORDER BY billing_period DESC
         LIMIT 12`,
                [consumer_id]
            );

            logger.info('Bills retrieved', { consumer_id, utilityType, count: result.rows.length });

            return result.rows;
        } catch (error) {
            logger.error('Error retrieving bills', { consumer_id, error });
            throw new Error('Failed to retrieve bills');
        }
    }

    /**
     * Get all bills (electricity + gas + water)
     */
    async getAllBills(consumer_id: string): Promise<{ electricity: Bill[], gas: Bill[], water: Bill[] }> {
        try {
            const [electricity, gas, water] = await Promise.all([
                this.getBills(consumer_id, 'electricity'),
                this.getBills(consumer_id, 'gas'),
                this.getBills(consumer_id, 'water'),
            ]);

            return { electricity, gas, water };
        } catch (error) {
            logger.error('Error retrieving all bills', { consumer_id, error });
            throw new Error('Failed to retrieve bills');
        }
    }

    /**
     * Get bill by ID
     */
    async getBillById(billId: string, utilityType: UtilityType): Promise<Bill | null> {
        try {
            let tableName = 'electricity_bills';

            if (utilityType === 'gas') {
                tableName = 'gas_bills';
            } else if (utilityType === 'water') {
                tableName = 'water_bills';
            }

            const result = await db.query(
                `SELECT * FROM ${tableName} WHERE id = $1`,
                [billId]
            );

            return result.rows[0] || null;
        } catch (error) {
            logger.error('Error retrieving bill', { billId, error });
            throw new Error('Failed to retrieve bill');
        }
    }

    /**
     * Submit meter reading
     */
    async submitMeterReading(reading: MeterReading): Promise<{ reading_id: string }> {
        try {
            const result = await db.query(
                `INSERT INTO meter_readings (consumer_id, utility_type, reading_value, photo_url, notes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
                [reading.consumer_id, reading.utility_type, reading.reading_value, reading.photo_url, reading.notes]
            );

            logger.info('Meter reading submitted', { consumer_id: reading.consumer_id, utility_type: reading.utility_type });

            return { reading_id: result.rows[0].id };
        } catch (error) {
            logger.error('Error submitting meter reading', { reading, error });
            throw new Error('Failed to submit meter reading');
        }
    }

    /**
     * Get meter reading history
     */
    async getMeterReadings(consumer_id: string, utilityType?: UtilityType): Promise<any[]> {
        try {
            let query = 'SELECT * FROM meter_readings WHERE consumer_id = $1';
            const params: any[] = [consumer_id];

            if (utilityType) {
                query += ' AND utility_type = $2';
                params.push(utilityType);
            }

            query += ' ORDER BY submitted_at DESC LIMIT 20';

            const result = await db.query(query, params);

            return result.rows;
        } catch (error) {
            logger.error('Error retrieving meter readings', { consumer_id, error });
            throw new Error('Failed to retrieve meter readings');
        }
    }

    /**
     * Mark bill as paid (called by payment service)
     */
    async markBillAsPaid(billId: string, utilityType: UtilityType): Promise<void> {
        try {
            let tableName = 'electricity_bills';

            if (utilityType === 'gas') {
                tableName = 'gas_bills';
            } else if (utilityType === 'water') {
                tableName = 'water_bills';
            }

            await db.query(
                `UPDATE ${tableName} 
         SET status = 'PAID', paid_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
                [billId]
            );

            logger.info('Bill marked as paid', { billId, utilityType });
        } catch (error) {
            logger.error('Error marking bill as paid', { billId, error });
            throw new Error('Failed to update bill status');
        }
    }
}

export const utilityService = new UtilityService();
