'use client'

import { useState, useEffect } from 'react'
import { Heart, Pill, Wifi, WifiOff } from 'lucide-react'

interface LoadingScreenProps {
  onForceDemo?: () => void
}

export default function LoadingScreen({ onForceDemo }: LoadingScreenProps) {
  const [showForceButton, setShowForceButton] = useState(false)
  const [loadingText, setLoadingText] = useState('Connecting to Supabase...')

  useEffect(() => {
    const texts = [
      'Connecting to Supabase...',
      'Checking database tables...',
      'Initializing authentication...',
      'Setting up your session...'
    ]
    
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % texts.length
      setLoadingText(texts[index])
    }, 2000)

    // Show force demo button after 5 seconds
    const timeout = setTimeout(() => {
      setShowForceButton(true)
    }, 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center items-center space-x-2 mb-8">
          <div className="bg-blue-600 p-4 rounded-full animate-pulse">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div className="bg-green-600 p-4 rounded-full animate-pulse animation-delay-300">
            <Pill className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Smart Care Assistant
          </h1>
          <p className="text-gray-600">
            AI-powered medication management
          </p>
        </div>

        {/* Loading Animation */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          
          <p className="text-gray-600 animate-pulse">
            {loadingText}
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Wifi className="h-4 w-4" />
            <span className="text-sm">Establishing secure connection...</span>
          </div>
        </div>

        {/* Force Demo Button */}
        {showForceButton && onForceDemo && (
          <div className="space-y-3">
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 mb-3">
                Taking longer than expected?
              </p>
              <button
                onClick={onForceDemo}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <WifiOff className="h-4 w-4" />
                <span>Continue in Demo Mode</span>
              </button>
            </div>
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full bg-blue-600 animate-bounce`}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 