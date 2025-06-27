'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { 
  Home, 
  Pill, 
  BarChart3, 
  Users, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import NotificationCenter from './NotificationCenter'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Medications', href: '/dashboard/medications', icon: Pill },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Seniors', href: '/dashboard/seniors', icon: Users },
  { name: 'Alerts', href: '/dashboard/alerts', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Error signing out')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        >
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 md:hidden">
        <div className="grid grid-cols-5 py-2">
          {[
            ...navigation.slice(0, 4), // Dashboard, Medications, Reports, Seniors
            navigation[5] // Settings (skip Alerts)
          ].map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center py-2 px-1 text-xs transition-colors',
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-600'
                )}
              >
                <item.icon className={cn('h-5 w-5 mb-1', isActive ? 'text-blue-600' : 'text-gray-400')} />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 hidden md:block',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-gray-900">MedAssist</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5',
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User profile section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <div className="bg-gray-300 rounded-full p-2 mr-3">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.full_name || user?.email}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {profile?.role || 'Family Caregiver'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="md:ml-64">
        {/* Mobile Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <NotificationCenter />
              
              <Link
                href="/dashboard/settings"
                className="relative p-2 text-gray-400 hover:text-gray-500 touch-target md:hidden"
              >
                <Settings className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content - Mobile optimized */}
        <main className="pb-20 md:pb-0 min-h-screen">
          <div className="px-4 py-6 max-w-md mx-auto md:max-w-none md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 