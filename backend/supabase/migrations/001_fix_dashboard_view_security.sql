-- ==========================================
-- Fix Security Issue: Dashboard Summary View
-- ==========================================
-- Issue: View public.dashboard_summary was defined with SECURITY DEFINER
-- Risk: Executes with view creator's permissions, bypassing RLS
-- Fix: Recreate view as SECURITY INVOKER (default behavior)
--
-- Run this in Supabase SQL Editor
-- ==========================================

-- Drop the existing view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.dashboard_summary;

CREATE VIEW public.dashboard_summary
WITH (security_invoker = true) AS
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

-- Grant permissions
GRANT SELECT ON public.dashboard_summary TO authenticated;
GRANT SELECT ON public.dashboard_summary TO anon;

-- ==========================================
-- Verification
-- ==========================================
-- Run this to verify the fix:
-- SELECT viewname, viewowner, definition FROM pg_views WHERE viewname = 'dashboard_summary';
-- The view should now execute with the querying user's permissions (security_invoker)
