import db, { externalConnections } from '../database';
import logger from '../utils/logger';
import { Parser } from 'json2csv';

class AnalyticsService {
    // Dashboard summary
    async getDashboardSummary() {
        try {
            const today = new Date().toISOString().split('T')[0];

            // Get today's stats
            const statsResult = await db.query(
                'SELECT * FROM daily_stats WHERE date = $1',
                [today]
            );

            // Get total counts from payment service
            const transactionsResult = await externalConnections.payment.query(
                `SELECT 
          COUNT(*) as total_transactions,
          SUM(amount) as total_revenue
         FROM transactions
         WHERE status = 'SUCCESS'`
            );

            // Get user count
            const usersResult = await externalConnections.auth.query(
                'SELECT COUNT(*) as total_users FROM users'
            );

            // Get pending bills
            const billsResult = await externalConnections.utility.query(
                `SELECT COUNT(*) as pending_bills
         FROM bills
         WHERE status = 'PENDING'`
            );

            // Get unresolved complaints
            const complaintsResult = await externalConnections.grievance.query(
                `SELECT COUNT(*) as active_complaints
         FROM complaints
         WHERE status != 'RESOLVED'`
            );

            return {
                success: true,
                data: {
                    today: statsResult.rows[0] || {},
                    totals: {
                        transactions: parseInt(transactionsResult.rows[0]?.total_transactions || '0'),
                        revenue: parseFloat(transactionsResult.rows[0]?.total_revenue || '0'),
                        users: parseInt(usersResult.rows[0]?.total_users || '0'),
                        pending_bills: parseInt(billsResult.rows[0]?.pending_bills || '0'),
                        active_complaints: parseInt(complaintsResult.rows[0]?.active_complaints || '0'),
                    }
                }
            };
        } catch (error) {
            logger.error('Get dashboard summary error:', error);
            throw error;
        }
    }

    // Transaction analytics
    async getTransactionAnalytics(startDate: string, endDate: string) {
        try {
            const result = await externalConnections.payment.query(
                `SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          SUM(amount) as total,
          AVG(amount) as average,
          payment_method,
          COUNT(DISTINCT consumer_id) as unique_users
         FROM transactions
         WHERE created_at >= $1 AND created_at < $2 + INTERVAL '1 day'
         AND status = 'SUCCESS'
         GROUP BY DATE(created_at), payment_method
         ORDER BY date DESC`,
                [startDate, endDate]
            );

            return { success: true, data: result.rows };
        } catch (error) {
            logger.error('Get transaction analytics error:', error);
            throw error;
        }
    }

    // Revenue analytics
    async getRevenueAnalytics(startDate: string, endDate: string) {
        try {
            // Get revenue by utility type
            const result = await externalConnections.payment.query(
                `SELECT 
          b.utility_type,
          DATE(t.created_at) as date,
          SUM(t.amount) as revenue,
          COUNT(*) as transaction_count
         FROM transactions t
         JOIN bills b ON b.id = ANY(t.bill_ids::uuid[])
         WHERE t.created_at >= $1 AND t.created_at < $2 + INTERVAL '1 day'
         AND t.status = 'SUCCESS'
         GROUP BY b.utility_type, DATE(t.created_at)
         ORDER BY date DESC`,
                [startDate, endDate]
            );

            return { success: true, data: result.rows };
        } catch (error) {
            logger.error('Get revenue analytics error:', error);
            throw error;
        }
    }

    // Service usage statistics
    async getServiceUsage(startDate: string, endDate: string) {
        try {
            const services = [
                { name: 'Bill Payment', table: 'transactions', db: 'payment' },
                { name: 'Meter Reading', table: 'meter_readings', db: 'utility' },
                { name: 'Complaints', table: 'complaints', db: 'grievance' },
                { name: 'Service Requests', table: 'service_requests', db: 'grievance' },
            ];

            const results = [];

            for (const service of services) {
                const dbConn = externalConnections[service.db as keyof typeof externalConnections];
                const result = await dbConn.query(
                    `SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
           FROM ${service.table}
           WHERE created_at >= $1 AND created_at < $2 + INTERVAL '1 day'
           GROUP BY DATE(created_at)
           ORDER BY date DESC`,
                    [startDate, endDate]
                );

                results.push({
                    service: service.name,
                    data: result.rows
                });
            }

            return { success: true, data: results };
        } catch (error) {
            logger.error('Get service usage error:', error);
            throw error;
        }
    }

    // User demographics
    async getUserDemographics() {
        try {
            const result = await externalConnections.auth.query(
                `SELECT 
          language_preference,
          COUNT(*) as count
         FROM users
         GROUP BY language_preference`
            );

            return { success: true, data: result.rows };
        } catch (error) {
            logger.error('Get user demographics error:', error);
            throw error;
        }
    }

    // Export data to CSV
    async exportToCsv(reportType: string, startDate: string, endDate: string) {
        try {
            let data;
            let fields;

            switch (reportType) {
                case 'transactions':
                    const txResult = await this.getTransactionAnalytics(startDate, endDate);
                    data = txResult.data;
                    fields = ['date', 'count', 'total', 'average', 'payment_method', 'unique_users'];
                    break;

                case 'revenue':
                    const revResult = await this.getRevenueAnalytics(startDate, endDate);
                    data = revResult.data;
                    fields = ['utility_type', 'date', 'revenue', 'transaction_count'];
                    break;

                default:
                    throw new Error('Invalid report type');
            }

            const parser = new Parser({ fields });
            const csv = parser.parse(data);

            return { success: true, data: csv };
        } catch (error) {
            logger.error('Export to CSV error:', error);
            throw error;
        }
    }

    // Aggregate daily stats (run via cron)
    async aggregateDailyStats(date?: string) {
        try {
            const targetDate = date || new Date().toISOString().split('T')[0];

            // Get transaction stats
            const txStats = await externalConnections.payment.query(
                `SELECT 
          COUNT(*) as total_transactions,
          SUM(amount) as total_revenue,
          AVG(amount) as avg_transaction,
          COUNT(DISTINCT consumer_id) as unique_users
         FROM transactions
         WHERE DATE(created_at) = $1
         AND status = 'SUCCESS'`,
                [targetDate]
            );

            // Get bill payment count
            const billStats = await externalConnections.payment.query(
                `SELECT COUNT(*) as bills_paid
         FROM transactions
         WHERE DATE(created_at) = $1
         AND status = 'SUCCESS'`,
                [targetDate]
            );

            // Get complaint count
            const complaintStats = await externalConnections.grievance.query(
                `SELECT COUNT(*) as complaints
         FROM complaints
         WHERE DATE(created_at) = $1`,
                [targetDate]
            );

            // Get service request count
            const requestStats = await externalConnections.grievance.query(
                `SELECT COUNT(*) as requests
         FROM service_requests
         WHERE DATE(created_at) = $1`,
                [targetDate]
            );

            // Insert or update daily stats
            await db.query(
                `INSERT INTO daily_stats (
          date, total_transactions, total_revenue, total_bills_paid,
          total_complaints, total_service_requests, unique_users, avg_transaction_value
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (date)
        DO UPDATE SET
          total_transactions = EXCLUDED.total_transactions,
          total_revenue = EXCLUDED.total_revenue,
          total_bills_paid = EXCLUDED.total_bills_paid,
          total_complaints = EXCLUDED.total_complaints,
          total_service_requests = EXCLUDED.total_service_requests,
          unique_users = EXCLUDED.unique_users,
          avg_transaction_value = EXCLUDED.avg_transaction_value,
          updated_at = NOW()`,
                [
                    targetDate,
                    txStats.rows[0]?.total_transactions || 0,
                    txStats.rows[0]?.total_revenue || 0,
                    billStats.rows[0]?.bills_paid || 0,
                    complaintStats.rows[0]?.complaints || 0,
                    requestStats.rows[0]?.requests || 0,
                    txStats.rows[0]?.unique_users || 0,
                    txStats.rows[0]?.avg_transaction || 0,
                ]
            );

            logger.info(`Aggregated stats for ${targetDate}`);
            return { success: true };
        } catch (error) {
            logger.error('Aggregate daily stats error:', error);
            throw error;
        }
    }
}

export default new AnalyticsService();
