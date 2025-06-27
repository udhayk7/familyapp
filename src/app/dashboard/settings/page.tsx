'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase, db } from '@/lib/supabase'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  User, 
  Mail, 
  Phone, 
  Save, 
  Edit2, 
  Shield,
  Bell,
  Smartphone,
  Settings as SettingsIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  
  console.log('🔧 Settings page loaded:', { user: !!user, profile: !!profile, editing })
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    relationship: '',
    age: ''
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        relationship: profile.relationship || '',
        age: profile.age?.toString() || ''
      })
    }
  }, [profile])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      console.log('💾 Saving profile updates:', formData)

      const updates = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        relationship: formData.relationship,
        age: formData.age ? parseInt(formData.age) : undefined
      }

      const updatedProfile = await db.updateProfile(user.id, updates)
      
      if (updatedProfile) {
        console.log('✅ Profile updated successfully')
        toast.success('Profile updated successfully!')
        await refreshProfile()
        setEditing(false)
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error: any) {
      console.error('❌ Error updating profile:', error)
      toast.error(`Failed to update profile: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form to original values
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        relationship: profile.relationship || '',
        age: profile.age?.toString() || ''
      })
    }
    setEditing(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <SettingsIcon className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Profile Settings Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-600" />
                Profile Information
              </h2>
              {!editing ? (
                <button
                  onClick={() => {
                    console.log('🎯 Edit Profile button clicked!')
                    setEditing(true)
                  }}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {formData.full_name || 'Not set'}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    {formData.email || 'Not set'}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 000-0000"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    {formData.phone || 'Not set'}
                  </div>
                )}
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship to Seniors
                </label>
                {editing ? (
                  <select
                    value={formData.relationship}
                    onChange={(e) => handleInputChange('relationship', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select relationship</option>
                    <option value="caretaker">Caretaker</option>
                    <option value="family_member">Family Member</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="parent">Parent</option>
                    <option value="friend">Friend</option>
                    <option value="nurse">Nurse</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {formData.relationship || 'Not set'}
                  </div>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                {editing ? (
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {formData.age || 'Not set'}
                  </div>
                )}
              </div>

              {/* Role (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-gray-500" />
                  {profile?.role === 'family' ? 'Family Caregiver' : profile?.role || 'User'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-gray-600" />
            Account Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">User ID:</span>
              <span className="text-gray-900 font-mono text-xs">{user?.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Account Created:</span>
              <span className="text-gray-900">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Last Updated:</span>
              <span className="text-gray-900">
                {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Onboarding Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                profile?.onboarding_completed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profile?.onboarding_completed ? 'Completed' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Notification Preferences (Future Enhancement) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-gray-600" />
            Notification Preferences
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                  <p className="text-xs text-gray-500">Get notified about medication reminders</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                  <p className="text-xs text-gray-500">Get daily summary reports via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 