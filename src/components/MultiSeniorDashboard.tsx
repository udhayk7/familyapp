'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { db, SeniorProfile } from '@/lib/supabase'
import { 
  Users, 
  Plus, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Heart,
  Pill,
  Phone,
  MessageCircle,
  Calendar,
  MoreHorizontal,
  ChevronRight,
  Battery,
  Wifi,
  MapPin
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface EnhancedSeniorProfile extends SeniorProfile {
  health_status: 'excellent' | 'good' | 'concerning' | 'critical'
  last_activity: string
  medication_adherence: number
  recent_alerts: number
  device_status: 'online' | 'offline' | 'low_battery'
  location_status: 'home' | 'away' | 'unknown'
  upcoming_medications: number
  family_members: number
  emergency_contacts: {
    primary: string
    secondary?: string
  }
}

interface HealthMetric {
  type: 'medication' | 'symptom' | 'activity' | 'vitals'
  status: 'good' | 'warning' | 'alert'
  message: string
  timestamp: string
}

export default function MultiSeniorDashboard() {
  const { user } = useAuth()
  const [seniors, setSeniors] = useState<EnhancedSeniorProfile[]>([])
  const [selectedSenior, setSelectedSenior] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (user) {
      fetchSeniorProfiles()
    }
  }, [user])

  const fetchSeniorProfiles = async () => {
    try {
      setLoading(true)
      
      // Get basic senior profiles
      const basicProfiles = await db.getSeniorProfiles(user!.id)
      
      // Enhance with mock health data for demo
      const enhancedProfiles: EnhancedSeniorProfile[] = basicProfiles.map((profile, index) => ({
        ...profile,
        health_status: ['excellent', 'good', 'concerning', 'critical'][index % 4] as any,
        last_activity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        medication_adherence: Math.floor(Math.random() * 20) + 80, // 80-100%
        recent_alerts: Math.floor(Math.random() * 5),
        device_status: ['online', 'offline', 'low_battery'][Math.floor(Math.random() * 3)] as any,
        location_status: ['home', 'away', 'unknown'][Math.floor(Math.random() * 3)] as any,
        upcoming_medications: Math.floor(Math.random() * 4) + 1,
        family_members: Math.floor(Math.random() * 3) + 2,
        emergency_contacts: {
          primary: '+1 (555) 123-4567',
          secondary: Math.random() > 0.5 ? '+1 (555) 987-6543' : undefined
        }
      }))

      setSeniors(enhancedProfiles)
      if (enhancedProfiles.length > 0 && !selectedSenior) {
        setSelectedSenior(enhancedProfiles[0].id)
      }
    } catch (error) {
      console.error('Error fetching senior profiles:', error)
      toast.error('Failed to load senior profiles')
    } finally {
      setLoading(false)
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'concerning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDeviceStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-600" />
      case 'low_battery':
        return <Battery className="h-4 w-4 text-yellow-600" />
      case 'offline':
        return <Wifi className="h-4 w-4 text-gray-400" />
      default:
        return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getLocationIcon = (status: string) => {
    switch (status) {
      case 'home':
        return <MapPin className="h-4 w-4 text-green-600" />
      case 'away':
        return <MapPin className="h-4 w-4 text-blue-600" />
      default:
        return <MapPin className="h-4 w-4 text-gray-400" />
    }
  }

  const selectedSeniorData = seniors.find(s => s.id === selectedSenior)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Family Dashboard</h1>
          <p className="text-gray-600">Monitor all your senior family members in one place</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              List
            </button>
          </div>
          
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add Senior
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Seniors</p>
              <p className="text-2xl font-bold text-gray-900">{seniors.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Devices</p>
              <p className="text-2xl font-bold text-gray-900">
                {seniors.filter(s => s.device_status === 'online').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {seniors.reduce((sum, s) => sum + s.recent_alerts, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Health Concerns</p>
              <p className="text-2xl font-bold text-gray-900">
                {seniors.filter(s => ['concerning', 'critical'].includes(s.health_status)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seniors Overview */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {seniors.map((senior) => (
            <div
              key={senior.id}
              className={`bg-white rounded-xl shadow-sm border transition-all cursor-pointer ${
                selectedSenior === senior.id ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedSenior(senior.id)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        {senior.full_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{senior.full_name}</h3>
                      <p className="text-sm text-gray-600">Age {senior.age}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getDeviceStatusIcon(senior.device_status)}
                    {getLocationIcon(senior.location_status)}
                  </div>
                </div>

                {/* Health Status */}
                <div className="mb-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    getHealthStatusColor(senior.health_status)
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      senior.health_status === 'excellent' ? 'bg-green-500' :
                      senior.health_status === 'good' ? 'bg-blue-500' :
                      senior.health_status === 'concerning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    {senior.health_status.charAt(0).toUpperCase() + senior.health_status.slice(1)}
                  </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{senior.medication_adherence}%</div>
                    <div className="text-xs text-gray-600">Medication Adherence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{senior.upcoming_medications}</div>
                    <div className="text-xs text-gray-600">Upcoming Doses</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="text-sm text-gray-600 mb-4">
                  Last activity: {formatRelativeTime(senior.last_activity)}
                </div>

                {/* Alerts */}
                {senior.recent_alerts > 0 && (
                  <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-700">
                        {senior.recent_alerts} recent alert{senior.recent_alerts !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-yellow-600" />
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <Calendar className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Senior Profiles</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {seniors.map((senior) => (
              <div
                key={senior.id}
                className={`p-6 cursor-pointer transition-all ${
                  selectedSenior === senior.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSenior(senior.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {senior.full_name.charAt(0)}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900">{senior.full_name}</h4>
                      <p className="text-sm text-gray-600">Age {senior.age} • {senior.health_status}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{senior.medication_adherence}%</div>
                      <div className="text-gray-600">Adherence</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{senior.recent_alerts}</div>
                      <div className="text-gray-600">Alerts</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getDeviceStatusIcon(senior.device_status)}
                      {getLocationIcon(senior.location_status)}
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Senior Details */}
      {selectedSeniorData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedSeniorData.full_name} - Detailed View
            </h3>
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                getHealthStatusColor(selectedSeniorData.health_status)
              }`}>
                {selectedSeniorData.health_status.charAt(0).toUpperCase() + selectedSeniorData.health_status.slice(1)}
              </span>
              
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                View Full Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Health Metrics */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Health Metrics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Medication Adherence</span>
                  <span className="text-sm font-medium text-gray-900">{selectedSeniorData.medication_adherence}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recent Alerts</span>
                  <span className="text-sm font-medium text-gray-900">{selectedSeniorData.recent_alerts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Upcoming Medications</span>
                  <span className="text-sm font-medium text-gray-900">{selectedSeniorData.upcoming_medications}</span>
                </div>
              </div>
            </div>

            {/* Device Status */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Device & Location</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Device Status</span>
                  <div className="flex items-center space-x-1">
                    {getDeviceStatusIcon(selectedSeniorData.device_status)}
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {selectedSeniorData.device_status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Location</span>
                  <div className="flex items-center space-x-1">
                    {getLocationIcon(selectedSeniorData.location_status)}
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {selectedSeniorData.location_status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Activity</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatRelativeTime(selectedSeniorData.last_activity)}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Emergency Contacts</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Primary</div>
                  <div className="text-sm font-medium text-gray-900">{selectedSeniorData.emergency_contacts.primary}</div>
                </div>
                {selectedSeniorData.emergency_contacts.secondary && (
                  <div>
                    <div className="text-sm text-gray-600">Secondary</div>
                    <div className="text-sm font-medium text-gray-900">{selectedSeniorData.emergency_contacts.secondary}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-600">Family Members</div>
                  <div className="text-sm font-medium text-gray-900">{selectedSeniorData.family_members} connected</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 