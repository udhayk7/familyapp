'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX, AlertCircle } from 'lucide-react'
import geminiVoiceService, { GeminiResponse, WAKE_WORDS } from '@/lib/geminiService'

interface VoiceAssistantProps {
  seniorId: string
  isActive: boolean
  onToggle: () => void
}

export default function VoiceAssistant({ seniorId, isActive, onToggle }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [lastResponse, setLastResponse] = useState<string>('')
  const [currentLanguage, setCurrentLanguage] = useState<string>('malayalam')
  const [isProcessing, setIsProcessing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected')
  const [conversationActive, setConversationActive] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const isListeningRef = useRef(false)
  const shouldRestartRef = useRef(false)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      synthRef.current = window.speechSynthesis
      
      const recognition = recognitionRef.current
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US' // Start with English, will switch dynamically
      
      recognition.onstart = () => {
        console.log('Speech recognition started')
        setConnectionStatus('connected')
        setIsListening(true)
        isListeningRef.current = true
      }
      
      recognition.onend = () => {
        console.log('Speech recognition ended')
        setIsListening(false)
        isListeningRef.current = false
        
        // Only restart if we should and component is still active
        if (shouldRestartRef.current && isActive) {
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldRestartRef.current && isActive && !isListeningRef.current) {
              console.log('Auto-restarting speech recognition')
              startListening()
            }
          }, 1500) // Increased delay to prevent rapid restarts
        } else {
          setConnectionStatus('disconnected')
        }
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setConnectionStatus('disconnected')
        setIsListening(false)
        isListeningRef.current = false
        
        // Handle specific error types
        if (event.error === 'aborted') {
          console.log('Recognition was aborted, not restarting immediately')
          return
        }
        
        // Only retry on certain errors and if still active
        if (isActive && shouldRestartRef.current && 
            !['not-allowed', 'service-not-allowed'].includes(event.error)) {
          setTimeout(() => {
            if (isActive && shouldRestartRef.current) {
              console.log('Retrying after error:', event.error)
              startListening()
            }
          }, 3000) // Longer delay for error recovery
        }
      }
      
      recognition.onresult = async (event) => {
        const lastResult = event.results[event.results.length - 1]
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript.trim()
          console.log('Recognized speech:', transcript)
          
          if (transcript.length > 2) {
            await handleSpeechInput(transcript)
          }
        }
      }
    }
    
    return () => {
      cleanupRecognition()
    }
  }, [isActive])

  // Cleanup function
  const cleanupRecognition = () => {
    shouldRestartRef.current = false
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.log('Recognition already stopped')
      }
    }
  }

  // Start listening for speech
  const startListening = () => {
    if (recognitionRef.current && !isListeningRef.current) {
      try {
        setConnectionStatus('connecting')
        shouldRestartRef.current = true // Enable auto-restart
        recognitionRef.current.start()
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        setConnectionStatus('disconnected')
      }
    }
  }

  // Stop listening
  const stopListening = () => {
    shouldRestartRef.current = false // Disable auto-restart
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }
    
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.log('Recognition already stopped')
      }
    }
    
    setConnectionStatus('disconnected')
    setIsListening(false)
    isListeningRef.current = false
  }

  // Handle speech input and generate response
  const handleSpeechInput = async (transcript: string) => {
    try {
      setIsProcessing(true)
      console.log('Processing transcript:', transcript)
      
      // Always process with Gemini service for intelligent responses
      const response: GeminiResponse = await geminiVoiceService.processVoiceInput(transcript, 'conversation')
      
      console.log('Gemini response:', response)
      
      // Update language if detected differently
      if (response.language !== currentLanguage) {
        setCurrentLanguage(response.language)
        updateRecognitionLanguage(response.language)
      }
      
      // Start conversation if it's a wake word
      if (response.intent === 'greeting' || geminiVoiceService.isWakeWord(transcript)) {
        setConversationActive(true)
        console.log('Conversation started via wake word or greeting')
      }
      
      // Handle emergency situations
      if (response.isEmergency) {
        console.log('Emergency detected:', response.emergencyLevel)
        await handleEmergency(response)
      }
      
      // Speak the response
      await speakResponse(response.response)
      setLastResponse(response.response)
      
      // Continue conversation based on Gemini's suggestion
      if (response.shouldContinueListening) {
        setConversationActive(true)
        shouldRestartRef.current = true
      } else {
        setConversationActive(false)
        shouldRestartRef.current = false
        console.log('Ending conversation as suggested by Gemini')
      }
      
    } catch (error) {
      console.error('Error processing speech input:', error)
      const errorMessage = currentLanguage === 'malayalam' ? 
        'ക്ഷമിക്കുക, എനിക്ക് മനസ്സിലായില്ല. ദയവായി വീണ്ടും പറയാമോ?' :
        'Sorry, I didn\'t understand. Could you please repeat?'
      
      await speakResponse(errorMessage)
      setLastResponse(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  // Update speech recognition language
  const updateRecognitionLanguage = (language: string) => {
    if (recognitionRef.current) {
      const langCodes = {
        malayalam: 'ml-IN',
        hindi: 'hi-IN', 
        tamil: 'ta-IN',
        english: 'en-US'
      }
      
      const newLang = langCodes[language as keyof typeof langCodes] || 'en-US'
      if (recognitionRef.current.lang !== newLang) {
        recognitionRef.current.lang = newLang
        console.log('Updated recognition language to:', newLang)
      }
    }
  }

  // Speak response using text-to-speech
  const speakResponse = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (synthRef.current && text) {
        // Stop any ongoing speech
        synthRef.current.cancel()
        
        const utterance = new SpeechSynthesisUtterance(text)
        
        // Set voice based on language
        const voices = synthRef.current.getVoices()
        const languageVoice = voices.find(voice => {
          if (currentLanguage === 'malayalam') return voice.lang.includes('ml') || voice.lang.includes('en-IN')
          if (currentLanguage === 'hindi') return voice.lang.includes('hi')
          if (currentLanguage === 'tamil') return voice.lang.includes('ta')
          return voice.lang.includes('en')
        })
        
        if (languageVoice) {
          utterance.voice = languageVoice
        }
        
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 0.8
        
        utterance.onend = () => resolve()
        utterance.onerror = () => resolve()
        
        synthRef.current.speak(utterance)
      } else {
        resolve()
      }
    })
  }

  // Handle emergency situations
  const handleEmergency = async (response: GeminiResponse) => {
    console.log(`Emergency Level: ${response.emergencyLevel}`)
    
    // For demo purposes, we'll just log the emergency
    // In production, this would trigger family notifications
    
    const emergencyMessages = {
      malayalam: 'അടിയന്തര സാഹചര്യം കണ്ടെത്തി. കുടുംബത്തെ അറിയിക്കുന്നു.',
      hindi: 'आपातकाल का पता चला। परिवार को सूचित कर रहे हैं।',
      tamil: 'அவசர நிலைமை கண்டறியப்பட்டது। குடும்பத்தினரை தெரிவிக்கும்।',
      english: 'Emergency detected. Notifying family members.'
    }
    
    const message = emergencyMessages[currentLanguage as keyof typeof emergencyMessages] || emergencyMessages.english
    
    // This would typically send notifications to family members
    console.log('EMERGENCY ALERT:', {
      seniorId,
      level: response.emergencyLevel,
      message: response.response,
      timestamp: new Date().toISOString()
    })
  }

  // Toggle voice assistant
  const handleToggle = () => {
    if (isActive) {
      stopListening()
      setConversationActive(false)
      geminiVoiceService.clearConversationHistory()
    } else {
      setConnectionStatus('connecting')
      startListening()
    }
    onToggle()
  }

  // Manual activation for testing
  const startConversation = () => {
    if (!isActive) {
      handleToggle()
    }
    setConversationActive(true)
    shouldRestartRef.current = true
    
    // Provide immediate feedback
    const greetings = {
      malayalam: 'ഹലോ! ഞാൻ നിങ്ങളുടെ സഹായിയാണ്. എന്തെങ്കിലും വേണമോ?',
      english: 'Hello! I\'m your assistant. How can I help you today?',
      hindi: 'नमस्ते! मैं आपका सहायक हूँ। कैसे मदद कर सकता हूँ?',
      tamil: 'வணக்கம்! நான் உங்கள் உதவியாளர். எப்படி உதவ முடியும்?'
    }
    
    const greeting = greetings[currentLanguage as keyof typeof greetings] || greetings.english
    speakResponse(greeting)
    setLastResponse(greeting)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Voice Assistant</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
          <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
        </div>
      </div>

      {/* Main Control Button */}
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={handleToggle}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
            isActive
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg transform scale-105'
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
          }`}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          ) : isActive ? (
            <MicOff size={32} />
          ) : (
            <Mic size={32} />
          )}
        </button>

        <div className="text-center">
          <p className="text-lg font-medium text-gray-800">
            {isActive ? 'Voice Assistant Active' : 'Voice Assistant Off'}
          </p>
          <p className="text-sm text-gray-600">
            {isActive ? 
              (conversationActive ? 'Ready to chat! Say anything...' : 'Say "സഹായം" or "Hey Google" to start') : 
              'Tap to activate'
            }
          </p>
        </div>
      </div>

      {/* Language Indicator */}
      <div className="mt-4 flex items-center justify-center space-x-2">
        <span className="text-sm text-gray-600">Language:</span>
        <span className="text-sm font-medium text-blue-600 capitalize">{currentLanguage}</span>
      </div>

      {/* Wake Words Help */}
      <div className="mt-4 bg-gray-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Wake Words:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>മലയാളം: "സഹായം"</div>
          <div>English: "Hey Google"</div>
          <div>हिंदी: "सहायक"</div>
          <div>தமிழ்: "உதவி"</div>
        </div>
      </div>

      {/* Last Response */}
      {lastResponse && (
        <div className="mt-4 bg-blue-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-700 mb-1">Last Response:</h4>
          <p className="text-sm text-blue-800">{lastResponse}</p>
        </div>
      )}

      {/* Quick Start Button */}
      <button
        onClick={startConversation}
        className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
        disabled={isProcessing}
      >
        {conversationActive ? 'Conversation Active' : 'Start Conversation'}
      </button>

      {/* Debug Info */}
      {debugMode && (
        <div className="mt-4 bg-gray-100 rounded-lg p-3 text-xs">
          <div>Listening: {isListening ? 'Yes' : 'No'}</div>
          <div>Processing: {isProcessing ? 'Yes' : 'No'}</div>
          <div>Conversation: {conversationActive ? 'Active' : 'Inactive'}</div>
          <div>Language: {currentLanguage}</div>
          <div>Should Restart: {shouldRestartRef.current ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  )
} 