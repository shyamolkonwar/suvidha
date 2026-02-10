-- ==========================================
-- SUVIDHA Supabase Database Schema (v2)
-- Email/Password Authentication
-- Run this in Supabase SQL Editor
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS TABLE (Updated for Email/Password)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    city_zone TEXT,
    consumer_id TEXT UNIQUE,
    user_type TEXT DEFAULT 'consumer' CHECK (user_type IN ('consumer', 'kiosk', 'admin')),
    language_preference TEXT DEFAULT 'en',
    password_hash TEXT, -- For custom auth (optional with Supabase Auth)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_consumer_id ON public.users(consumer_id);

-- ==========================================
-- 2. BILLS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL CHECK (service_type IN ('electricity', 'water', 'gas')),
    bill_number TEXT UNIQUE NOT NULL,
    amount_due DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    units_consumed DECIMAL(10, 2),
    billing_period_start DATE,
    billing_period_end DATE,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON public.bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON public.bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_service_type ON public.bills(service_type);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON public.bills(due_date);

-- ==========================================
-- 3. GRIEVANCES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.grievances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN (
        'POWER_OUTAGE', 'BILLING_ISSUE', 'METER_PROBLEM',
        'NEW_CONNECTION', 'DISCONNECTION_ISSUE', 'WATER_SUPPLY', 'OTHER'
    )),
    description TEXT NOT NULL,
    audio_url TEXT,
    attachment_url TEXT,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED')),
    priority TEXT DEFAULT 'LOW' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    estimated_resolution TEXT,
    resolution_notes TEXT,
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_grievances_user_id ON public.grievances(user_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON public.grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_ticket_id ON public.grievances(ticket_id);

-- ==========================================
-- 4. TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id TEXT UNIQUE NOT NULL,
    order_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    bill_ids TEXT[], -- Array of bill IDs
    payment_method TEXT CHECK (payment_method IN ('CASH', 'CARD', 'UPI', 'NET_BANKING')),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
    gateway_response JSONB,
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.transactions(order_id);

-- ==========================================
-- 5. CITY_ALERTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.city_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'LOW' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    category TEXT CHECK (category IN ('MAINTENANCE', 'BILLING', 'ANNOUNCEMENT', 'EMERGENCY')),
    is_active BOOLEAN DEFAULT TRUE,
    target_zones TEXT[], -- Array of zones, null = all zones
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_city_alerts_active ON public.city_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_city_alerts_priority ON public.city_alerts(priority);

-- ==========================================
-- 6. METER_READINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.meter_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL CHECK (service_type IN ('electricity', 'water', 'gas')),
    reading_value DECIMAL(10, 2) NOT NULL,
    photo_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    submitted_by TEXT DEFAULT 'consumer', -- 'consumer' or 'admin'
    reading_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meter_readings_user_id ON public.meter_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_meter_readings_service_type ON public.meter_readings(service_type);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_readings ENABLE ROW LEVEL SECURITY;

-- Users can view/update their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Users can view their own bills
CREATE POLICY "Users can view own bills" ON public.bills
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can view their own grievances
CREATE POLICY "Users can view own grievances" ON public.grievances
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own grievances" ON public.grievances
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own grievances" ON public.grievances
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own meter readings" ON public.meter_readings
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own meter readings" ON public.meter_readings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Everyone can view active alerts
CREATE POLICY "Everyone can view active alerts" ON public.city_alerts
    FOR SELECT USING (is_active = TRUE);

-- Service role bypasses RLS (for backend operations)

-- ==========================================
-- FUNCTIONS AND TRIGGERS
-- ==========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_bills_updated_at
    BEFORE UPDATE ON public.bills
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_grievances_updated_at
    BEFORE UPDATE ON public.grievances
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_city_alerts_updated_at
    BEFORE UPDATE ON public.city_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_meter_readings_updated_at
    BEFORE UPDATE ON public.meter_readings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- ==========================================
-- SUPABASE AUTH INTEGRATION
-- ==========================================

-- Function to handle new user signup from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (email, full_name, consumer_id)
    VALUES (
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        split_part(NEW.email, '@', 1)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for automatic user profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- SAMPLE DATA (For testing)
-- ==========================================

-- Insert a sample user
INSERT INTO public.users (email, full_name, consumer_id, city_zone, phone)
VALUES (
    'demo@suvidha.com',
    'Demo User',
    'DEMO-001',
    'Sector 4',
    '+919876543210'
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample bills
INSERT INTO public.bills (user_id, service_type, bill_number, amount_due, due_date, units_consumed, billing_period_start, billing_period_end)
SELECT
    (SELECT id FROM public.users WHERE email = 'demo@suvidha.com'),
    'electricity',
    'ELEC-2024-001',
    1850.00,
    CURRENT_DATE + INTERVAL '7 days',
    320,
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE
ON CONFLICT (bill_number) DO NOTHING;

INSERT INTO public.bills (user_id, service_type, bill_number, amount_due, due_date, units_consumed, billing_period_start, billing_period_end)
SELECT
    (SELECT id FROM public.users WHERE email = 'demo@suvidha.com'),
    'water',
    'WATER-2024-001',
    450.00,
    CURRENT_DATE + INTERVAL '5 days',
    45,
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE
ON CONFLICT (bill_number) DO NOTHING;

INSERT INTO public.bills (user_id, service_type, bill_number, amount_due, due_date, units_consumed, billing_period_start, billing_period_end)
SELECT
    (SELECT id FROM public.users WHERE email = 'demo@suvidha.com'),
    'electricity',
    'ELEC-2024-002',
    1490.00,
    CURRENT_DATE + INTERVAL '25 days',
    280,
    CURRENT_DATE - INTERVAL '60 days',
    CURRENT_DATE - INTERVAL '30 days'
ON CONFLICT (bill_number) DO NOTHING;

-- Insert sample alerts
INSERT INTO public.city_alerts (title, content, priority, category)
VALUES
    ('Scheduled Maintenance', 'Water supply will be interrupted in Sector 4-6 from 10 AM to 2 PM for pipeline maintenance.', 'MEDIUM', 'MAINTENANCE'),
    ('Property Tax Due', 'Property tax payment is due by end of this month. 10% early payment rebate available.', 'LOW', 'BILLING'),
    ('New Connection Camp', 'Special camp for new water connection applications at Municipal Office this Saturday.', 'LOW', 'ANNOUNCEMENT')
ON CONFLICT DO NOTHING;

-- ==========================================
-- GRANT PERMISSIONS
-- ==========================================

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ==========================================
-- VIEWS FOR COMMON QUERIES
-- ==========================================

-- View for dashboard summary
CREATE OR REPLACE VIEW public.dashboard_summary AS
SELECT
    u.id AS user_id,
    u.email,
    u.full_name,
    COALESCE(SUM(CASE WHEN b.status = 'PENDING' THEN b.amount_due ELSE 0 END), 0) AS total_due,
    COUNT(CASE WHEN b.status = 'PENDING' THEN 1 END) AS pending_bills_count,
    COUNT(g.id) FILTER (WHERE g.status IN ('OPEN', 'IN_PROGRESS')) AS open_grievances_count
FROM public.users u
LEFT JOIN public.bills b ON b.user_id = u.id
LEFT JOIN public.grievances g ON g.user_id = u.id
GROUP BY u.id, u.email, u.full_name;

-- ==========================================
-- NOTES
-- ==========================================
-- 1. Email/Password Authentication:
--    - Users table now has email as primary identifier
--    - phone field is optional
--    - Password hash stored for custom auth (optional)
--    - Supabase Auth can be used for email/password auth
--
-- 2. To set up Supabase Auth:
--    - Go to Supabase > Authentication > Providers
--    - Enable Email provider
--    - Update email templates with your branding
--
-- 3. The trigger 'on_auth_user_created' automatically creates
--    a user profile when someone signs up via Supabase Auth
--
-- 4. Test credentials:
--    Email: demo@suvidha.com
--    (In development, any password works for testing)
