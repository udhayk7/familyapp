'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase, Medication } from '@/lib/supabase'
import DashboardLayout from '@/components/DashboardLayout'
import AddMedicationModal from '@/components/AddMedicationModal'
import EnhancedVoiceRecorder, { VoiceRecording } from '@/components/EnhancedVoiceRecorder'
import { 
  Pill, 
  Plus, 
  Edit2, 
  Trash2, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  Mic,
  Volume2
} from 'lucide-react'
import { formatTime, isLowStock } from '@/lib/utils'
import toast from 'react-hot-toast'

interface MedicationWithSenior extends Medication {
  senior_name?: string
  dose?: string
  schedule_time?: string[]
  quantity_remaining?: number
}

export default function MedicationsPage() {
  const { user } = useAuth()
  const [medications, setMedications] = useState<MedicationWithSenior[]>([])
  const [seniors, setSeniors] = useState<{id: string, full_name: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSenior, setSelectedSenior] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<any>(null)
  const [voiceReminders, setVoiceReminders] = useState<{[key: string]: VoiceRecording}>({})

  useEffect(() => {
    if (user) {
      fetchMedications()
    }
  }, [user])

  const fetchMedications = async () => {
    try {
      console.log('🔄 Fetching medications...')
      
      // Fetch real data from database
      const { data: seniorProfiles, error: seniorsError } = await supabase
        .from('senior_profiles')
        .select('*')
        .eq('family_id', user!.id)

      if (seniorsError) {
        throw seniorsError
      }

      console.log('👥 Found senior profiles:', seniorProfiles)
      
      // Set seniors for the dropdown filter
      setSeniors((seniorProfiles || []).map((s: any) => ({ id: s.id, full_name: s.full_name })))
      
      let allMedications: MedicationWithSenior[] = []
      
      // Get medications for each senior
      for (const senior of seniorProfiles || []) {
        try {
          const { data: medications, error: medsError } = await supabase
            .from('medications')
            .select('*')
            .eq('senior_id', senior.id)
            .order('created_at', { ascending: false })

          if (medsError) {
            throw medsError
          }
          console.log(`💊 Found ${medications.length} medications for ${senior.full_name}`)
          
                     // Add senior name to each medication
           const medicationsWithSenior: MedicationWithSenior[] = medications.map((med: Medication) => ({
             ...med,
             senior_name: senior.full_name,
             dose: med.dosage, // Map dosage to dose for compatibility
             schedule_time: med.schedule_times,
             quantity_remaining: med.current_quantity,
             low_stock_threshold: med.low_stock_threshold || 10
           }))
          
          allMedications = [...allMedications, ...medicationsWithSenior]
        } catch (error) {
          console.warn(`Error fetching medications for ${senior.full_name}:`, error)
        }
      }
      
      console.log('💊 Total medications loaded:', allMedications.length)
      setMedications(allMedications)
      setLoading(false)
    } catch (error) {
      console.error('❌ Error fetching medications:', error)
      toast.error('Failed to load medications')
      setLoading(false)
    }
  }

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medication.senior_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSenior = selectedSenior === 'all' || medication.senior_id === selectedSenior
    return matchesSearch && matchesSenior
  })

  const handleModalSuccess = () => {
    // Refresh the medications list after adding a new one
    fetchMedications()
  }

  const handleDeleteMedication = async (medicationId: string) => {
    if (confirm('Are you sure you want to delete this medication?')) {
      try {
        // In real app, delete from Supabase
        setMedications(prev => prev.filter(med => med.id !== medicationId))
        toast.success('Medication deleted successfully')
      } catch (error) {
        console.error('Error deleting medication:', error)
        toast.error('Failed to delete medication')
      }
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
            <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
            <p className="text-gray-600">Manage medication schedules and monitor stock levels</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Medication
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search medications or seniors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedSenior}
                onChange={(e) => setSelectedSenior(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Seniors</option>
                {seniors.map((senior) => (
                  <option key={senior.id} value={senior.id}>
                    {senior.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Medications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedications.map((medication) => (
            <div key={medication.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Pill className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                    <p className="text-sm text-gray-600">{medication.dose}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isLowStock(medication.quantity_remaining || 0, medication.low_stock_threshold || 10) && (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div className="relative">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Senior</p>
                  <p className="text-sm text-gray-600">{medication.senior_name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Schedule</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {medication.schedule_time?.map((time: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(time)}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Stock Level</p>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          isLowStock(medication.quantity_remaining || 0, medication.low_stock_threshold || 10)
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(((medication.quantity_remaining || 0) / ((medication.low_stock_threshold || 10) * 2)) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {medication.quantity_remaining || 0} pills
                    </span>
                  </div>
                </div>

                {medication.instructions && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Instructions</p>
                    <p className="text-sm text-gray-600">{medication.instructions}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDeleteMedication(medication.id)}
                  className="inline-flex items-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredMedications.length === 0 && (
          <div className="text-center py-12">
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medications found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedSenior !== 'all' 
                ? 'No medications match your current filters.' 
                : 'Get started by adding your first medication.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Medication
            </button>
          </div>
        )}
      </div>

      {/* Add Medication Modal */}
      <AddMedicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
      />
    </DashboardLayout>
  )
} 