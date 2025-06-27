-- Check Database Structure
-- Run this in Supabase SQL Editor to see what actually exists

-- 1. Check if profiles table exists
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. If profiles table exists, show its structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. List all tables in the public schema
SELECT 
    schemaname,
    tablename
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. Check if any tables related to our app exist
SELECT 
    tablename
FROM pg_tables 
WHERE schemaname = 'public'
AND (
    tablename LIKE '%profile%' OR 
    tablename LIKE '%senior%' OR 
    tablename LIKE '%medication%' OR
    tablename LIKE '%health%'
)
ORDER BY tablename; 