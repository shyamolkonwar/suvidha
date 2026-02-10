// Dashboard Page - "The Citizen Command Center"
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, DashboardSummary, SystemStatus } from '@/lib/api';
import './dashboard.css';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, statusData] = await Promise.all([
        apiClient.getDashboardSummary(),
        apiClient.getSystemStatus(),
      ]);
      setSummary(summaryData);
      setStatus(statusData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayAll = async () => {
    if (!summary || summary.total_due === 0) return;

    try {
      const billIds = summary.bills.map(b => b.id);
      await apiClient.createPaymentOrder({
        amount: summary.total_due,
        bill_ids: billIds,
        payment_method: 'UPI',
      });
      // In a real app, this would open a payment modal
      alert(`Payment initiated for ₹${summary.total_due.toFixed(2)}`);
      await loadDashboardData();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* Zone A: Identity Sidebar (20%) */}
      <aside className="sidebar">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar">
            <span>{user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
          </div>
          <h3 className="profile-name">{user?.full_name || 'User'}</h3>
          <div className="profile-badge">Smart Citizen</div>
          <div className="profile-details">
            <p>Zone: <span> Sector 4</span></p>
            <p>ID: <span> {user?.consumer_id || user?.email}</span></p>
          </div>
        </div>

        {/* Navigation Dock */}
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">⊞</span>
            Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <span className="nav-icon">💳</span>
            Payments
          </button>
          <button
            className={`nav-item ${activeTab === 'grievances' ? 'active' : ''}`}
            onClick={() => setActiveTab('grievances')}
          >
            <span className="nav-icon">📝</span>
            Grievances
          </button>
          <button
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="nav-icon">📊</span>
            History
          </button>
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="nav-icon">⚙️</span>
            Settings
          </button>
        </nav>

        {/* Logout Button */}
        <button className="logout-button" onClick={logout}>
          Secure Exit
        </button>
      </aside>

      {/* Zone B: Action Stage (55%) */}
      <main className="main-content">
        {/* Widget 1: The "Unified Liability" Card */}
        <div className="total-due-card">
          <p className="due-label">Total Outstanding Dues</p>
          <h1 className="due-amount">
            ₹ {summary?.total_due.toFixed(2) || '0.00'}
          </h1>
          <div className="due-breakdown">
            {summary?.service_breakdown.electricity.count ? (
              <span>Electricity (₹{summary.service_breakdown.electricity.amount.toFixed(0)}) + </span>
            ) : null}
            {summary?.service_breakdown.water.count ? (
              <span>Water (₹{summary.service_breakdown.water.amount.toFixed(0)})</span>
            ) : null}
          </div>
          <button
            className="pay-all-button"
            onClick={handlePayAll}
            disabled={!summary || summary.total_due === 0}
          >
            PAY ALL
          </button>
        </div>

        {/* Widget 2: Service Status Grid */}
        <div className="service-grid">
          {/* Electricity Monitor */}
          <div className="service-card electricity">
            <div className="service-icon">⚡</div>
            <div className="service-info">
              <h4>Electricity</h4>
              <p className="service-status">
                {status?.services.electricity.status === 'active' ? 'Normal' : 'Inactive'}
              </p>
              <p className="service-detail">
                {status?.services.electricity.load || 'Checking...'}
              </p>
            </div>
            <div className="service-graph">
              <svg width="80" height="40" viewBox="0 0 80 40">
                <path
                  d="M0,35 Q10,25 20,30 T40,20 T60,25 T80,15"
                  stroke="#10B981"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          {/* Water Supply */}
          <div className="service-card water">
            <div className="service-icon">💧</div>
            <div className="service-info">
              <h4>Water Supply</h4>
              <p className="service-status">
                {status?.services.water.status === 'active' ? 'Supply Active' : 'Inactive'}
              </p>
              <p className="service-detail">
                Next: {status?.services.water.next_reading || '6 PM'}
              </p>
            </div>
            <div className="water-alert">
              Tank Cleaning Scheduled
            </div>
          </div>
        </div>

        {/* Pending Bills */}
        {summary && summary.bills.length > 0 && (
          <div className="bills-section">
            <h3>Pending Bills</h3>
            <div className="bills-list">
              {summary.bills.map((bill) => (
                <div key={bill.id} className="bill-item">
                  <div className="bill-service">{bill.service_type}</div>
                  <div className="bill-details">
                    <p className="bill-amount">₹{bill.amount_due.toFixed(2)}</p>
                    <p className="bill-due">Due: {new Date(bill.due_date).toLocaleDateString()}</p>
                  </div>
                  <div className={`bill-status ${bill.status.toLowerCase()}`}>
                    {bill.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Zone C: Intelligence Feed (25%) */}
      <aside className="feed-sidebar">
        {/* Live City Ticker */}
        <div className="feed-card">
          <h3>📍 Local Updates</h3>
          <div className="ticker-list">
            {summary?.alerts.map((alert) => (
              <div key={alert.id} className="ticker-item">
                <span className={`ticker-priority ${alert.priority.toLowerCase()}`}>
                  {alert.priority === 'HIGH' ? '🚧' : alert.priority === 'MEDIUM' ? '📢' : 'ℹ️'}
                </span>
                <p>{alert.content}</p>
              </div>
            )) || (
              <>
                <div className="ticker-item">
                  <span className="ticker-priority">🚧</span>
                  <p>Road work in Sector 4 (Delay expected)</p>
                </div>
                <div className="ticker-item">
                  <span className="ticker-priority">📢</span>
                  <p>Property Tax rebate ends in 2 days</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Grievance */}
        <div className="feed-card voice-card">
          <h3>🎤 Report an Issue</h3>
          <div className="voice-box" onClick={() => alert('Voice recording coming soon!')}>
            <div className="voice-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="#10B981" strokeWidth="2" />
                <path d="M24 16V28M24 32V34" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p>Tap to Speak Complaint</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="feed-card stats-card">
          <h3>Your Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{summary?.grievances_count || 0}</span>
              <span className="stat-label">Open Tickets</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{summary?.pending_bills_count || 0}</span>
              <span className="stat-label">Pending Bills</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
