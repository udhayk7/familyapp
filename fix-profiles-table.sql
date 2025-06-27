-- Fix Profiles Table - Add Missing Columns
-- Run this in Supabase SQL Editor to add any missing columns

-- Add missing columns to profiles table if they don't exist
DO $$
BEGIN
    -- Add age column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'age') THEN
        ALTER TABLE profiles ADD COLUMN age INTEGER;
        RAISE NOTICE 'Added age column to profiles table';
    ELSE
        RAISE NOTICE 'Age column already exists in profiles table';
    END IF;
    
    -- Add relationship column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'relationship') THEN
        ALTER TABLE profiles ADD COLUMN relationship TEXT;
        RAISE NOTICE 'Added relationship column to profiles table';
    ELSE
        RAISE NOTICE 'Relationship column already exists in profiles table';
    END IF;
    
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
        RAISE NOTICE 'Added phone column to profiles table';
    ELSE
        RAISE NOTICE 'Phone column already exists in profiles table';
    END IF;
    
    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column to profiles table';
    ELSE
        RAISE NOTICE 'Avatar_url column already exists in profiles table';
    END IF;
END
$$;

-- Check current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position; 