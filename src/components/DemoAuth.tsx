'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Pill, User, ArrowRight } from 'lucide-react'

export default function DemoAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      // Since demo mode is disabled, redirect to normal auth
      router.push('/auth')
    } catch (error) {
      console.error('Demo login failed:', error)
    } finally {
      setLoading(false)
    }
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
            Demo Mode - Explore the features without registration
          </p>
        </div>

        {/* Demo Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="bg-yellow-100 p-2 rounded-full flex-shrink-0">
              <User className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-yellow-800">Demo Mode Active</h3>
              <p className="text-xs text-yellow-700 mt-1">
                Database connection unavailable. You can explore the app with sample data.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Login */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Try the Demo</h3>
            <p className="text-sm text-gray-600 mt-2">
              Experience all features with sample family data
            </p>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
                             <>
                 <span>Go to Authentication</span>
                 <ArrowRight className="h-5 w-5" />
               </>
             )}
           </button>

           <div className="text-center mt-4 text-xs text-gray-500">
             Redirects to login/signup page
           </div>
        </div>

        {/* Feature Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Demo Features Available:
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Multi-Senior Dashboard</p>
                <p className="text-xs text-gray-600">View health status for multiple seniors</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Pill className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Voice Reminders</p>
                <p className="text-xs text-gray-600">Record personalized medication reminders</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Symptom Monitoring</p>
                <p className="text-xs text-gray-600">AI-powered health tracking and alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 