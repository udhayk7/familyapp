'use client'

import { useState, useEffect } from 'react'
import { Pill, Clock, CheckCircle, XCircle, Volume2 } from 'lucide-react'
import geminiVoiceService from '@/lib/geminiService'

interface MedicationReminderProps {
  seniorId: string
}

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  taken_today: boolean
}

export default function MedicationReminder({ seniorId }: MedicationReminderProps) {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Blood Pressure Medicine',
      dosage: '10mg',
      frequency: 'Twice daily',
      times: ['08:00', '20:00'],
      taken_today: false
    },
    {
      id: '2', 
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Once daily',
      times: ['09:00'],
      taken_today: false
    }
  ])
  
  const [currentLanguage, setCurrentLanguage] = useState<string>('malayalam')
  const [activeReminder, setActiveReminder] = useState<string | null>(null)
  const [reminderAttempts, setReminderAttempts] = useState<{ [key: string]: number }>({})

  const checkForReminders = () => {
    const now = new Date()
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
    
    medications.forEach(medication => {
      if (!medication.taken_today) {
        medication.times.forEach(time => {
          // Check if it's time for this medication (within 5 minutes)
          const [hours, minutes] = time.split(':').map(Number)
          const medicationTime = new Date()
          medicationTime.setHours(hours, minutes, 0, 0)
          
          const timeDiff = Math.abs(now.getTime() - medicationTime.getTime())
          const fiveMinutes = 5 * 60 * 1000
          
          if (timeDiff <= fiveMinutes && !activeReminder) {
            triggerMedicationReminder(medication)
          }
        })
      }
    })
  }

  useEffect(() => {
    // Check for reminders every minute
    const interval = setInterval(checkForReminders, 60000)
    
    // Check immediately on component mount
    checkForReminders()
    
    return () => clearInterval(interval)
  }, [medications, activeReminder])

  const triggerMedicationReminder = async (medication: Medication) => {
    setActiveReminder(medication.id)
    
    try {
      const reminder = await geminiVoiceService.generateMedicationReminder(
        medication.name,
        currentLanguage
      )
      
      // Speak the reminder
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(reminder)
        
        const languageMap: { [key: string]: string } = {
          malayalam: 'hi-IN',
          hindi: 'hi-IN',
          tamil: 'ta-IN', 
          english: 'en-US'
        }
        
        utterance.lang = languageMap[currentLanguage] || 'en-US'
        utterance.rate = 0.8
        utterance.volume = 1.0
        
        window.speechSynthesis.speak(utterance)
      }
      
      // Track attempts
      const attempts = reminderAttempts[medication.id] || 0
      setReminderAttempts(prev => ({
        ...prev,
        [medication.id]: attempts + 1
      }))
      
      // If this is the 3rd attempt, notify family
      if (attempts >= 2) {
        console.log(`Medication reminder failed after 3 attempts for ${medication.name}`)
        // In a real app, this would notify family members
      }
      
    } catch (error) {
      console.error('Failed to generate medication reminder:', error)
    }
  }

  const markMedicationTaken = (medicationId: string) => {
    setMedications(prev => prev.map(med => 
      med.id === medicationId ? { ...med, taken_today: true } : med
    ))
    setActiveReminder(null)
    setReminderAttempts(prev => ({
      ...prev,
      [medicationId]: 0
    }))
    
    // Voice confirmation
    const confirmationMessage = currentLanguage === 'malayalam' ? 'മരുന്ന് കഴിച്ചു എന്ന് രേഖപ്പെടുത്തി' :
                               currentLanguage === 'hindi' ? 'दवा ली गई, रिकॉर्ड कर दिया' :
                               currentLanguage === 'tamil' ? 'মরুন্ন् சাপ्पিট्টু എন्রु রেকর্ড সেয়েন্' :
                               'Medication taken and recorded'
    
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(confirmationMessage)
      window.speechSynthesis.speak(utterance)
    }
  }

  const skipMedication = (medicationId: string) => {
    setActiveReminder(null)
    setReminderAttempts(prev => ({
      ...prev,
      [medicationId]: 0
    }))
    
    console.log(`Medication ${medicationId} skipped by user`)
    // In a real app, this might notify family if medication is frequently skipped
  }

  const toggleLanguage = () => {
    const languages = ['malayalam', 'english', 'hindi', 'tamil']
    const currentIndex = languages.indexOf(currentLanguage)
    const nextIndex = (currentIndex + 1) % languages.length
    setCurrentLanguage(languages[nextIndex])
  }

  const activeMedication = medications.find(med => med.id === activeReminder)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Pill className="mr-2 text-green-500" size={24} />
          Medication Reminders
        </h3>
        
        <button
          onClick={toggleLanguage}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          {currentLanguage.charAt(0).toUpperCase() + currentLanguage.slice(1)}
        </button>
      </div>

      {/* Active Reminder */}
      {activeMedication && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-yellow-800 flex items-center">
              <Clock className="mr-2" size={20} />
              Time for Your Medicine!
            </h4>
            <div className="flex items-center">
              <Volume2 className="text-yellow-600 mr-1" size={16} />
              <span className="text-sm text-yellow-600">
                Attempt {reminderAttempts[activeMedication.id] || 1}/3
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-yellow-800 font-medium">{activeMedication.name}</p>
            <p className="text-yellow-700">{activeMedication.dosage} - {activeMedication.frequency}</p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => markMedicationTaken(activeMedication.id)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <CheckCircle className="mr-2" size={20} />
              {currentLanguage === 'malayalam' ? 'കഴിച്ചു' :
               currentLanguage === 'hindi' ? 'ली गई' :
               currentLanguage === 'tamil' ? 'साप्पিট्টেন्' :
               'Taken'}
            </button>
            
            <button
              onClick={() => skipMedication(activeMedication.id)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <XCircle className="mr-2" size={20} />
              {currentLanguage === 'malayalam' ? 'പിന്നെ' :
               currentLanguage === 'hindi' ? 'बाद में' :
               currentLanguage === 'tamil' ? 'পিন্নাল্' :
               'Later'}
            </button>
          </div>
        </div>
      )}

      {/* Medication List */}
      <div className="space-y-3">
        {medications.map(medication => (
          <div
            key={medication.id}
            className={`border rounded-lg p-4 ${
              medication.taken_today
                ? 'border-green-200 bg-green-50'
                : medication.id === activeReminder
                ? 'border-yellow-300 bg-yellow-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">{medication.name}</h4>
                <p className="text-sm text-gray-600">{medication.dosage} - {medication.frequency}</p>
                <p className="text-xs text-gray-500">Times: {medication.times.join(', ')}</p>
              </div>
              
              <div className="text-right">
                {medication.taken_today ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle size={20} className="mr-1" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <Clock size={20} className="mr-1" />
                    <span className="text-sm">Pending</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Voice Commands:</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Malayalam:</strong> "കഴിച്ചു" (taken), "വേണ്ട" (skip)</p>
          <p><strong>English:</strong> "taken", "skip" or "later"</p>
          <p><strong>Hindi:</strong> "लिया" (taken), "छोड़ें" (skip)</p>
          <p><strong>Tamil:</strong> "எடுத்தேந்" (taken), "வேந்தாம்" (skip)</p>
        </div>
      </div>
    </div>
  )
} 