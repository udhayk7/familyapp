# Supabase Database Setup (Enhanced Schema)

## 🎯 Current Status
**Implementing Real Database**: Setting up comprehensive user onboarding with real Supabase integration!

## 📊 Enhanced Database Schema

### 1. Enhanced Profiles Table
```sql
-- Create enhanced profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT CHECK (role IN ('senior', 'family', 'doctor')) NOT NULL DEFAULT 'family',
  full_name TEXT NOT NULL,
  age INTEGER,
  relationship TEXT, -- 'caretaker', 'family_member', 'spouse', 'child', etc.
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 2. Senior Profiles Table (Linked Seniors)
```sql
-- Create senior_profiles table for detailed senior information
CREATE TABLE senior_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  health_conditions TEXT[], -- Array of health conditions
  other_health_condition TEXT, -- For custom health conditions
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE senior_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their linked seniors" ON senior_profiles
  FOR ALL USING (auth.uid() = family_id);
```

### 3. Enhanced Medications Table
```sql
-- Create predefined_medications lookup table
CREATE TABLE predefined_medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('tablet', 'capsule', 'liquid', 'syrup', 'injection', 'patch', 'inhaler', 'drops')) NOT NULL,
  common_dosages TEXT[] -- Array of common dosages like ['5mg', '10mg', '20mg']
);

-- Insert common medications
INSERT INTO predefined_medications (name, type, common_dosages) VALUES
('Aspirin', 'tablet', ARRAY['75mg', '100mg', '325mg']),
('Paracetamol', 'tablet', ARRAY['500mg', '650mg', '1000mg']),
('Ibuprofen', 'tablet', ARRAY['200mg', '400mg', '600mg']),
('Metformin', 'tablet', ARRAY['500mg', '850mg', '1000mg']),
('Lisinopril', 'tablet', ARRAY['5mg', '10mg', '20mg']),
('Amlodipine', 'tablet', ARRAY['2.5mg', '5mg', '10mg']),
('Atorvastatin', 'tablet', ARRAY['10mg', '20mg', '40mg', '80mg']),
('Omeprazole', 'capsule', ARRAY['20mg', '40mg']),
('Cough Syrup', 'syrup', ARRAY['5ml', '10ml', '15ml']),
('Vitamin D', 'tablet', ARRAY['1000IU', '2000IU', '5000IU']),
('Calcium', 'tablet', ARRAY['500mg', '600mg', '1200mg']),
('Iron Supplement', 'tablet', ARRAY['18mg', '25mg', '65mg']),
('Blood Pressure Medicine', 'tablet', ARRAY['5mg', '10mg', '25mg']),
('Diabetes Medicine', 'tablet', ARRAY['250mg', '500mg', '1000mg']),
('Heart Medicine', 'tablet', ARRAY['25mg', '50mg', '100mg']),
('Thyroid Medicine', 'tablet', ARRAY['25mcg', '50mcg', '100mcg']),
('Antibiotic', 'tablet', ARRAY['250mg', '500mg', '750mg']),
('Pain Relief Syrup', 'syrup', ARRAY['5ml', '10ml']),
('Eye Drops', 'drops', ARRAY['1 drop', '2 drops']),
('Ear Drops', 'drops', ARRAY['2-3 drops']);

-- Create enhanced medications table
CREATE TABLE medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_id UUID REFERENCES senior_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  medication_type TEXT CHECK (medication_type IN ('tablet', 'capsule', 'liquid', 'syrup', 'injection', 'patch', 'inhaler', 'drops')) NOT NULL,
  dosage TEXT NOT NULL,
  food_timing TEXT CHECK (food_timing IN ('before_food', 'after_food', 'with_food', 'empty_stomach', 'anytime')) NOT NULL,
  frequency_per_day INTEGER NOT NULL, -- How many times per day
  schedule_times TEXT[] NOT NULL, -- Specific times like ['08:00', '14:00', '20:00']
  total_quantity INTEGER NOT NULL, -- Total pills/doses available
  current_quantity INTEGER NOT NULL, -- Current remaining quantity
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
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
```

### 4. User Links Table (Updated)
```sql
-- Create user_links table for family-senior connections
CREATE TABLE user_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  senior_profile_id UUID REFERENCES senior_profiles(id) ON DELETE CASCADE,
  link_code TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'inactive')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_links ENABLE ROW LEVEL SECURITY;
```

### 5. Health Conditions Lookup Table
```sql
-- Create health_conditions lookup table
CREATE TABLE health_conditions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT, -- 'chronic', 'acute', 'mental_health', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common health conditions
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
('Liver Disease', 'chronic'),
('Thyroid Disorder', 'chronic'),
('COPD', 'chronic'),
('Stroke History', 'chronic'),
('Cancer', 'chronic'),
('Alzheimer/Dementia', 'chronic'),
('Parkinson Disease', 'chronic'),
('High Cholesterol', 'chronic'),
('Obesity', 'chronic'),
('Sleep Apnea', 'chronic'),
('Acid Reflux/GERD', 'chronic');
```

### 6. Medication Logs Table (Updated)
```sql
-- Create medication_logs table
CREATE TABLE medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  senior_profile_id UUID REFERENCES senior_profiles(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE,
  verification_method TEXT CHECK (verification_method IN ('voice', 'camera', 'manual', 'reminder')),
  confidence_level DECIMAL(3,2),
  image_url TEXT,
  voice_note TEXT,
  status TEXT CHECK (status IN ('taken', 'missed', 'skipped', 'pending')) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
```

### 7. Symptom Reports Table (Updated)
```sql
-- Create symptom_reports table
CREATE TABLE symptom_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_profile_id UUID REFERENCES senior_profiles(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES profiles(id),
  symptoms TEXT[] NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'emergency')) NOT NULL,
  notes TEXT,
  voice_note TEXT,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE symptom_reports ENABLE ROW LEVEL SECURITY;
```

### 8. Messages Table (Updated)
```sql
-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  senior_profile_id UUID REFERENCES senior_profiles(id),
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'voice', 'image')) DEFAULT 'text',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

## 🔧 Setup Instructions

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Open your project**: `irzhvspbqqsonfmvyqil`
3. **Go to SQL Editor**
4. **Run the above SQL commands** in order
5. **Enable Authentication**: Make sure Email auth is enabled
6. **Update Environment Variables**: Ensure your API keys are correct

## 🎯 New Features

✅ **Enhanced User Profiles** with age and relationship
✅ **Separate Senior Profiles** for detailed health info
✅ **Predefined Medications** (20+ common medicines)
✅ **Health Conditions Lookup** (20+ common conditions)
✅ **Detailed Medication Tracking** with quantity management
✅ **Comprehensive Onboarding Flow**
✅ **Real Database Integration**

---

**Ready for production use! 🚀** 