// Advanced Gemini AI Service for Natural Conversations
// Temporarily using mock implementation to get app working

export interface GeminiResponse {
  response: string
  language: string
  isEmergency: boolean
  emergencyLevel: 'low' | 'medium' | 'high' | 'critical'
  intent: string
  confidence: number
  shouldContinueListening: boolean
  contextualResponse: boolean
}

// Advanced language detection
function detectLanguage(text: string): string {
  const malayalamPattern = /[\u0D00-\u0D7F]/
  const hindiPattern = /[\u0900-\u097F]/
  const tamilPattern = /[\u0B80-\u0BFF]/
  
  if (malayalamPattern.test(text)) return 'malayalam'
  if (hindiPattern.test(text)) return 'hindi'
  if (tamilPattern.test(text)) return 'tamil'
  
  // Check for common words
  const malayalamWords = ['സഹായം', 'അമ്മ', 'അച്ഛൻ', 'എന്താണ്', 'എങ്ങനെ', 'ഹലോ', 'ഹേ ഗൂഗിൾ']
  const hindiWords = ['मदद', 'माँ', 'पापा', 'क्या', 'कैसे', 'हैलो', 'हे गूगल']
  const tamilWords = ['உதவி', 'அம்மா', 'அப்பா', 'என்ன', 'எப்படி', 'ஹலோ', 'ஹே கூகிள்']
  const englishWords = ['hey google', 'hello', 'help', 'how', 'what', 'assistant']
  
  const lowerText = text.toLowerCase()
  
  if (malayalamWords.some(word => lowerText.includes(word.toLowerCase()))) return 'malayalam'
  if (hindiWords.some(word => lowerText.includes(word.toLowerCase()))) return 'hindi'
  if (tamilWords.some(word => lowerText.includes(word.toLowerCase()))) return 'tamil'
  if (englishWords.some(word => lowerText.includes(word.toLowerCase()))) return 'english'
  
  return 'english'
}

// Emergency detection
function analyzeEmergency(text: string, language: string): { isEmergency: boolean; level: 'low' | 'medium' | 'high' | 'critical' } {
  const emergencyKeywords = {
    malayalam: {
      critical: ['ഹൃദയം', 'നെഞ്ചുവേദന', 'ശ്വാസം കിട്ടുന്നില്ല'],
      high: ['വേദന', 'വയറുവേദന', 'തലവേദന', 'പനി'],
      medium: ['സഹായം', 'അസുഖം', 'ഭയം'],
      low: ['ക്ഷീണം', 'ദുഃഖം']
    },
    english: {
      critical: ['heart attack', 'chest pain', 'can\'t breathe', 'unconscious'],
      high: ['severe pain', 'bleeding', 'fell down', 'high fever'],
      medium: ['pain', 'sick', 'help', 'worried'],
      low: ['tired', 'sad', 'lonely']
    },
    hindi: {
      critical: ['दिल का दौरा', 'छाती में दर्द', 'सांस नहीं आ रही'],
      high: ['तेज दर्द', 'गिर गया', 'बुखार'],
      medium: ['दर्द', 'बीमार', 'मदद'],
      low: ['थका हुआ', 'उदास']
    },
    tamil: {
      critical: ['மாரடைப்பு', 'நெஞ்சு வலி', 'மூச்சு வரல'],
      high: ['கடுமையான வலி', 'விழுந்துட்டேன்', 'காய்ச்சல்'],
      medium: ['வலி', 'நோய்', 'உதவி'],
      low: ['சோர்வு', 'சந்தோஷமில்லை']
    }
  }
  
  const keywords = emergencyKeywords[language as keyof typeof emergencyKeywords] || emergencyKeywords.english
  const lowerText = text.toLowerCase()
  
  for (const [level, words] of Object.entries(keywords)) {
    if (words.some(word => lowerText.includes(word.toLowerCase()))) {
      return { 
        isEmergency: true, 
        level: level as 'low' | 'medium' | 'high' | 'critical' 
      }
    }
  }
  
  return { isEmergency: false, level: 'low' }
}

// Wake words
export const WAKE_WORDS = {
  malayalam: ['സഹായം', 'അസിസ്റ്റന്റ്', 'എന്നെ സഹായിക്കൂ', 'ഹലോ', 'ഹേ ഗൂഗിൾ'],
  english: ['hey google', 'assistant', 'help me', 'hello'],
  hindi: ['सहायक', 'मदद करो', 'नमस्ते', 'हैलो', 'हे गूगल'],
  tamil: ['உதவி', 'என்னை உதவி செய்', 'வணக்கம்', 'ஹலோ', 'ஹே கூகிள்']
}

// Medication terms
export const MEDICATION_TERMS = {
  taken: {
    malayalam: ['കഴിച്ചു', 'എടുത്തു', 'ശരി', 'അതെ'],
    english: ['taken', 'took', 'yes', 'done'],
    hindi: ['लिया', 'खाया', 'हाँ', 'पूरा'],
    tamil: ['எடுத்தேன்', 'சாப்பிட்டேன്', 'ஆம்', 'முடிந்தது']
  },
  skip: {
    malayalam: ['വേണ്ട', 'ഇല്ല', 'പിന്നെ', 'നിർത്തൂ'],
    english: ['skip', 'no', 'later', 'stop'],
    hindi: ['छोड़ें', 'नहीं', 'बाद में', 'रोकें'],
    tamil: ['வேண்டாம்', 'இல்லை', 'பின்னால்', 'நிർத்து']
  }
}

// Conversation history
let conversationHistory: Array<{role: 'user' | 'assistant', content: string, timestamp: number}> = []

// Enhanced intelligent response generation
function generateResponse(text: string, language: string, isEmergency: boolean, isGreeting: boolean = false): string {
  const responses = {
    malayalam: {
      greeting: 'ഹലോ! ഞാൻ നിങ്ങളുടെ സഹായിയാണ്. എന്തെങ്കിലും വേണമോ? നിങ്ങൾക്ക് എങ്ങനെ സഹായിക്കാം?',
      general: 'ഞാൻ മനസ്സിലാക്കി. മറ്റെന്തെങ്കിലും സഹായം വേണമോ? നിങ്ങളുടെ ആരോഗ്യം എങ്ങനെയാണ്?',
      emergency: 'അടിയന്തര സാഹചര്യം കണ്ടെത്തി. കുടുംബത്തെ അറിയിക്കുന്നു.',
      pain: 'വേദന ഉണ്ടോ? എവിടെ വേദന? ഡാക്ടരെ കാണിക്കണം. ഞാൻ സഹായിക്കാം.',
      medication: 'മരുന്ന് കഴിച്ചിരുന്നോ? എല്ലാ മരുന്നും ശരിയായ സമയത്തിനു കഴിക്കുക.',
      family: 'കുടുംബം സുഖമാണോ? അവർ എല്ലാവരും ഭാലെയാണോ?',
      conversation: 'എന്റെ കൂടെ സംസാരിച്ചതിൽ സന്തോഷം. മറ്റെന്തെങ്കിലും പറയാനുണ്ടോ?'
    },
    english: {
      greeting: 'Hello! I\'m your care assistant. How can I help you today? What would you like to talk about?',
      general: 'I understand. Is there anything else I can help you with? How are you feeling today?',
      emergency: 'I\'ve detected an emergency situation. I\'m notifying your family members right away.',
      pain: 'Are you experiencing pain? Where does it hurt? We should contact the doctor. I\'m here to help.',
      medication: 'Have you taken your medication? Please make sure to take all medications on time.',
      family: 'How is your family doing? Are they all well? Tell me about them.',
      conversation: 'I enjoy talking with you. What else would you like to chat about?'
    },
    hindi: {
      greeting: 'नमस्ते! मैं आपका देखभाल सहायक हूं। आज कैसे मदद कर सकता हूं? आप कैसे हैं?',
      general: 'मैं समझ गया। कुछ और मदद चाहिए? आपकी तबीयत कैसी है?',
      emergency: 'आपातकाल का पता लगा। परिवार को तुरंत सूचित कर रहा हूं।',
      pain: 'क्या दर्द हो रहा है? कहां दर्द है? डॉक्टर से मिलना चाहिए।',
      medication: 'दवा ली है? सभी दवाइयां समय पर लेते रहिए।',
      family: 'परिवार कैसा है? सब ठीक हैं? उनके बारे में बताइए।',
      conversation: 'आपसे बात करके अच्छा लगा। और क्या चर्चा करना चाहते हैं?'
    },
    tamil: {
      greeting: 'வணக்கம்! நான் உங்கள் பராமரிப்பு உதவியாளர். இன்று எப்படி உதவ முடியும்? நீங்கள் எப்படி இருக்கிறீர்கள்?',
      general: 'நான் புரிந்துகொண்டேன். வேறு ஏதாவது உதவி வேண்டுமா? உங்கள் உடல்நிலை எப்படி?',
      emergency: 'அவசர நிலைமை கண்டறியப்பட்டது। குடும்பத்தினரை உடனே தெரிவிக்கிறேன்.',
      pain: 'வலி இருக்கிறதா? எங்கே வலி? டாக்டரை பார்க்க வேண்டும்.',
      medication: 'மருந்து குடித்தீர்களா? எல்லா மருந்துகளும் சரியான நேரத்தில் குடிக்க வேண்டும்.',
      family: 'குடும்பம் எப்படி இருக்கிறது? எல்லாரும் நலமாக இருக்கிறார்களா?',
      conversation: 'உங்களுடன் பேசுவது மகிழ்ச்சி. வேறு என்ன பேச விரும்புகிறீர்கள்?'
    }
  }
  
  const langResponses = responses[language as keyof typeof responses] || responses.english
  
  if (isEmergency) return langResponses.emergency
  
  // Enhanced keyword matching for appropriate responses
  const lowerText = text.toLowerCase()
  
  // Check for greeting/wake words first
  if (isGreeting || lowerText.includes('hello') || lowerText.includes('ഹലോ') || 
      lowerText.includes('नमस्ते') || lowerText.includes('വണക്കം') ||
      lowerText.includes('hey google') || lowerText.includes('ഹേ ഗൂഗിൾ')) {
    return langResponses.greeting
  }
  
  if (lowerText.includes('pain') || lowerText.includes('വേദന') || 
      lowerText.includes('दर्द') || lowerText.includes('வലി') ||
      lowerText.includes('hurt') || lowerText.includes('ache')) {
    return langResponses.pain
  }
  
  if (lowerText.includes('medication') || lowerText.includes('മരുന്ന') || 
      lowerText.includes('दवा') || lowerText.includes('மருந்து') ||
      lowerText.includes('medicine') || lowerText.includes('pill')) {
    return langResponses.medication
  }
  
  if (lowerText.includes('family') || lowerText.includes('കുടുംബം') || 
      lowerText.includes('परिवार') || lowerText.includes('குடும்பம்') ||
      lowerText.includes('children') || lowerText.includes('relatives')) {
    return langResponses.family
  }
  
  // If conversation is ongoing, use conversation responses
  if (conversationHistory.length > 2) {
    return langResponses.conversation
  }
  
  // Default response for new conversations
  return langResponses.general
}

const geminiVoiceService = {
  async processVoiceInput(text: string, context: string = 'general'): Promise<GeminiResponse> {
    try {
      const language = detectLanguage(text)
      const emergencyAnalysis = analyzeEmergency(text, language)
      
      // Check if this is a wake word/greeting
      const isWakeWordDetected = this.isWakeWord(text)
      
      // Add to conversation history
      conversationHistory.push({
        role: 'user',
        content: text,
        timestamp: Date.now()
      })
      
      // Keep last 20 exchanges
      if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20)
      }
      
      // Generate intelligent response
      const responseText = generateResponse(text, language, emergencyAnalysis.isEmergency, isWakeWordDetected)
      
      // Add response to history
      conversationHistory.push({
        role: 'assistant',
        content: responseText,
        timestamp: Date.now()
      })
      
      // Continue listening unless it's a goodbye
      const shouldContinueListening = !text.toLowerCase().includes('goodbye') && 
                                     !text.toLowerCase().includes('bye') &&
                                     !text.toLowerCase().includes('വിട') &&
                                     !text.toLowerCase().includes('अलविदा') &&
                                     !text.toLowerCase().includes('போய்வருகிறேன்')
      
      return {
        response: responseText,
        language,
        isEmergency: emergencyAnalysis.isEmergency,
        emergencyLevel: emergencyAnalysis.level,
        intent: emergencyAnalysis.isEmergency ? 'emergency' : isWakeWordDetected ? 'greeting' : 'conversation',
        confidence: 0.90,
        shouldContinueListening,
        contextualResponse: conversationHistory.length > 2
      }
      
    } catch (error) {
      console.error('Voice processing error:', error)
      
      const language = detectLanguage(text)
      const fallbacks = {
        malayalam: 'ക്ഷമിക്കുക, എനിക്ക് മനസ്സിലായില്ല. ദയവായി വീണ്ടും പറയാമോ?',
        hindi: 'माफ़ करिए, मुझे समझ नहीं आया। फिर से कहिए?',
        tamil: 'மன்னிக்கவும், புரியவில்லை. மறுபடி சொல்லுங்கள்?',
        english: 'I apologize, I didn\'t understand. Could you please repeat that?'
      }
      
      return {
        response: fallbacks[language as keyof typeof fallbacks] || fallbacks.english,
        language,
        isEmergency: false,
        emergencyLevel: 'low',
        intent: 'error',
        confidence: 0.3,
        shouldContinueListening: true,
        contextualResponse: false
      }
    }
  },

  async generateMedicationReminder(medicationName: string, language: string = 'english'): Promise<string> {
    const reminders = {
      malayalam: `അച്ഛാ/അമ്മേ, ${medicationName} എന്ന മരുന്ന് കഴിക്കാൻ സമയമായി. ദയവായി എടുത്തോളൂ.`,
      hindi: `दादाजी/दादीमा, ${medicationName} दवा लेने का समय हो गया है। कृपया ले लीजिए।`,
      tamil: `தாத்தா/பாட்டி, ${medicationName} மருந்து சாப்பிடும் நேரம் ஆயிற்று. தயவை எடுத்து கொள்ளுங்கள்.`,
      english: `Dear, it's time to take your ${medicationName} medication. Please take it now.`
    }
    
    return reminders[language as keyof typeof reminders] || reminders.english
  },

  checkMedicationResponse(text: string): 'taken' | 'skip' | 'unknown' {
    const lowerText = text.toLowerCase().trim()
    
    for (const [lang, terms] of Object.entries(MEDICATION_TERMS.taken)) {
      if (terms.some(term => lowerText.includes(term.toLowerCase()))) {
        return 'taken'
      }
    }
    
    for (const [lang, terms] of Object.entries(MEDICATION_TERMS.skip)) {
      if (terms.some(term => lowerText.includes(term.toLowerCase()))) {
        return 'skip'
      }
    }
    
    return 'unknown'
  },

  isWakeWord(text: string): boolean {
    const lowerText = text.toLowerCase().trim()
    
    for (const [lang, words] of Object.entries(WAKE_WORDS)) {
      if (words.some(word => lowerText.includes(word.toLowerCase()))) {
        return true
      }
    }
    
    return false
  },

  clearConversationHistory() {
    conversationHistory = []
  },

  getConversationHistory() {
    return conversationHistory
  }
}

export default geminiVoiceService
 