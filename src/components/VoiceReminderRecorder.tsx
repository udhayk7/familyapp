'use client'

import { useState, useRef } from 'react'
import { Mic, MicOff, Play, Pause, Save, Trash2 } from 'lucide-react'

interface VoiceReminderRecorderProps {
  medicationName: string
  onSave: (audioBlob: Blob, transcription: string) => void
  onCancel: () => void
}

export default function VoiceReminderRecorder({ 
  medicationName, 
  onSave, 
  onCancel 
}: VoiceReminderRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcription, setTranscription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Auto-transcribe (placeholder - would use real speech-to-text)
        transcribeAudio(blob)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (blob: Blob) => {
    setIsProcessing(true)
    try {
      // Placeholder for real speech-to-text API
      // In real implementation, you'd use:
      // - Google Speech-to-Text API
      // - Azure Speech Services
      // - AWS Transcribe
      // - Web Speech API (if supported)
      
      // For now, set a placeholder transcription
      const placeholder = `Dad, it's time to take your ${medicationName}. Don't forget!`
      setTranscription(placeholder)
    } catch (error) {
      console.error('Transcription error:', error)
      setTranscription('Transcription not available')
    } finally {
      setIsProcessing(false)
    }
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleSave = () => {
    if (audioBlob && transcription) {
      onSave(audioBlob, transcription)
    }
  }

  const clearRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setTranscription('')
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.src = ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Record Voice Reminder
        </h3>
        
        <p className="text-gray-600 mb-6">
          Record a personalized reminder for <strong>{medicationName}</strong>
        </p>

        {/* Recording Controls */}
        <div className="flex justify-center mb-6">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={audioBlob !== null}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white p-4 rounded-full transition-colors"
            >
              <Mic className="h-8 w-8" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-red-600 text-white p-4 rounded-full animate-pulse"
            >
              <MicOff className="h-8 w-8" />
            </button>
          )}
        </div>

        {isRecording && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Recording...</span>
            </div>
          </div>
        )}

        {/* Playback Controls */}
        {audioUrl && (
          <div className="mb-6">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            <div className="flex items-center justify-center space-x-4 bg-gray-50 p-4 rounded-xl">
              {!isPlaying ? (
                <button
                  onClick={playRecording}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full"
                >
                  <Play className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={pauseRecording}
                  className="bg-blue-600 text-white p-3 rounded-full"
                >
                  <Pause className="h-5 w-5" />
                </button>
              )}
              
              <button
                onClick={clearRecording}
                className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-full"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Transcription */}
        {isProcessing && (
          <div className="mb-4 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>Processing audio...</span>
            </div>
          </div>
        )}

        {transcription && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transcription (editable):
            </label>
            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Edit the transcription if needed..."
            />
            <p className="text-xs text-gray-500 mt-1">
              You can edit the text to match what you said exactly
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={!audioBlob || !transcription || isProcessing}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Reminder</span>
          </button>
        </div>

        {/* Tips */}
        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700">
            <strong>Tips:</strong> Speak clearly and mention the medication name. 
            Example: "Dad, it's time for your lunch diabetes pill!"
          </p>
        </div>
      </div>
    </div>
  )
} 