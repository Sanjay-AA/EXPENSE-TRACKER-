import { useState, useEffect, useRef } from 'react'
import { addTransaction } from '../lib/api.js'

export default function VoiceAssistant({ onAdded }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setMessage('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onstart = () => {
      setIsListening(true)
      setMessage('Listening... Speak your expense now!')
    }

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setTranscript(transcript)
      processVoiceInput(transcript)
    }

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setMessage(`Error: ${event.error}`)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const processVoiceInput = async (text) => {
    setIsProcessing(true)
    setMessage('Processing your voice input...')

    try {
      // Parse the voice input using natural language processing
      const parsedExpense = parseExpenseFromText(text)
      
      if (parsedExpense) {
        // Add the transaction
        await addTransaction(parsedExpense)
        setMessage(`✅ Added: ₹${parsedExpense.amount} for ${parsedExpense.description}`)
        setTranscript('')
        
        // Refresh the transaction list
        if (onAdded) {
          onAdded()
        }
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('❌ Could not understand. Please try again with format: "I spent 500 on Swiggy today"')
      }
    } catch (error) {
      console.error('Error processing voice input:', error)
      setMessage('❌ Error adding transaction. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const parseExpenseFromText = (text) => {
    const lowerText = text.toLowerCase()
    
    // Common expense patterns
    const patterns = [
      // "I spent 500 on Swiggy today"
      /(?:i\s+)?(?:spent|paid|bought|purchased|expensed?)\s+(?:₹?\s*)?(\d+(?:\.\d+)?)\s+(?:on|for|at|from)\s+([^.]+?)(?:\s+(?:today|yesterday|this\s+week|this\s+month))?/i,
      
      // "500 on groceries"
      /(?:₹?\s*)?(\d+(?:\.\d+)?)\s+(?:on|for|at|from)\s+([^.]+?)(?:\s+(?:today|yesterday|this\s+week|this\s+month))?/i,
      
      // "Expense 500 for food"
      /(?:expense|expenditure|cost)\s+(?:₹?\s*)?(\d+(?:\.\d+)?)\s+(?:on|for|at|from)\s+([^.]+?)(?:\s+(?:today|yesterday|this\s+week|this\s+month))?/i,
      
      // "Bought food for 500"
      /(?:bought|purchased|got|brought)\s+([^.]+?)\s+(?:for|at|₹?\s*)(\d+(?:\.\d+)?)/i,
      
      // "500 rupees on food"
      /(?:₹?\s*)?(\d+(?:\.\d+)?)\s+(?:rupees?|rs|dollars?|euros?)\s+(?:on|for|at|from)\s+([^.]+?)/i
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        const amount = parseFloat(match[1])
        const description = match[2].trim()
        
        if (amount > 0 && description) {
          return {
            amount: amount,
            description: description.charAt(0).toUpperCase() + description.slice(1),
            type: 'expense',
            date: new Date().toISOString().split('T')[0],
            category: 'voice-input'
          }
        }
      }
    }

    // If no pattern matches, try to extract amount and description manually
    const amountMatch = text.match(/(?:₹?\s*)?(\d+(?:\.\d+)?)/)
    if (amountMatch) {
      const amount = parseFloat(amountMatch[1])
      // Remove the amount and common words, keep the description
      let description = text.replace(/(?:₹?\s*)?\d+(?:\.\d+)?/g, '')
        .replace(/\b(?:i\s+spent|paid|bought|purchased|expensed?|on|for|at|from|today|yesterday|this\s+week|this\s+month|rupees?|rs|dollars?|euros?)\b/gi, '')
        .trim()
        .replace(/\s+/g, ' ')
      
      if (description && amount > 0) {
        return {
          amount: amount,
          description: description.charAt(0).toUpperCase() + description.slice(1),
          type: 'expense',
          date: new Date().toISOString().split('T')[0],
          category: 'voice-input'
        }
      }
    }

    return null
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing) {
      setTranscript('')
      setMessage('')
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window

  if (!isSupported) {
    return (
      <div className="card">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--bg-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            🎤
          </div>
          <div>
            <h3>Voice Assistant</h3>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              Speech recognition not supported
            </p>
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <p>Please use Chrome, Edge, or Safari to access voice features.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: isListening ? '#ef4444' : 'var(--bg-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          transition: 'all 0.3s ease'
        }}>
          {isListening ? '🔴' : '🎤'}
        </div>
        <div>
          <h3>Voice Assistant</h3>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            Speak your expenses naturally
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gap: '16px'
      }}>
        {/* Voice Input Display */}
        {transcript && (
          <div style={{
            padding: '16px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-primary)',
            fontSize: '16px',
            fontStyle: 'italic',
            color: 'var(--text-primary)'
          }}>
            <strong>You said:</strong> "{transcript}"
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div style={{
            padding: '12px 16px',
            background: message.includes('✅') ? 'rgba(16, 185, 129, 0.1)' : 
                       message.includes('❌') ? 'rgba(239, 68, 68, 0.1)' : 
                       'rgba(59, 130, 246, 0.1)',
            border: message.includes('✅') ? '1px solid rgba(16, 185, 129, 0.3)' :
                    message.includes('❌') ? '1px solid rgba(239, 68, 68, 0.3)' :
                    '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: message.includes('✅') ? '#10b981' :
                   message.includes('❌') ? '#ef4444' : '#3b82f6',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {/* Control Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            style={{
              minWidth: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isListening ? (
              <>
                <span>🛑</span>
                Stop
              </>
            ) : (
              <>
                <span>🎤</span>
                Start
              </>
            )}
          </button>
        </div>

        {/* Examples */}
        <div style={{
          padding: '16px',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '12px'
          }}>
            💡 Try saying:
          </div>
          <div style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            • "I spent 500 on Swiggy today"<br/>
            • "500 on groceries"<br/>
            • "Bought food for 200"<br/>
            • "Expense 1500 for fuel"
          </div>
        </div>

        {/* Status */}
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-muted)',
          padding: '8px'
        }}>
          {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready to listen'}
        </div>
      </div>
    </div>
  )
}

