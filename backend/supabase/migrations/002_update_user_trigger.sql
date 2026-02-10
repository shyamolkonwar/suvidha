-- ==========================================
-- Update User Creation Trigger for Supabase Auth
-- ==========================================
-- This improves the handle_new_user() function to:
-- 1. Use the auth.users.id as the public.users.id
-- 2. Handle conflicts gracefully
-- 3. Include all necessary fields
--
-- Run this in Supabase SQL Editor
-- ==========================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    consumer_id_val TEXT;
BEGIN
    -- Generate consumer_id from email
    consumer_id_val := UPPER(REGEXP_REPLACE(NEW.email, '[@\.]', '_'));

    -- Insert into public.users with auth.users.id
    INSERT INTO public.users (
        id,
        email,
        full_name,
        consumer_id,
        user_type,
        language_preference
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        consumer_id_val,
        'consumer',
        'en'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- Grant permissions
-- ==========================================
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT SELECT ON auth.users TO service_role;
