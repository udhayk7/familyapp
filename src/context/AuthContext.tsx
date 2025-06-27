'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, Profile, db } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  isDemo: boolean
  demoSignIn: (email: string, password: string) => Promise<void>
  forceDemo: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  // FORCE DATABASE MODE - NEVER USE DEMO MODE
  const [isDemo] = useState(false) // Permanently disabled

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      console.log('🔄 Initializing auth in DATABASE MODE ONLY...')
      
      // Get initial session
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      if (authError) {
        console.warn('⚠️ Auth error (but continuing in database mode):', authError)
      }

      console.log('✅ Database mode initialized - ready for real operations')

      if (session?.user) {
        console.log('👤 User authenticated - loading profile from database')
        setUser(session.user)
        await loadProfile(session.user.id)
      } else {
        console.log('❌ No authenticated user')
        setUser(null)
        setProfile(null)
        setLoading(false)
      }

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        // Skip INITIAL_SESSION events to prevent loops
        if (event === 'INITIAL_SESSION') {
          console.log('🔄 Skipping initial session event')
          return
        }
        
        console.log('🔄 Auth state changed:', event)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.warn('⚠️ Auth initialization error (but staying in database mode):', error)
      setLoading(false)
    }
  }

  const loadProfile = async (userId: string) => {
    console.log('🔄 Loading profile from database for user:', userId)
    
    try {
      console.log('📊 Attempting to load profile from profiles table...')
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.warn('⚠️ Profile load error:', profileError.message)
        
        if (profileError.code === 'PGRST116') {
          // No profile found - create one automatically
          console.log('📝 No profile found - creating automatically')
          
          const userData = await supabase.auth.getUser()
          const currentUser = userData.data.user
          
          const newProfile = {
            id: userId,
            email: currentUser?.email || 'unknown@example.com',
            full_name: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User',
            role: 'family' as const,
            onboarding_completed: true, // Set to true to avoid welcome loop
          }
          
          console.log('📝 Creating new profile:', newProfile)
          
          // Try to create the profile in the database
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single()
          
          if (createError) {
            console.warn('⚠️ Failed to create profile in database:', createError)
            // Use the profile anyway for the session
            setProfile({
              ...newProfile,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          } else {
            console.log('✅ Profile created successfully:', createdProfile)
            setProfile(createdProfile)
          }
        } else {
          // Other database error - create minimal profile but don't fail
          console.warn('⚠️ Database error, creating minimal profile:', profileError)
          const userData = await supabase.auth.getUser()
          const currentUser = userData.data.user
          
          const minimalProfile: Profile = {
            id: userId,
            email: currentUser?.email || 'error@example.com',
            full_name: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User',
            role: 'family',
            onboarding_completed: true, // Set to true to avoid welcome loop
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setProfile(minimalProfile)
        }
      } else {
        console.log('✅ Profile loaded successfully:', profileData)
        setProfile(profileData)
        
        // If user has completed onboarding, they should go directly to dashboard
        if (profileData.onboarding_completed) {
          console.log('✅ User has completed onboarding - ready for dashboard')
        } else {
          console.log('⚠️ User onboarding incomplete - will show onboarding flow')
        }
      }
    } catch (error) {
      console.warn('⚠️ Profile loading failed, creating fallback profile:', error)
      // Create fallback profile instead of switching to demo mode
      const userData = await supabase.auth.getUser()
      const currentUser = userData.data.user
      
      const fallbackProfile: Profile = {
        id: userId,
        email: currentUser?.email || 'fallback@example.com',
        full_name: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User',
        role: 'family',
        onboarding_completed: true, // Set to true to avoid welcome loop
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setProfile(fallbackProfile)
    } finally {
      setLoading(false)
    }
  }

  // Demo functions - disabled but kept for compatibility
  const demoSignIn = async (email: string, password: string) => {
    console.log('❌ Demo sign in disabled - database mode only')
    throw new Error('Demo mode is disabled')
  }

  const forceDemo = () => {
    console.log('❌ Force demo disabled - database mode only')
  }

  const refreshProfile = async () => {
    if (user && !loading) {
      await loadProfile(user.id)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
        isDemo, // Always false
        demoSignIn,
        forceDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 