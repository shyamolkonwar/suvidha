// API Client for SUVIDHA Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
    consumer_id?: string;
  };
}

export interface DashboardSummary {
  user_id: string;
  total_due: number;
  service_breakdown: {
    electricity: { amount: number; count: number; status: string };
    water: { amount: number; count: number; status: string };
    gas: { amount: number; count: number; status: string };
  };
  pending_bills_count: number;
  bills: Array<{
    id: string;
    service_type: string;
    amount_due: number;
    due_date: string;
    status: string;
  }>;
  alerts: Array<{
    id: string;
    title: string;
    content: string;
    priority: string;
  }>;
  grievances: Array<{
    ticket_id: string;
    category: string;
    description: string;
    status: string;
    priority: string;
  }>;
  grievances_count: number;
}

export interface SystemStatus {
  status: string;
  services: {
    electricity: { status: string; load: string };
    water: { status: string; next_reading: string };
    gas: { status: string; note: string };
  };
  cache: string;
  database: string;
}

// API Client
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;

    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('suvidha_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('suvidha_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('suvidha_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || error.message || 'API request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    const params = new URLSearchParams({ email, password });
    return this.request<LoginResponse>(`/api/auth/login?${params}`, {
      method: 'POST',
    });
  }

  async register(email: string, password: string, fullName?: string): Promise<any> {
    const params = new URLSearchParams({
      email,
      password,
      ...(fullName && { full_name: fullName }),
    });
    return this.request(`/api/auth/register?${params}`, {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  logout() {
    this.clearToken();
    return Promise.resolve();
  }

  // Dashboard endpoints
  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.request<DashboardSummary>('/api/dashboard/summary');
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return this.request<SystemStatus>('/api/dashboard/status');
  }

  // Billing endpoints
  async getBills() {
    return this.request('/api/billing/bills');
  }

  async getBillingSummary() {
    return this.request('/api/billing/summary');
  }

  // Grievance endpoints
  async getGrievances() {
    return this.request('/api/grievance/list');
  }

  async submitGrievance(data: {
    category: string;
    description: string;
    audio_url?: string;
  }) {
    return this.request('/api/grievance/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payment endpoints
  async createPaymentOrder(data: {
    amount: number;
    bill_ids: string[];
    payment_method: string;
  }) {
    return this.request('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPayment(orderId: string, paymentId: string) {
    return this.request(`/api/payments/verify?order_id=${orderId}&payment_id=${paymentId}`, {
      method: 'POST',
    });
  }

  // City data endpoints
  async getCityData() {
    return this.request('/api/city-data');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
