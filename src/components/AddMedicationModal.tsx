'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { X, Pill, Clock, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface AddMedicationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const medicationTypes = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'liquid', label: 'Liquid' },
  { value: 'syrup', label: 'Syrup' },
  { value: 'injection', label: 'Injection' },
  { value: 'patch', label: 'Patch' },
  { value: 'inhaler', label: 'Inhaler' },
  { value: 'drops', label: 'Drops' }
]

const foodTimings = [
  { value: 'before_food', label: 'Before Food' },
  { value: 'after_food', label: 'After Food' },
  { value: 'with_food', label: 'With Food' },
  { value: 'empty_stomach', label: 'Empty Stomach' },
  { value: 'anytime', label: 'Anytime' }
]

export default function AddMedicationModal({ isOpen, onClose, onSuccess }: AddMedicationModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [seniors, setSeniors] = useState<{id: string, full_name: string}[]>([])
  const [formData, setFormData] = useState({
    senior_id: '',
    name: '',
    medication_type: 'tablet',
    dosage: '',
    food_timing: 'anytime',
    frequency_per_day: 1,
    schedule_times: [''],
    total_quantity: 30,
    current_quantity: 30,
    low_stock_threshold: 10,
    instructions: ''
  })

  useEffect(() => {
    if (isOpen && user) {
      fetchSeniors()
    }
  }, [isOpen, user])

  const fetchSeniors = async () => {
    try {
      const { data, error } = await supabase
        .from('senior_profiles')
        .select('id, full_name')
        .eq('family_id', user!.id)

      if (error) {
        console.error('Error fetching seniors:', error)
        return
      }

      setSeniors(data || [])
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, senior_id: data[0].id }))
      }
    } catch (error) {
      console.error('Error fetching seniors:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('medications')
        .insert({
          senior_id: formData.senior_id,
          name: formData.name,
          dosage: formData.dosage,
          instructions: formData.instructions,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        throw error
      }

      toast.success('Medication added successfully!')
      onSuccess()
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error adding medication:', error)
      toast.error('Failed to add medication')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      senior_id: '',
      name: '',
      medication_type: 'tablet',
      dosage: '',
      food_timing: 'anytime',
      frequency_per_day: 1,
      schedule_times: [''],
      total_quantity: 30,
      current_quantity: 30,
      low_stock_threshold: 10,
      instructions: ''
    })
  }

  const updateScheduleTimes = (frequency: number) => {
    const times = Array(frequency).fill('').map((_, index) => {
      const hour = 8 + (index * Math.floor(12 / frequency))
      return `${hour.toString().padStart(2, '0')}:00`
    })
    setFormData(prev => ({ ...prev, schedule_times: times }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Pill className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Medication</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Senior Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senior
              </label>
              <select
                value={formData.senior_id}
                onChange={(e) => setFormData(prev => ({ ...prev, senior_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a senior</option>
                {seniors.map((senior) => (
                  <option key={senior.id} value={senior.id}>
                    {senior.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Medication Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medication Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter medication name"
                required
              />
            </div>

            {/* Dosage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosage
              </label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 10mg, 1 tablet, 5ml"
                required
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions (Optional)
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Special instructions for taking this medication"
                rows={3}
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
                {loading ? 'Adding...' : 'Add Medication'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 