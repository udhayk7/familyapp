'use client'

import { useState, useRef } from 'react'
import { Heart, Mic, MicOff, AlertTriangle, Phone, Clock, TrendingUp, Activity } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import toast from 'react-hot-toast'

interface SymptomMonitorProps {
  seniorId: string
  seniorName: string
  onEmergencyDetected?: (emergency: EmergencyAlert) => void
}

interface SymptomReport {
  id: string
  senior_id: string
  reported_by: string
  voice_input?: string
  voice_url?: string
  symptoms: string[]
  severity: 'low' | 'medium' | 'high' | 'emergency'
  urgency_score: number
  ai_analysis?: {
    detected_symptoms: string[]
    confidence: number
    risk_factors: string[]
    recommendations: string[]
  }
  vital_signs?: {
    heart_rate?: number
    blood_pressure?: string
    temperature?: number
    oxygen_saturation?: number
  }
  notes?: string
  is_emergency: boolean
  created_at: string
}

interface EmergencyAlert {
  type: 'symptom' | 'vital_signs' | 'voice_distress'
  severity: 'high' | 'critical'
  message: string
  symptoms: string[]
  recommended_actions: string[]
}

const COMMON_SYMPTOMS = [
  { name: 'Chest Pain', severity: 'high', keywords: ['chest', 'pain', 'heart', 'pressure'] },
  { name: 'Shortness of Breath', severity: 'high', keywords: ['breath', 'breathing', 'air', 'oxygen'] },
  { name: 'Dizziness', severity: 'medium', keywords: ['dizzy', 'lightheaded', 'spinning', 'balance'] },
  { name: 'Nausea', severity: 'medium', keywords: ['nausea', 'sick', 'stomach', 'vomit'] },
  { name: 'Headache', severity: 'low', keywords: ['head', 'headache', 'migraine', 'pain'] },
  { name: 'Fatigue', severity: 'low', keywords: ['tired', 'fatigue', 'exhausted', 'weak'] },
  { name: 'Confusion', severity: 'high', keywords: ['confused', 'memory', 'forget', 'disoriented'] },
  { name: 'Falls', severity: 'high', keywords: ['fell', 'fall', 'tripped', 'balance'] },
  { name: 'Fever', severity: 'medium', keywords: ['fever', 'hot', 'temperature', 'chills'] },
  { name: 'Severe Pain', severity: 'high', keywords: ['severe', 'intense', 'unbearable', 'agony'] }
]

export default function SymptomMonitor({ seniorId, seniorName, onEmergencyDetected }: SymptomMonitorProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceInput, setVoiceInput] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'emergency'>('low')
  const [notes, setNotes] = useState('')
  const [vitalSigns, setVitalSigns] = useState({
    heart_rate: '',
    blood_pressure: '',
    temperature: '',
    oxygen_saturation: ''
  })

  const { createNotification } = useNotifications()
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      const chunks: BlobPart[] = []
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        processVoiceInput(blob)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      toast.success('Recording symptoms...')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Could not access microphone')
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessing(true)
    try {
      // Simulate speech-to-text and AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock voice input examples
      const mockInputs = [
        "I'm feeling dizzy and nauseous, and my chest feels tight",
        "My head is pounding and I feel very weak",
        "I can't catch my breath and my heart is racing",
        "I feel confused and can't remember things clearly",
        "I have severe stomach pain and feel like I might vomit",
        "I fell down earlier and now my back hurts a lot"
      ]

      const selectedInput = mockInputs[Math.floor(Math.random() * mockInputs.length)]
      setVoiceInput(selectedInput)

      // Analyze symptoms from voice input
      const detectedSymptoms = analyzeSymptoms(selectedInput)
      setSelectedSymptoms(detectedSymptoms.symptoms)
      setSeverity(detectedSymptoms.severity)

      // Check for emergency conditions
      if (detectedSymptoms.severity === 'emergency' || detectedSymptoms.emergency) {
        handleEmergencyDetection(detectedSymptoms.symptoms, selectedInput)
      }

    } catch (error) {
      console.error('Error processing voice input:', error)
      toast.error('Failed to process voice input')
    } finally {
      setIsProcessing(false)
    }
  }

  const analyzeSymptoms = (input: string) => {
    const lowerInput = input.toLowerCase()
    const detectedSymptoms: string[] = []
    let maxSeverity: 'low' | 'medium' | 'high' | 'emergency' = 'low'
    let isEmergency = false

    COMMON_SYMPTOMS.forEach(symptom => {
      const found = symptom.keywords.some(keyword => lowerInput.includes(keyword))
      if (found) {
        detectedSymptoms.push(symptom.name)
        
        // Update severity based on highest found
        if (symptom.severity === 'high' && ['low', 'medium'].includes(maxSeverity)) {
          maxSeverity = 'high'
        } else if (symptom.severity === 'medium' && maxSeverity === 'low') {
          maxSeverity = 'medium'
        }
      }
    })

    // Emergency detection rules
    const emergencyKeywords = ['severe', 'cant breathe', 'chest pain', 'heart attack', 'stroke', 'fall', 'emergency']
    if (emergencyKeywords.some(keyword => lowerInput.includes(keyword))) {
      maxSeverity = 'emergency'
      isEmergency = true
    }

    // Multiple severe symptoms
    const severeSymptoms = detectedSymptoms.filter(s => 
      COMMON_SYMPTOMS.find(cs => cs.name === s)?.severity === 'high'
    )
    if (severeSymptoms.length >= 2) {
      maxSeverity = 'emergency'
      isEmergency = true
    }

    return {
      symptoms: detectedSymptoms,
      severity: maxSeverity,
      emergency: isEmergency
    }
  }

  const handleEmergencyDetection = (symptoms: string[], voiceInput: string) => {
    const emergencyAlert: EmergencyAlert = {
      type: 'symptom',
      severity: 'critical',
      message: `${seniorName} is experiencing concerning symptoms that may require immediate attention`,
      symptoms,
      recommended_actions: [
        'Contact emergency services if symptoms are severe',
        'Call the primary care physician',
        'Monitor vital signs closely',
        'Stay with the senior until help arrives'
      ]
    }

    // Create emergency notification
    createNotification({
      senior_profile_id: seniorId,
      notification_type: 'emergency',
      title: '🚨 Emergency Alert',
      message: `${seniorName}: ${symptoms.join(', ')} - Immediate attention may be required`,
      severity: 'emergency',
      is_actionable: true,
      action_url: '/dashboard/alerts',
      metadata: { symptoms, voice_input: voiceInput }
    })

    onEmergencyDetected?.(emergencyAlert)
    toast.error('Emergency detected! Family members have been notified.', { duration: 8000 })
  }

  const handleSymptomSubmit = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom')
      return
    }

    try {
      const symptomReport: SymptomReport = {
        id: `symptom-${Date.now()}`,
        senior_id: seniorId,
        reported_by: 'family', // or could be 'senior' if they self-report
        voice_input: voiceInput,
        symptoms: selectedSymptoms,
        severity,
        urgency_score: severity === 'emergency' ? 10 : severity === 'high' ? 8 : severity === 'medium' ? 5 : 2,
        vital_signs: {
          heart_rate: vitalSigns.heart_rate ? parseInt(vitalSigns.heart_rate) : undefined,
          blood_pressure: vitalSigns.blood_pressure || undefined,
          temperature: vitalSigns.temperature ? parseFloat(vitalSigns.temperature) : undefined,
          oxygen_saturation: vitalSigns.oxygen_saturation ? parseInt(vitalSigns.oxygen_saturation) : undefined
        },
        notes,
        is_emergency: severity === 'emergency',
        created_at: new Date().toISOString()
      }

      // Create notification for symptom report
      createNotification({
        senior_profile_id: seniorId,
        notification_type: 'symptom_alert',
        title: 'Symptom Report',
        message: `${seniorName} reported: ${selectedSymptoms.join(', ')}`,
        severity,
        is_actionable: true,
        action_url: '/dashboard/alerts'
      })

      toast.success('Symptom report submitted successfully')
      
      // Reset form
      setVoiceInput('')
      setSelectedSymptoms([])
      setSeverity('low')
      setNotes('')
      setVitalSigns({ heart_rate: '', blood_pressure: '', temperature: '', oxygen_saturation: '' })

    } catch (error) {
      console.error('Error submitting symptom report:', error)
      toast.error('Failed to submit symptom report')
    }
  }

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'emergency': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <Heart className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Symptom Monitor</h3>
            <p className="text-sm text-gray-600">Report symptoms for {seniorName}</p>
          </div>
        </div>
        
        {severity === 'emergency' && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Emergency Detected</span>
          </div>
        )}
      </div>

      {/* Voice Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Voice Symptom Report
        </label>
        
        <div className="flex items-center space-x-4 mb-4">
          {!isRecording ? (
            <button
              onClick={startVoiceRecording}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors"
            >
              <Mic className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={stopVoiceRecording}
              className="bg-red-500 text-white p-3 rounded-full animate-pulse"
            >
              <MicOff className="h-5 w-5" />
            </button>
          )}
          
          <div className="text-sm text-gray-600">
            {isRecording ? 'Recording symptoms...' : 'Click to record symptoms'}
          </div>
        </div>

        {isProcessing && (
          <div className="flex items-center space-x-2 text-blue-600 mb-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm">Analyzing voice input...</span>
          </div>
        )}

        {voiceInput && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-700 font-medium mb-2">Detected Speech:</p>
            <p className="text-sm text-gray-600">{voiceInput}</p>
          </div>
        )}
      </div>

      {/* Symptoms Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Reported Symptoms
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COMMON_SYMPTOMS.map((symptom) => (
            <button
              key={symptom.name}
              onClick={() => {
                setSelectedSymptoms(prev => 
                  prev.includes(symptom.name) 
                    ? prev.filter(s => s !== symptom.name)
                    : [...prev, symptom.name]
                )
              }}
              className={`p-3 text-sm rounded-lg border transition-all ${
                selectedSymptoms.includes(symptom.name)
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {symptom.name}
            </button>
          ))}
        </div>
      </div>

      {/* Severity Assessment */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Severity Level
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(['low', 'medium', 'high', 'emergency'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSeverity(level)}
              className={`p-3 text-sm rounded-lg border transition-all ${
                severity === level
                  ? getSeverityColor(level)
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Vital Signs */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Vital Signs (Optional)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Heart Rate (bpm)</label>
            <input
              type="number"
              value={vitalSigns.heart_rate}
              onChange={(e) => setVitalSigns(prev => ({ ...prev, heart_rate: e.target.value }))}
              placeholder="72"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Blood Pressure</label>
            <input
              type="text"
              value={vitalSigns.blood_pressure}
              onChange={(e) => setVitalSigns(prev => ({ ...prev, blood_pressure: e.target.value }))}
              placeholder="120/80"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Temperature (°F)</label>
            <input
              type="number"
              value={vitalSigns.temperature}
              onChange={(e) => setVitalSigns(prev => ({ ...prev, temperature: e.target.value }))}
              placeholder="98.6"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Oxygen Sat (%)</label>
            <input
              type="number"
              value={vitalSigns.oxygen_saturation}
              onChange={(e) => setVitalSigns(prev => ({ ...prev, oxygen_saturation: e.target.value }))}
              placeholder="98"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Additional Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional observations or context..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {selectedSymptoms.length > 0 && (
            <span>
              {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        
        <button
          onClick={handleSymptomSubmit}
          disabled={selectedSymptoms.length === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            severity === 'emergency'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300'
          }`}
        >
          {severity === 'emergency' ? '🚨 Submit Emergency Report' : 'Submit Symptom Report'}
        </button>
      </div>
    </div>
  )
} 