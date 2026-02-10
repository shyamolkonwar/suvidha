// Shared TypeScript type definitions for SUVIDHA system

// ==========================================
// USER & AUTHENTICATION
// ==========================================
export interface User {
  id: string;
  consumer_id: string;
  phone?: string;
  email?: string;
  language_preference: string;
  created_at: Date;
  last_login?: Date;
}

export interface Session {
  session_id: string;
  user_id: string;
  jwt_token: string;
  expires_at: Date;
  kiosk_id?: string;
}

export interface AuthCredentials {
  consumer_id: string;
  password: string;
  kiosk_id?: string;
}

export interface AuthResponse {
  token: string;
  refresh_token?: string;
  user: User;
  expires_in: number;
}

// ==========================================
// UTILITY SERVICES
// ==========================================
export type UtilityType = 'electricity' | 'gas' | 'water';

export interface Bill {
  id: string;
  consumer_id: string;
  utility_type: UtilityType;
  billing_period: Date;
  units_consumed: number;
  amount_due: number;
  due_date: Date;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  late_fee?: number;
}

export interface MeterReading {
  id: string;
  consumer_id: string;
  utility_type: UtilityType;
  reading_value: number;
  submitted_at: Date;
  verified: boolean;
  photo_url?: string;
}

// ==========================================
// PAYMENT
// ==========================================
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'NET_BANKING';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Transaction {
  transaction_id: string;
  consumer_id: string;
  amount: number;
  payment_method: PaymentMethod;
  gateway_response?: any;
  status: PaymentStatus;
  timestamp: Date;
  bill_ids?: string[];
  receipt_url?: string;
}

export interface PaymentRequest {
  amount: number;
  consumer_id: string;
  bill_ids: string[];
  payment_method?: PaymentMethod;
  kiosk_id?: string;
}

export interface PaymentVerification {
  order_id: string;
  payment_id: string;
  signature: string;
}

// ==========================================
// GRIEVANCE
// ==========================================
export type ComplaintCategory = 
  | 'POWER_OUTAGE' 
  | 'BILLING_ISSUE' 
  | 'METER_PROBLEM' 
  | 'NEW_CONNECTION' 
  | 'DISCONNECTION_ISSUE'
  | 'OTHER';

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';

export interface Complaint {
  ticket_id: string;
  consumer_id: string;
  category: ComplaintCategory;
  description: string;
  attachment_url?: string;
  status: ComplaintStatus;
  created_at: Date;
  resolved_at?: Date;
  resolution_notes?: string;
  assigned_to?: string;
}

export interface ComplaintRequest {
  consumer_id: string;
  category: ComplaintCategory;
  description: string;
  attachment?: File;
}

// ==========================================
// KIOSK MONITORING
// ==========================================
export type KioskStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR';

export interface Kiosk {
  kiosk_id: string;
  location: string;
  latitude?: number;
  longitude?: number;
  status: KioskStatus;
  last_heartbeat: Date;
  ip_address?: string;
  software_version: string;
}

export interface KioskMetrics {
  kiosk_id: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  timestamp: Date;
}

export interface HeartbeatData {
  kiosk_id: string;
  status_data: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

// ==========================================
// CONTENT MANAGEMENT
// ==========================================
export type ContentType = 'BANNER' | 'ALERT' | 'ANNOUNCEMENT' | 'SERVICE_TOGGLE';
export type AlertPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Content {
  content_id: string;
  content_type: ContentType;
  content_data: any;
  target_kiosks: string[];
  active: boolean;
  published_at: Date;
}

export interface Alert {
  title: string;
  message: string;
  priority: AlertPriority;
  target_kiosks: string[] | 'ALL';
}

// ==========================================
// ANALYTICS
// ==========================================
export interface UsageLog {
  log_id: string;
  kiosk_id: string;
  user_id?: string;
  service_accessed: string;
  timestamp: Date;
  duration_seconds: number;
}

export interface DashboardMetrics {
  total_transactions: number;
  total_revenue: number;
  unique_users: number;
  avg_resolution_hours: number;
  daily_transaction_trend?: any;
  service_popularity?: any;
  payment_methods?: any;
}

// ==========================================
// API RESPONSES
// ==========================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==========================================
// WEBSOCKET MESSAGES
// ==========================================
export type WebSocketMessageType = 'ALERT' | 'CONTENT_UPDATE' | 'KIOSK_STATUS' | 'NOTIFICATION';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
  timestamp: Date;
}
