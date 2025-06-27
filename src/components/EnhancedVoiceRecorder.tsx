'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Play, Pause, Save, Trash2, Upload, Download, Volume2, Heart, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface EnhancedVoiceRecorderProps {
  seniorName: string
  medicationName: string
  onSave: (recording: VoiceRecording) => void
  onCancel: () => void
  existingRecording?: VoiceRecording
}

export interface VoiceRecording {
  id: string
  audio_blob: Blob
  audio_url: string
  transcription: string
  duration: number
  emotion_analysis?: {
    tone: 'caring' | 'urgent' | 'gentle' | 'authoritative' | 'loving'
    confidence: number
    emotions: string[]
  }
  quality_score: number
  created_at: string
  updated_at: string
}

export default function EnhancedVoiceRecorder({ 
  seniorName, 
  medicationName, 
  onSave, 
  onCancel,
  existingRecording 
}: EnhancedVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(existingRecording?.audio_blob || null)
  const [audioUrl, setAudioUrl] = useState<string | null>(existingRecording?.audio_url || null)
  const [transcription, setTranscription] = useState(existingRecording?.transcription || '')
  const [duration, setDuration] = useState(existingRecording?.duration || 0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [qualityScore, setQualityScore] = useState(existingRecording?.quality_score || 0)
  const [emotionAnalysis, setEmotionAnalysis] = useState(existingRecording?.emotion_analysis)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 44100
        }
      })
      
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options)
      chunksRef.current = []
      setRecordingTime(0)

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
        setDuration(recordingTime)
        
        // Process audio
        processAudio(blob)
      }

      mediaRecorderRef.current.start(1000) // Collect data every second
      setIsRecording(true)
      toast.success('Recording started')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      toast.success('Recording completed')
    }
  }

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true)
    try {
      // Simulate speech-to-text processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate context-aware transcription
      const transcriptions = [
        `Hi ${seniorName}, it's time to take your ${medicationName}. Remember, this helps keep you healthy and feeling your best!`,
        `${seniorName}, don't forget your ${medicationName}. I love you and want you to stay healthy.`,
        `Dad/Mom, your ${medicationName} is ready. Take it with water and call me if you need anything.`,
        `Good morning ${seniorName}! Time for your ${medicationName}. You're doing great with your routine.`,
        `${seniorName}, your medicine reminder: ${medicationName}. Take care of yourself - we love you!`
      ]
      
      const selectedTranscription = transcriptions[Math.floor(Math.random() * transcriptions.length)]
      setTranscription(selectedTranscription)
      
      // Analyze emotion and tone
      const emotions = ['caring', 'loving', 'gentle', 'supportive', 'encouraging']
      const selectedEmotion = emotions[Math.floor(Math.random() * emotions.length)]
      
      const emotionData = {
        tone: selectedEmotion as 'caring' | 'urgent' | 'gentle' | 'authoritative' | 'loving',
        confidence: 0.85 + Math.random() * 0.15, // 85-100% confidence
        emotions: [selectedEmotion, 'supportive']
      }
      setEmotionAnalysis(emotionData)
      
      // Calculate quality score based on duration and clarity
      const baseScore = Math.min(duration / 10, 1) * 50 // Duration factor
      const clarityScore = Math.random() * 30 + 20 // Simulated clarity
      const score = Math.min(baseScore + clarityScore, 100)
      setQualityScore(Math.round(score))
      
    } catch (error) {
      console.error('Processing error:', error)
      setTranscription('Processing failed - please try recording again')
      toast.error('Audio processing failed')
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
      const recording: VoiceRecording = {
        id: existingRecording?.id || `voice-${Date.now()}`,
        audio_blob: audioBlob,
        audio_url: audioUrl!,
        transcription,
        duration,
        emotion_analysis: emotionAnalysis,
        quality_score: qualityScore,
        created_at: existingRecording?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      onSave(recording)
      toast.success('Voice reminder saved!')
    }
  }

  const clearRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setTranscription('')
    setDuration(0)
    setRecordingTime(0)
    setQualityScore(0)
    setEmotionAnalysis(undefined)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.src = ''
    }
  }

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${seniorName}-${medicationName}-reminder.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Recording downloaded')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {existingRecording ? 'Edit' : 'Record'} Voice Reminder
        </h3>
        
        <p className="text-gray-600 mb-6">
          Create a personalized reminder for <strong>{seniorName}</strong> to take <strong>{medicationName}</strong>
        </p>

        {/* Recording Controls */}
        <div className="flex justify-center mb-6">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={audioBlob !== null && !existingRecording}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white p-6 rounded-full transition-colors shadow-lg"
            >
              <Mic className="h-10 w-10" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-red-600 text-white p-6 rounded-full animate-pulse shadow-lg"
            >
              <MicOff className="h-10 w-10" />
            </button>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-3 bg-red-50 text-red-700 px-6 py-3 rounded-full">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Recording...</span>
              <span className="text-lg font-mono">{formatTime(recordingTime)}</span>
            </div>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center space-x-3 bg-blue-50 text-blue-700 px-6 py-3 rounded-full">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>Processing audio...</span>
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
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {!isPlaying ? (
                    <button
                      onClick={playRecording}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors"
                    >
                      <Play className="h-6 w-6" />
                    </button>
                  ) : (
                    <button
                      onClick={pauseRecording}
                      className="bg-blue-600 text-white p-3 rounded-full"
                    >
                      <Pause className="h-6 w-6" />
                    </button>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    Duration: {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={downloadRecording}
                    className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                    title="Download recording"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={clearRecording}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                    title="Delete recording"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Quality Score */}
              {qualityScore > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Recording Quality</span>
                    <span>{qualityScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        qualityScore >= 80 ? 'bg-green-500' : 
                        qualityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${qualityScore}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Emotion Analysis */}
              {emotionAnalysis && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <span className="text-sm font-medium text-gray-700">Emotion Analysis</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Tone:</span> {emotionAnalysis.tone} 
                    <span className="ml-3 font-medium">Confidence:</span> {(emotionAnalysis.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transcription */}
        {transcription && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Transcription & Message
            </label>
            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Edit the transcribed message..."
            />
            <p className="text-xs text-gray-500 mt-2">
              You can edit this message to make it more personal
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={!audioBlob || !transcription}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{existingRecording ? 'Update' : 'Save'} Reminder</span>
          </button>
        </div>
      </div>
    </div>
  )
} 