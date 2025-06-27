'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase, UserLink, Profile, SeniorProfile } from '@/lib/supabase'
import DashboardLayout from '@/components/DashboardLayout'
import AddSeniorModal from '@/components/AddSeniorModal'
import { 
  Users, 
  Plus, 
  Clock, 
  AlertCircle,
  Heart,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface SeniorWithLink extends Profile {
  link_status: 'pending' | 'active' | 'inactive'
  link_code?: string
  linked_at?: string
  last_activity?: string
}

export default function SeniorsPage() {
  const { user } = useAuth()
  const [seniors, setSeniors] = useState<SeniorWithLink[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchLinkedSeniors()
    }
  }, [user])

  const fetchLinkedSeniors = async () => {
    try {
      console.log('🔄 Fetching senior profiles...')
      
      // Fetch real data from database
      const { data: seniorProfiles, error: seniorsError } = await supabase
        .from('senior_profiles')
        .select('*')
        .eq('family_id', user!.id)

      if (seniorsError) {
        throw seniorsError
      }

      console.log('👥 Found senior profiles:', seniorProfiles)
      
      // Convert to SeniorWithLink format
      const seniorsWithLink: SeniorWithLink[] = (seniorProfiles || []).map((senior: SeniorProfile) => ({
        id: senior.id,
        email: 'senior@example.com', // We don't have email in senior profiles
        phone: senior.emergency_contact || '+1 (555) 000-0000',
        role: 'senior' as const,
        full_name: senior.full_name,
        avatar_url: '',
        onboarding_completed: true, // Assume completed since they exist
        created_at: senior.created_at,
        updated_at: senior.updated_at,
        link_status: 'active' as const,
        linked_at: senior.created_at,
        last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // Mock recent activity
      }))
      
      setSeniors(seniorsWithLink)
      console.log('✅ Senior profiles loaded successfully')
      setLoading(false)
    } catch (error) {
      console.error('❌ Error fetching seniors:', error)
      toast.error('Failed to load senior profiles')
      setLoading(false)
    }
  }

  const handleAddSenior = () => {
    setShowAddModal(true)
  }

  const handleModalSuccess = () => {
    // Refresh the seniors list after adding a new one
    fetchLinkedSeniors()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
            Active
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1"></div>
            Inactive
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Senior Profiles</h1>
            <p className="text-gray-600">Manage senior family members and their health information</p>
          </div>
          <button
            onClick={handleAddSenior}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Senior
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Seniors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {seniors.filter(s => s.link_status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Links</p>
                <p className="text-2xl font-bold text-gray-900">
                  {seniors.filter(s => s.link_status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Monitored</p>
                <p className="text-2xl font-bold text-gray-900">{seniors.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seniors List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Senior Profiles</h3>
          </div>
          
          {seniors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No seniors added yet</h3>
              <p className="text-gray-600 mb-4">
                Add senior family members to start monitoring their health and medications.
              </p>
              <button
                onClick={handleAddSenior}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add First Senior
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {seniors.map((senior) => (
                <div key={senior.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 rounded-full p-3">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">
                            {senior.full_name}
                          </h4>
                          {getStatusBadge(senior.link_status)}
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                          {senior.email && (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {senior.email}
                            </div>
                          )}
                          {senior.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {senior.phone}
                            </div>
                          )}
                        </div>

                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            Linked {senior.linked_at ? formatRelativeTime(senior.linked_at) : 'recently'}
                          </span>
                          {senior.last_activity && (
                            <span>
                              Last activity {formatRelativeTime(senior.last_activity)}
                            </span>
                          )}
                        </div>


                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {senior.link_status === 'active' && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Connected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                How to Add a Senior
              </h3>
              <ol className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="font-semibold mr-2">1.</span>
                  Click "Add Senior" to open the profile form
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">2.</span>
                  Fill in their basic information and contact details
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">3.</span>
                  Add any medical notes or health conditions
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">4.</span>
                  Start monitoring their medication adherence and health status
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Add Senior Modal */}
      <AddSeniorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
      />
    </DashboardLayout>
  )
} 