-- Basic Medications Table Migration
-- Run this in Supabase SQL Editor if medications table doesn't exist properly

-- Drop existing medications table if it has issues
DROP TABLE IF EXISTS medications CASCADE;

-- Create a simple medications table with only basic required fields
CREATE TABLE medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_id UUID REFERENCES senior_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency INTEGER NOT NULL DEFAULT 1, -- How many times per day
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage medications for their seniors" ON medications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM senior_profiles sp 
      WHERE sp.id = medications.senior_id 
      AND sp.family_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_medications_senior_id ON medications(senior_id);

-- Success message
SELECT 'Basic medications table created successfully! 🎉' as status; 