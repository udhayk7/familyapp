'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import DemoAuth from '@/components/DemoAuth'
import { Heart, Pill } from 'lucide-react'

export default function AuthPage() {
  const { user, isDemo } = useAuth()
  const router = useRouter()
  const [showDemo, setShowDemo] = useState(false)

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    // Check if we should show demo mode after a short delay
    const timer = setTimeout(() => {
      setShowDemo(isDemo)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [isDemo])



  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (showDemo) {
    return <DemoAuth />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div className="bg-green-600 p-3 rounded-full">
              <Pill className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Smart Care Assistant</h2>
          <p className="mt-2 text-sm text-gray-600">
            AI-powered medication management for seniors
          </p>
        </div>

        {/* Supabase Auth UI */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
            }}
            providers={[]}
            redirectTo={typeof window !== 'undefined' ? window.location.origin : ''}
            onlyThirdPartyProviders={false}
          />
          
          <div className="text-center mt-4 text-xs text-gray-500">
            Family caregiver portal only.
          </div>
        </div>

        {/* Feature Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            What you'll get access to:
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Senior Health Monitoring</p>
                <p className="text-xs text-gray-600">Track medications, health conditions, and compliance</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Pill className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">CareLoop Health Management</p>
                <p className="text-xs text-gray-600">Automated reminders and dosage tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading indicator for demo fallback */}
        {!showDemo && isDemo && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Checking connection...</p>
          </div>
        )}
      </div>
    </div>
  )
} 