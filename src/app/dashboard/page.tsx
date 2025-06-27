'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/DashboardLayout'
import SymptomMonitor from '@/components/SymptomMonitor'
import { useNotifications } from '@/hooks/useNotifications'
import { 
  Users, 
  Pill, 
  Activity, 
  Plus,
  ArrowRight,
  Heart,
  AlertCircle,
  TrendingUp,
  Shield,
  Clock,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalSeniors: number
  activeMedications: number
  todayCompliance: number
  activeDevices: number
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalSeniors: 0,
    activeMedications: 0,
    todayCompliance: 0,
    activeDevices: 0
  })
  const [loading, setLoading] = useState(true)
  const [showSymptomMonitor, setShowSymptomMonitor] = useState(false)
  const { requestNotificationPermission } = useNotifications()

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      requestNotificationPermission()
    }
  }, [user, requestNotificationPermission])

  const fetchDashboardData = async () => {
    try {
      const { data: seniorProfiles, error: seniorsError } = await supabase
        .from('senior_profiles')
        .select('*')
        .eq('family_id', user!.id)

      if (seniorsError) throw seniorsError

      let totalMedications = 0
      
      for (const senior of seniorProfiles || []) {
        try {
          const { data: medications } = await supabase
            .from('medications')
            .select('*')
            .eq('senior_id', senior.id)
          
          totalMedications += medications?.length || 0
        } catch (error) {
          console.warn(`Error fetching medications for ${senior.full_name}:`, error)
        }
      }
      
      setStats({
        totalSeniors: seniorProfiles?.length || 0,
        activeMedications: totalMedications,
        todayCompliance: 94,
        activeDevices: seniorProfiles?.length || 0
      })
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setStats({
        totalSeniors: 0,
        activeMedications: 0,
        todayCompliance: 0,
        activeDevices: 0
      })
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="relative">
            <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Clean empty state
  if (stats.totalSeniors === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 p-4">
          {/* Clean Welcome Header */}
          <div className="text-center pt-12 pb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-gray-600 text-base leading-relaxed px-4">
              Let's set up your family care dashboard
            </p>
          </div>

          {/* Getting Started Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 mx-2">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Users className="w-7 h-7 text-white" />
              </div>
              
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Add Your First Senior</h2>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Start monitoring health and medications for your loved ones
              </p>
              
              <Link 
                href="/dashboard/seniors"
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-medium text-sm shadow-sm hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Senior</span>
              </Link>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="space-y-3 mx-2">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Smart Medications</h3>
                  <p className="text-gray-600 text-xs">AI-powered reminders & tracking</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Health Monitoring</h3>
                  <p className="text-gray-600 text-xs">Voice alerts & emergency detection</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Family Coordination</h3>
                  <p className="text-gray-600 text-xs">Real-time notifications & updates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Clean dashboard with data
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Clean Mobile Header */}
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 mb-1">Good morning! 🌅</h1>
                <p className="text-gray-600 text-sm">Here's your family overview</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-blue-500" />
              </div>
            </div>

            {/* Clean Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-xl font-bold text-gray-900">{stats.totalSeniors}</span>
                </div>
                <p className="text-gray-600 text-xs font-medium">Seniors</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Pill className="w-4 h-4 text-gray-600" />
                  <span className="text-xl font-bold text-gray-900">{stats.activeMedications}</span>
                </div>
                <p className="text-gray-600 text-xs font-medium">Medications</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <span className="text-xl font-bold text-gray-900">{stats.todayCompliance}%</span>
                </div>
                <p className="text-gray-600 text-xs font-medium">Compliance</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-4 h-4 text-gray-600" />
                  <span className="text-xl font-bold text-gray-900">{stats.activeDevices}</span>
                </div>
                <p className="text-gray-600 text-xs font-medium">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Health Alert */}
          {stats.todayCompliance < 90 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-900 mb-1">Attention Needed</h3>
                  <p className="text-yellow-800 text-sm mb-3 leading-relaxed">
                    Medication compliance is below 90%. Check with your seniors.
                  </p>
                  <Link 
                    href="/dashboard/medications"
                    className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg font-medium text-sm inline-flex items-center space-x-1"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-3 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 px-2">Quick Actions</h2>
            
            <Link 
              href="/dashboard/medications"
              className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Pill className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Medications</h3>
                    <p className="text-gray-600 text-sm">Manage prescriptions</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>

            <Link 
              href="/dashboard/seniors"
              className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Seniors</h3>
                    <p className="text-gray-600 text-sm">Manage profiles</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>

            <button
              onClick={() => setShowSymptomMonitor(true)}
              className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Report Symptoms</h3>
                    <p className="text-gray-600 text-sm">Voice health monitoring</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-20">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Pill className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Medication taken</p>
                  <p className="text-gray-600 text-xs">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Health check completed</p>
                  <p className="text-gray-600 text-xs">4 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Symptom Monitor Modal */}
      {showSymptomMonitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Report Symptoms</h2>
                <button
                  onClick={() => setShowSymptomMonitor(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  ✕
                </button>
              </div>
              <SymptomMonitor seniorId="demo" seniorName="Demo Senior" />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
} 