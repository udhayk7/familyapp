-- Enhanced Smart Medication Assistant Database Schema
-- Supports multi-module system with voice AI and real-time features
-- Run this in Supabase SQL Editor

-- 1. Enhanced Users/Profiles Table (Replaces basic profiles)
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('senior', 'family', 'doctor')) NOT NULL DEFAULT 'family',
  age INTEGER,
  relationship TEXT, -- For family members: 'spouse', 'child', 'caretaker', etc.
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- 2. Senior Profiles (Enhanced with more health data)
CREATE TABLE IF NOT EXISTS senior_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  health_conditions TEXT[],
  other_health_condition TEXT,
  emergency_contact TEXT,
  doctor_info JSONB, -- {"name": "Dr. Smith", "phone": "+1234567890", "email": "doctor@clinic.com"}
  insurance_info JSONB,
  allergies TEXT[],
  mobility_level TEXT CHECK (mobility_level IN ('independent', 'assisted', 'wheelchair', 'bedridden')),
  cognitive_level TEXT CHECK (cognitive_level IN ('normal', 'mild_impairment', 'moderate_impairment', 'severe_impairment')),
  device_info JSONB, -- {"type": "tablet", "model": "iPad", "push_token": "..."}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE senior_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their linked seniors" ON senior_profiles FOR ALL USING (auth.uid() = family_id);

-- 3. Enhanced Medications with Voice Support
CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_id UUID REFERENCES senior_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  medication_type TEXT CHECK (medication_type IN ('tablet', 'capsule', 'liquid', 'syrup', 'injection', 'patch', 'inhaler', 'drops')) NOT NULL,
  dosage TEXT NOT NULL,
  food_timing TEXT CHECK (food_timing IN ('before_food', 'after_food', 'with_food', 'empty_stomach', 'anytime')) NOT NULL,
  frequency_per_day INTEGER NOT NULL,
  schedule_times TEXT[] NOT NULL,
  total_quantity INTEGER NOT NULL,
  current_quantity INTEGER NOT NULL,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  instructions TEXT,
  doctor_prescribed BOOLEAN DEFAULT false,
  prescription_date DATE,
  expiry_date DATE,
  side_effects TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage medications for their seniors" ON medications FOR ALL USING (
  EXISTS (SELECT 1 FROM senior_profiles sp WHERE sp.id = medications.senior_id AND sp.family_id = auth.uid())
);

-- 4. Voice Reminders (Custom family recordings)
CREATE TABLE voice_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  family_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_text TEXT NOT NULL, -- "Dad, did you take your lunch pill?"
  voice_url TEXT, -- URL to stored audio file
  voice_duration INTEGER, -- Duration in seconds
  language TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE voice_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their voice reminders" ON voice_reminders FOR ALL USING (auth.uid() = family_id);

-- 5. Symptom Reports (AI-processed voice input from seniors)
CREATE TABLE symptom_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_profile_id UUID REFERENCES senior_profiles(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES profiles(id), -- Who reported (senior or family)
  voice_input TEXT, -- Original voice transcription: "I'm not feeling well, my head hurts"
  voice_url TEXT, -- URL to original voice recording
  ai_processed_data JSONB, -- AI analysis: {"symptoms": ["headache"], "severity": "moderate", "urgency": "low"}
  symptoms TEXT[] NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'emergency')) NOT NULL,
  urgency_score INTEGER CHECK (urgency_score BETWEEN 1 AND 10),
  notes TEXT,
  is_emergency BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  family_notified BOOLEAN DEFAULT false,
  doctor_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE symptom_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access symptom reports for their seniors" ON symptom_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM senior_profiles sp WHERE sp.id = symptom_reports.senior_profile_id AND sp.family_id = auth.uid())
);

-- 6. Enhanced Medication Logs with Voice Confirmation
CREATE TABLE medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  senior_profile_id UUID REFERENCES senior_profiles(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE,
  verification_method TEXT CHECK (verification_method IN ('voice', 'camera', 'manual', 'reminder', 'auto')),
  voice_confirmation_url TEXT, -- "Yes, I took my pill"
  confidence_level DECIMAL(3,2), -- AI confidence in verification
  image_url TEXT, -- Photo verification
  voice_note_url TEXT, -- Additional voice notes
  status TEXT CHECK (status IN ('taken', 'missed', 'skipped', 'pending')) NOT NULL DEFAULT 'pending',
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  family_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access medication logs for their seniors" ON medication_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM senior_profiles sp WHERE sp.id = medication_logs.senior_profile_id AND sp.family_id = auth.uid())
);

-- 7. Emergency Alerts (Real-time notifications)
CREATE TABLE emergency_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_profile_id UUID REFERENCES senior_profiles(id) ON DELETE CASCADE,
  alert_type TEXT CHECK (alert_type IN ('symptom', 'medication_missed', 'fall_detection', 'panic_button', 'vitals_abnormal')) NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  voice_message_url TEXT, -- Original voice alert from senior
  ai_analysis JSONB, -- AI processing of the alert
  location_data JSONB, -- GPS coordinates if available
  vital_signs JSONB, -- Heart rate, blood pressure, etc.
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES profiles(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access alerts for their seniors" ON emergency_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM senior_profiles sp WHERE sp.id = emergency_alerts.senior_profile_id AND sp.family_id = auth.uid())
);

-- 8. AI Voice Processing Queue (For async processing)
CREATE TABLE voice_processing_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_profile_id UUID REFERENCES senior_profiles(id) ON DELETE CASCADE,
  voice_url TEXT NOT NULL,
  processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'completed', 'error')) DEFAULT 'pending',
  voice_text TEXT, -- Transcribed text
  ai_analysis JSONB, -- AI interpretation
  intent TEXT, -- 'symptom_report', 'medication_confirmation', 'emergency', etc.
  confidence_score DECIMAL(3,2),
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE voice_processing_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access voice processing for their seniors" ON voice_processing_queue FOR ALL USING (
  EXISTS (SELECT 1 FROM senior_profiles sp WHERE sp.id = voice_processing_queue.senior_profile_id AND sp.family_id = auth.uid())
);

-- 9. Real-time Notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  senior_profile_id UUID REFERENCES senior_profiles(id) ON DELETE CASCADE,
  notification_type TEXT CHECK (notification_type IN ('medication_reminder', 'symptom_alert', 'emergency', 'low_stock', 'appointment')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional data for the notification
  is_read BOOLEAN DEFAULT false,
  is_push_sent BOOLEAN DEFAULT false,
  is_email_sent BOOLEAN DEFAULT false,
  is_sms_sent BOOLEAN DEFAULT false,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_senior_profiles_family_id ON senior_profiles(family_id);
CREATE INDEX idx_medications_senior_id ON medications(senior_id);
CREATE INDEX idx_medication_logs_senior_profile_id ON medication_logs(senior_profile_id);
CREATE INDEX idx_symptom_reports_senior_profile_id ON symptom_reports(senior_profile_id);
CREATE INDEX idx_emergency_alerts_senior_profile_id ON emergency_alerts(senior_profile_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_voice_processing_queue_status ON voice_processing_queue(processing_status);

-- Insert health conditions data
INSERT INTO health_conditions (name, category) VALUES
('Diabetes', 'chronic'),
('High Blood Pressure', 'chronic'),
('Heart Disease', 'chronic'),
('Arthritis', 'chronic'),
('Asthma', 'chronic'),
('Depression', 'mental_health'),
('Anxiety', 'mental_health'),
('Osteoporosis', 'chronic'),
('Kidney Disease', 'chronic'),
('Alzheimer/Dementia', 'chronic'),
('Parkinson Disease', 'chronic'),
('COPD', 'chronic'),
('Stroke History', 'chronic'),
('High Cholesterol', 'chronic')
ON CONFLICT (name) DO NOTHING; 