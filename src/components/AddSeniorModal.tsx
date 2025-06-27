'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { X, User, Heart, Phone, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface AddSeniorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const healthConditions = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Arthritis',
  'Osteoporosis',
  'COPD',
  'Alzheimer\'s',
  'Depression',
  'Anxiety',
  'Chronic Pain',
  'High Cholesterol',
  'Kidney Disease',
  'Thyroid Issues',
  'Cancer',
  'Stroke History'
]

export default function AddSeniorModal({ isOpen, onClose, onSuccess }: AddSeniorModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    emergency_contact: '',
    health_conditions: [] as string[],
    other_health_condition: ''
  })

  const resetForm = () => {
    setFormData({
      full_name: '',
      age: '',
      emergency_contact: '',
      health_conditions: [],
      other_health_condition: ''
    })
  }

  const handleHealthConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        health_conditions: [...prev.health_conditions, condition]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        health_conditions: prev.health_conditions.filter(c => c !== condition)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      const seniorData = {
        family_id: user.id,
        full_name: formData.full_name,
        age: parseInt(formData.age),
        emergency_contact: formData.emergency_contact,
        health_conditions: formData.health_conditions,
        other_health_condition: formData.other_health_condition || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('senior_profiles')
        .insert(seniorData)

      if (error) {
        throw error
      }

      toast.success('Senior profile added successfully!')
      onSuccess()
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error adding senior:', error)
      toast.error('Failed to add senior profile')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Add Senior Profile</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter age"
                min="1"
                max="120"
                required
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact
              </label>
              <input
                type="tel"
                value={formData.emergency_contact}
                onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            {/* Health Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Health Conditions
              </label>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {healthConditions.map((condition) => (
                  <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.health_conditions.includes(condition)}
                      onChange={(e) => handleHealthConditionChange(condition, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Other Health Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Health Condition
              </label>
              <input
                type="text"
                value={formData.other_health_condition}
                onChange={(e) => setFormData(prev => ({ ...prev, other_health_condition: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter any other health conditions"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Senior'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 