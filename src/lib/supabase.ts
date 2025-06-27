import { createClient } from '@supabase/supabase-js'

// Supabase configuration - using correct API keys
const supabaseUrl = 'https://irzhvspbqqsonfmvyqil.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyemh2c3BicXFzb25mbXZ5cWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMjIyMzMsImV4cCI6MjA2NjU5ODIzM30.Zgl7LjrrgidawrDVG4YAAMR8q2YpKiwic5tIoczGOdk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    console.log('Supabase connection successful')
    return true
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return false
  }
}

// Enhanced Database Types
export interface Profile {
  id: string
  email: string
  phone?: string
  role: 'senior' | 'family' | 'doctor'
  full_name: string
  age?: number
  relationship?: string // 'caretaker', 'family_member', 'spouse', 'child', etc.
  avatar_url?: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface SeniorProfile {
  id: string
  family_id: string
  full_name: string
  age: number
  health_conditions: string[]
  other_health_condition?: string
  emergency_contact?: string
  created_at: string
  updated_at: string
}

export interface PredefinedMedication {
  id: string
  name: string
  type: 'tablet' | 'capsule' | 'liquid' | 'syrup' | 'injection' | 'patch' | 'inhaler' | 'drops'
  common_dosages: string[]
}

export interface Medication {
  id: string
  senior_id: string
  name: string
  medication_type: 'tablet' | 'capsule' | 'liquid' | 'syrup' | 'injection' | 'patch' | 'inhaler' | 'drops'
  dosage: string
  food_timing: 'before_food' | 'after_food' | 'with_food' | 'empty_stomach' | 'anytime'
  frequency_per_day: number
  schedule_times: string[]
  total_quantity: number
  current_quantity: number
  low_stock_threshold: number
  instructions?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HealthCondition {
  id: string
  name: string
  category: string
  created_at: string
}

export interface UserLink {
  id: string
  family_id: string
  senior_profile_id: string
  link_code: string
  status: 'pending' | 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface MedicationLog {
  id: string
  medication_id: string
  senior_profile_id: string
  scheduled_time: string
  taken_at?: string
  verification_method?: 'voice' | 'camera' | 'manual' | 'reminder'
  confidence_level?: number
  image_url?: string
  voice_note?: string
  status: 'taken' | 'missed' | 'skipped' | 'pending'
  notes?: string
  created_at: string
}

export interface SymptomReport {
  id: string
  senior_profile_id: string
  reported_by: string
  symptoms: string[]
  severity: 'low' | 'medium' | 'high' | 'emergency'
  notes?: string
  voice_note?: string
  is_resolved: boolean
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  senior_profile_id?: string
  content: string
  message_type: 'text' | 'voice' | 'image'
  is_read: boolean
  created_at: string
}

export interface Notification {
  id: string
  senior_id: string
  type: 'medication_reminder' | 'missed_medication' | 'voice_alert' | 'emergency'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  read: boolean
  created_at: string
}

export interface VoiceLog {
  id: string
  senior_id: string
  audio_url?: string
  transcript: string
  intent: string
  response: string
  emergency_detected: boolean
  created_at: string
}

// Database Operations with Demo Mode Fallback
export const db = {
  // Profile operations
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      // Test if we can access the profiles table
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (testError) {
        console.warn('🚫 Profiles table not accessible:', testError.message)
        throw new Error(`Database error: ${testError.message}`)
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found
          console.log('👤 No profile found for user:', userId)
          return null
        }
        console.warn('🚫 Error fetching profile:', error.message)
        throw error
      }

      return data
    } catch (error) {
      console.warn('🚫 Database connection failed in getProfile')
      throw error
    }
  },

  async createProfile(profile: Partial<Profile>): Promise<Profile | null> {
    try {
      console.log('📝 Creating profile:', profile)
      
      // First, check if profiles table exists and what columns it has
      try {
        const { data: tableCheck, error: tableError } = await supabase
          .from('profiles')
          .select('id')
          .limit(0)
        
        if (tableError) {
          console.error('❌ Profiles table issue:', tableError.message)
          if (tableError.message.includes('does not exist')) {
            throw new Error('Profiles table does not exist. Please run the database setup script.')
          }
        }
      } catch (tableCheckError) {
        console.error('❌ Table check failed:', tableCheckError)
        throw new Error('Database connection or table access failed')
      }
      
      // Create minimal profile data with only essential fields
      const minimalProfileData = {
        id: profile.id,
        full_name: profile.full_name || 'User',
        role: profile.role || 'family',
        onboarding_completed: profile.onboarding_completed || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Try to add email if provided
      if (profile.email) {
        (minimalProfileData as any).email = profile.email
      }
      
      console.log('📝 Attempting to create profile with minimal data:', minimalProfileData)
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(minimalProfileData)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating profile:', error.message, error)
        
        // If email column is missing, try without it
        if (error.message.includes("email") && error.message.includes("not found")) {
          console.log('🔄 Email column missing, trying without email...')
          const { email, ...profileWithoutEmail } = minimalProfileData as any
          
          const { data: dataWithoutEmail, error: errorWithoutEmail } = await supabase
            .from('profiles')
            .insert(profileWithoutEmail)
            .select()
            .single()
            
          if (errorWithoutEmail) {
            throw new Error(`Profile creation failed even without email: ${errorWithoutEmail.message}`)
          }
          
          console.log('✅ Profile created without email:', dataWithoutEmail)
          return dataWithoutEmail
        }
        
        throw new Error(`Profile creation failed: ${error.message}`)
      }
      
      console.log('✅ Profile created successfully:', data)
      return data
    } catch (error) {
      console.error('❌ Database error during profile creation:', error)
      throw error
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    try {
      console.log('🔄 Updating profile for user:', userId, 'with updates:', updates)
      
      // Filter out undefined values and fields that might not exist
      const safeUpdates: any = {
        updated_at: new Date().toISOString()
      }
      
      // Only include fields that are defined and not null
      if (updates.full_name !== undefined) safeUpdates.full_name = updates.full_name
      if (updates.email !== undefined) safeUpdates.email = updates.email
      if (updates.role !== undefined) safeUpdates.role = updates.role
      if (updates.onboarding_completed !== undefined) safeUpdates.onboarding_completed = updates.onboarding_completed
      
      // Try to include optional fields, but continue if they fail
      try {
        if (updates.age !== undefined) safeUpdates.age = updates.age
        if (updates.relationship !== undefined) safeUpdates.relationship = updates.relationship
        if (updates.phone !== undefined) safeUpdates.phone = updates.phone
        if (updates.avatar_url !== undefined) safeUpdates.avatar_url = updates.avatar_url
      } catch (fieldError) {
        console.warn('⚠️ Some optional fields not available:', fieldError)
      }
      
      console.log('🔄 Safe updates to apply:', safeUpdates)
      
      const { data, error } = await supabase
        .from('profiles')
        .update(safeUpdates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error updating profile:', error.message, error)
        
        // If it's a column not found error, try with just essential fields
        if (error.message.includes('column') && error.message.includes('not found')) {
          console.log('🔄 Column not found, trying with essential fields only...')
          const essentialUpdates = {
            full_name: updates.full_name,
            onboarding_completed: updates.onboarding_completed,
            updated_at: new Date().toISOString()
          }
          
          const { data: essentialData, error: essentialError } = await supabase
            .from('profiles')
            .update(essentialUpdates)
            .eq('id', userId)
            .select()
            .single()
            
          if (essentialError) {
            throw new Error(`Profile update failed even with essential fields: ${essentialError.message}`)
          }
          
          console.log('✅ Profile updated with essential fields:', essentialData)
          return essentialData
        }
        
        throw new Error(`Profile update failed: ${error.message}`)
      }
      
      console.log('✅ Profile updated successfully:', data)
      return data
    } catch (error) {
      console.error('❌ Database error during profile update:', error)
      throw error
    }
  },

  // Senior Profile operations
  async createSeniorProfile(seniorProfile: Omit<SeniorProfile, 'id' | 'created_at' | 'updated_at'>): Promise<SeniorProfile | null> {
    try {
      const { data, error } = await supabase
        .from('senior_profiles')
        .insert(seniorProfile)
        .select()
        .single()
      
      if (error) {
        console.error('Error creating senior profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Database error:', error)
      return null
    }
  },

  async getSeniorProfiles(familyId: string): Promise<SeniorProfile[]> {
    try {
      console.log('🔍 Fetching senior profiles for family:', familyId)
      
      const { data, error } = await supabase
        .from('senior_profiles')
        .select('*')
        .eq('family_id', familyId)
      
      if (error) {
        console.warn('🚫 Error fetching senior profiles:', error.message)
        throw new Error(`Failed to fetch senior profiles: ${error.message}`)
      }
      
      console.log('✅ Found senior profiles:', data?.length || 0)
      return data || []
    } catch (error) {
      console.warn('🚫 Database error fetching senior profiles')
      throw error
    }
  },

  // Medication operations
  async getPredefinedMedications(): Promise<PredefinedMedication[]> {
    try {
      const { data, error } = await supabase
        .from('predefined_medications')
        .select('*')
        .order('name')

      if (error) {
        console.warn('🚫 Error fetching predefined medications:', error.message)
        throw new Error(`Failed to fetch medications: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.warn('🚫 Database error fetching medications')
      throw error
    }
  },

  async createMedication(medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>): Promise<Medication | null> {
    try {
      const { data, error } = await supabase
        .from('medications')
        .insert(medication)
        .select()
        .single()

      if (error) {
        console.error('Error creating medication:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Database error:', error)
      return null
    }
  },

  async getMedications(seniorId: string): Promise<Medication[]> {
    try {
      console.log('💊 Fetching medications for senior:', seniorId)
      
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('senior_id', seniorId)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('🚫 Error fetching medications:', error.message)
        throw new Error(`Failed to fetch medications: ${error.message}`)
      }
      
      console.log(`✅ Found ${data?.length || 0} medications for senior ${seniorId}`)
      console.log('💊 Raw medication data:', data)
      
      // Map the simple table structure to the expected Medication interface
      const mappedMedications = (data || []).map((med: any) => ({
        id: med.id,
        senior_id: med.senior_id,
        name: med.name,
        medication_type: 'tablet' as const, // Default value since our simple table doesn't have this
        dosage: med.dosage,
        food_timing: 'anytime' as const, // Default value since our simple table doesn't have this
        frequency_per_day: med.frequency || 1,
        schedule_times: [], // Default empty array since our simple table doesn't have this
        total_quantity: 30, // Default value since our simple table doesn't have this
        current_quantity: 30, // Default value since our simple table doesn't have this
        low_stock_threshold: 10, // Default value since our simple table doesn't have this
        instructions: med.instructions,
        is_active: true, // Default to true since our simple table doesn't have this
        created_at: med.created_at,
        updated_at: med.updated_at
      }))
      
      console.log('💊 Mapped medications:', mappedMedications)
      return mappedMedications
    } catch (error) {
      console.warn('🚫 Database error fetching medications')
      throw error
    }
  },

  // Health Conditions
  async getHealthConditions(): Promise<HealthCondition[]> {
    try {
      const { data, error } = await supabase
        .from('health_conditions')
        .select('*')
        .order('name')

      if (error) {
        console.warn('🚫 Error fetching health conditions:', error.message)
        throw new Error(`Failed to fetch health conditions: ${error.message}`)
      }
      
      return data || []
    } catch (error) {
      console.warn('🚫 Database error fetching health conditions')
      throw error
    }
  },

  // User Links
  async createUserLink(link: Omit<UserLink, 'id' | 'created_at' | 'updated_at'>): Promise<UserLink | null> {
    try {
      const { data, error } = await supabase
        .from('user_links')
        .insert(link)
        .select()
        .single()
      
      if (error) {
        console.error('Error creating user link:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Database error:', error)
      return null
    }
  }
} 

// Additional standalone functions for backward compatibility
export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    return await db.getProfile(userId)
  } catch (error) {
    console.warn('🚫 getProfile function failed:', error)
    throw error
  }
}

// Simplified Senior App Database Operations
export const seniorDb = {
  async getMedications(seniorId: string): Promise<Medication[]> {
    return await db.getMedications(seniorId)
  },

  async logMedication(log: {
    medication_id: string
    senior_id: string
    scheduled_time: string
    taken_at?: string
    status: 'taken' | 'missed' | 'skipped' | 'pending'
    response_method: 'voice' | 'manual'
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('medication_logs')
        .insert({
          medication_id: log.medication_id,
          senior_profile_id: log.senior_id,
          scheduled_time: log.scheduled_time,
          taken_at: log.taken_at,
          status: log.status,
          verification_method: log.response_method,
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error logging medication:', error)
      } else {
        console.log('✅ Medication logged successfully')
      }
    } catch (error) {
      console.error('Database error logging medication:', error)
    }
  },

  async createNotification(notification: {
    senior_id: string
    type: 'medication_reminder' | 'missed_medication' | 'voice_alert' | 'emergency'
    title: string
    message: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    read: boolean
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          senior_id: notification.senior_id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          read: notification.read,
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error creating notification:', error)
      } else {
        console.log('✅ Notification created successfully')
      }
    } catch (error) {
      console.error('Database error creating notification:', error)
    }
  },

  async logVoiceInteraction(log: {
    senior_id: string
    transcript: string
    intent: string
    response: string
    emergency_detected: boolean
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('voice_logs')
        .insert({
          senior_id: log.senior_id,
          transcript: log.transcript,
          intent: log.intent,
          response: log.response,
          emergency_detected: log.emergency_detected,
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error logging voice interaction:', error)
      } else {
        console.log('✅ Voice interaction logged successfully')
      }
    } catch (error) {
      console.error('Database error logging voice interaction:', error)
    }
  }
}