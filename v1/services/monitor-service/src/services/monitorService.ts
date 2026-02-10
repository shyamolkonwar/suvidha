import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import logger from '../utils/logger';
import { config } from '../config';

export interface Kiosk {
    id: string;
    kiosk_id: string;
    location?: string;
    ip_address?: string;
    status: string;
    last_heartbeat?: Date;
    version?: string;
    metadata?: any;
}

export interface KioskMetrics {
    cpu_usage?: number;
    memory_usage?: number;
    disk_usage?: number;
    network_latency?: number;
    active_users?: number;
    temperature?: number;
    uptime_seconds?: number;
}

export interface Alert {
    id: string;
    kiosk_id: string;
    alert_type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    details?: any;
    resolved: boolean;
    created_at: Date;
}

class MonitorService {
    // Register or update kiosk heartbeat
    async recordHeartbeat(kioskId: string, data: {
        location?: string;
        ip_address?: string;
        version?: string;
        metadata?: any;
    }) {
        try {
            const result = await db.query(
                `INSERT INTO kiosks (kiosk_id, location, ip_address, status, last_heartbeat, version, metadata, updated_at)
         VALUES ($1, $2, $3, 'ONLINE', NOW(), $4, $5, NOW())
         ON CONFLICT (kiosk_id)
         DO UPDATE SET
           location = EXCLUDED.location,
           ip_address = EXCLUDED.ip_address,
           status = 'ONLINE',
           last_heartbeat = NOW(),
           version = EXCLUDED.version,
           metadata = EXCLUDED.metadata,
           updated_at = NOW()
         RETURNING *`,
                [kioskId, data.location, data.ip_address, data.version, JSON.stringify(data.metadata)]
            );

            // Log event
            await this.logEvent(result.rows[0].id, 'HEARTBEAT', { status: 'ONLINE' });

            return { success: true, data: result.rows[0] };
        } catch (error) {
            logger.error('Heartbeat recording error:', error);
            throw error;
        }
    }

    // Record kiosk metrics
    async recordMetrics(kioskId: string, metrics: KioskMetrics) {
        try {
            // Get kiosk UUID
            const kioskResult = await db.query(
                'SELECT id FROM kiosks WHERE kiosk_id = $1',
                [kioskId]
            );

            if (kioskResult.rows.length === 0) {
                throw new Error('Kiosk not found');
            }

            const kiosk_uuid = kioskResult.rows[0].id;

            // Insert metrics
            await db.query(
                `INSERT INTO kiosk_metrics (
          kiosk_id, cpu_usage, memory_usage, disk_usage,
          network_latency, active_users, temperature, uptime_seconds
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    kiosk_uuid,
                    metrics.cpu_usage,
                    metrics.memory_usage,
                    metrics.disk_usage,
                    metrics.network_latency,
                    metrics.active_users,
                    metrics.temperature,
                    metrics.uptime_seconds
                ]
            );

            // Check for alert conditions
            await this.checkMetricAlerts(kiosk_uuid, kioskId, metrics);

            return { success: true };
        } catch (error) {
            logger.error('Metrics recording error:', error);
            throw error;
        }
    }

    // Check metrics against thresholds and create alerts
    private async checkMetricAlerts(
        kiosk_uuid: string,
        kioskId: string,
        metrics: KioskMetrics
    ) {
        const alerts = [];

        if (metrics.cpu_usage && metrics.cpu_usage > config.alerts.cpuThreshold) {
            alerts.push({
                type: 'HIGH_CPU',
                severity: 'HIGH',
                message: `CPU usage is ${metrics.cpu_usage}% (threshold: ${config.alerts.cpuThreshold}%)`
            });
        }

        if (metrics.memory_usage && metrics.memory_usage > config.alerts.memoryThreshold) {
            alerts.push({
                type: 'HIGH_MEMORY',
                severity: 'HIGH',
                message: `Memory usage is ${metrics.memory_usage}% (threshold: ${config.alerts.memoryThreshold}%)`
            });
        }

        if (metrics.disk_usage && metrics.disk_usage > config.alerts.diskThreshold) {
            alerts.push({
                type: 'HIGH_DISK',
                severity: 'CRITICAL',
                message: `Disk usage is ${metrics.disk_usage}% (threshold: ${config.alerts.diskThreshold}%)`
            });
        }

        for (const alert of alerts) {
            await this.createAlert(kiosk_uuid, alert.type, alert.severity as any, alert.message);
        }
    }

    // Get all kiosks
    async getAllKiosks(filters?: { status?: string }) {
        try {
            let query = 'SELECT * FROM kiosks';
            const params: any[] = [];

            if (filters?.status) {
                query += ' WHERE status = $1';
                params.push(filters.status);
            }

            query += ' ORDER BY created_at DESC';

            const result = await db.query(query, params);
            return { success: true, data: result.rows };
        } catch (error) {
            logger.error('Get kiosks error:', error);
            throw error;
        }
    }

    // Get kiosk details
    async getKioskDetails(kioskId: string) {
        try {
            const kioskResult = await db.query(
                'SELECT * FROM kiosks WHERE kiosk_id = $1',
                [kioskId]
            );

            if (kioskResult.rows.length === 0) {
                throw new Error('Kiosk not found');
            }

            const kiosk = kioskResult.rows[0];

            // Get recent metrics
            const metricsResult = await db.query(
                `SELECT * FROM kiosk_metrics
         WHERE kiosk_id = $1
         ORDER BY recorded_at DESC
         LIMIT 100`,
                [kiosk.id]
            );

            // Get active alerts
            const alertsResult = await db.query(
                `SELECT * FROM kiosk_alerts
         WHERE kiosk_id = $1 AND resolved = false
         ORDER BY created_at DESC`,
                [kiosk.id]
            );

            return {
                success: true,
                data: {
                    kiosk,
                    metrics: metricsResult.rows,
                    alerts: alertsResult.rows
                }
            };
        } catch (error) {
            logger.error('Get kiosk details error:', error);
            throw error;
        }
    }

    // Get all alerts
    async getAlerts(filters?: { resolved?: boolean; severity?: string }) {
        try {
            let query = `
        SELECT a.*, k.kiosk_id, k.location
        FROM kiosk_alerts a
        JOIN kiosks k ON a.kiosk_id = k.id
        WHERE 1=1
      `;
            const params: any[] = [];
            let paramIndex = 1;

            if (filters?.resolved !== undefined) {
                query += ` AND a.resolved = $${paramIndex}`;
                params.push(filters.resolved);
                paramIndex++;
            }

            if (filters?.severity) {
                query += ` AND a.severity = $${paramIndex}`;
                params.push(filters.severity);
                paramIndex++;
            }

            query += ' ORDER BY a.created_at DESC LIMIT 100';

            const result = await db.query(query, params);
            return { success: true, data: result.rows };
        } catch (error) {
            logger.error('Get alerts error:', error);
            throw error;
        }
    }

    // Create alert
    async createAlert(
        kiosk_uuid: string,
        alertType: string,
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        message: string,
        details?: any
    ) {
        try {
            const result = await db.query(
                `INSERT INTO kiosk_alerts (kiosk_id, alert_type, severity, message, details)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
                [kiosk_uuid, alertType, severity, message, JSON.stringify(details)]
            );

            logger.warn(`Alert created: ${alertType} - ${message}`);
            return { success: true, data: result.rows[0] };
        } catch (error) {
            logger.error('Create alert error:', error);
            throw error;
        }
    }

    // Resolve alert
    async resolveAlert(alertId: string, resolvedBy: string) {
        try {
            const result = await db.query(
                `UPDATE kiosk_alerts
         SET resolved = true, resolved_at = NOW(), resolved_by = $2
         WHERE id = $1
         RETURNING *`,
                [alertId, resolvedBy]
            );

            if (result.rows.length === 0) {
                throw new Error('Alert not found');
            }

            return { success: true, data: result.rows[0] };
        } catch (error) {
            logger.error('Resolve alert error:', error);
            throw error;
        }
    }

    // Log system event
    async logEvent(kiosk_uuid: string, eventType: string, eventData: any) {
        try {
            await db.query(
                'INSERT INTO system_events (kiosk_id, event_type, event_data) VALUES ($1, $2, $3)',
                [kiosk_uuid, eventType, JSON.stringify(eventData)]
            );
        } catch (error) {
            logger.error('Log event error:', error);
        }
    }

    // Check for offline kiosks
    async checkOfflineKiosks() {
        try {
            const timeoutMinutes = config.alerts.heartbeatTimeoutMinutes;

            const result = await db.query(
                `UPDATE kiosks
         SET status = 'OFFLINE', updated_at = NOW()
         WHERE status = 'ONLINE'
         AND last_heartbeat < NOW() - INTERVAL '${timeoutMinutes} minutes'
         RETURNING *`
            );

            // Create alerts for newly offline kiosks
            for (const kiosk of result.rows) {
                await this.createAlert(
                    kiosk.id,
                    'KIOSK_OFFLINE',
                    'CRITICAL',
                    `Kiosk ${kiosk.kiosk_id} has gone offline`,
                    { last_heartbeat: kiosk.last_heartbeat }
                );

                await this.logEvent(kiosk.id, 'STATUS_CHANGE', { status: 'OFFLINE' });
            }

            if (result.rows.length > 0) {
                logger.warn(`${result.rows.length} kiosk(s) marked as offline`);
            }

            return { success: true, offline_count: result.rows.length };
        } catch (error) {
            logger.error('Check offline kiosks error:', error);
            throw error;
        }
    }

    // Get system statistics
    async getSystemStats() {
        try {
            const stats = await db.query(`
        SELECT
          COUNT(*) as total_kiosks,
          COUNT(*) FILTER (WHERE status = 'ONLINE') as online_kiosks,
          COUNT(*) FILTER (WHERE status = 'OFFLINE') as offline_kiosks,
          (SELECT COUNT(*) FROM kiosk_alerts WHERE resolved = false) as active_alerts,
          (SELECT COUNT(*) FROM kiosk_alerts WHERE severity = 'CRITICAL' AND resolved = false) as critical_alerts
        FROM kiosks
      `);

            return { success: true, data: stats.rows[0] };
        } catch (error) {
            logger.error('Get system stats error:', error);
            throw error;
        }
    }
}

export default new MonitorService();
