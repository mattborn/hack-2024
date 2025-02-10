import WaveSurfer from 'https://cdn.jsdelivr.net/npm/wavesurfer.js@7/dist/wavesurfer.esm.js'
import RecordPlugin from 'https://cdn.jsdelivr.net/npm/wavesurfer.js@7/dist/plugins/record.esm.js'

// Initialize WaveSurfer
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4a9eff',
  progressColor: '#1e6abc',
  height: 64,
  barWidth: 3,
  barGap: 2,
  barRadius: 2,
})

// Initialize recording plugin
const record = wavesurfer.registerPlugin(RecordPlugin.create())

// Speech recognition setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
recognition.continuous = true
recognition.interimResults = true

// UI elements
const interviewArea = document.getElementById('interview-area')
const transcriptionDiv = document.getElementById('transcription')

let isInterviewStarted = false
let isInterviewerSpeaking = false
let isRecognitionActive = false
let currentTranscriptP = null
let silenceTimer = null
let silenceTimeout = 3000 // 3 seconds of silence before responding
let countdownDisplay = null
let currentQuestionIndex = 0
let isWaitingForResponse = false
let interviewDuration = 2 * 60 * 1000 // 2 minutes in milliseconds
let interviewTimer = null
let startCountdown = 3 // 3 seconds countdown
let interviewScript = null

document.addEventListener('DOMContentLoaded', () => {
  // Show interview area immediately
  interviewArea.style.display = 'block'

  // Initialize WaveSurfer and other components
  let timeLeft = startCountdown * 1000

  // Start countdown
  const countdownInterval = setInterval(() => {
    updateCountdown(timeLeft)
    timeLeft -= 100

    if (timeLeft <= 0) {
      clearInterval(countdownInterval)
      startInterview()
    }
  }, 100)
})

async function startInterview() {
  try {
    // Load the interview script first
    const response = await fetch('interview-script.json')
    interviewScript = await response.json()

    // Start recording and recognition
    await record.startRecording()
    recognition.start()
    isRecognitionActive = true
    isInterviewStarted = true

    // Initial greeting only
    await speak(interviewScript.welcome)

    // Wait for welcome to complete before introduction
    await new Promise(resolve => setTimeout(resolve, 2000))
    await speak(interviewScript.introduction)
    isWaitingForResponse = true

    // Start interview timer
    interviewTimer = setTimeout(() => {
      speak(interviewScript.closing.signoff)
      setTimeout(endInterview, 2000)
    }, interviewDuration)
  } catch (err) {
    console.error('Error starting interview:', err)
  }
}

// Speech synthesis for interviewer
async function speak(text) {
  try {
    const response = await fetch('http://localhost:3000/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        voice: 'alloy',
      }),
    })

    if (!response.ok) throw new Error('TTS request failed')

    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)

    // Stop recognition while system is speaking
    isInterviewerSpeaking = true
    if (isRecognitionActive) {
      recognition.stop()
      isRecognitionActive = false
    }

    audio.onended = () => {
      isInterviewerSpeaking = false
      if (!isRecognitionActive) {
        recognition.start()
        isRecognitionActive = true
      }
      URL.revokeObjectURL(audioUrl) // Clean up the URL
    }

    await audio.play()
    addToTranscription('Interviewer: ' + text)
  } catch (err) {
    console.error('TTS error:', err)
    addToTranscription('Error: Failed to speak. Please refresh the page.')
  }
}

// Handle speech recognition results
recognition.onresult = event => {
  // Clear any existing silence timer
  if (silenceTimer) {
    clearTimeout(silenceTimer)
    silenceTimer = null
  }

  const transcript = Array.from(event.results)
    .map(result => result[0].transcript)
    .join('')

  if (!currentTranscriptP || currentTranscriptP.textContent.startsWith('Interviewer')) {
    currentTranscriptP = document.createElement('p')
    currentTranscriptP.textContent = 'Candidate: ' + transcript
    transcriptionDiv.appendChild(currentTranscriptP)
  } else {
    currentTranscriptP.textContent = 'Candidate: ' + transcript
  }

  // Start silence detection after speech
  if (event.results[event.results.length - 1].isFinal) {
    let timeLeft = silenceTimeout

    silenceTimer = setInterval(() => {
      timeLeft -= 100
      updateCountdown(timeLeft, 'Waiting to respond')

      if (timeLeft <= 0) {
        clearInterval(silenceTimer)
        silenceTimer = null
        // Trigger next question
        askNextQuestion()
      }
    }, 100)
  }
}

function addToTranscription(text) {
  currentTranscriptP = document.createElement('p')
  currentTranscriptP.textContent = text
  transcriptionDiv.appendChild(currentTranscriptP)
}

function endInterview() {
  if (interviewTimer) {
    clearTimeout(interviewTimer)
    interviewTimer = null
  }

  isInterviewStarted = false
  record.stopRecording()
  if (isRecognitionActive) {
    recognition.stop()
    isRecognitionActive = false
  }

  record
    .getBlob()
    .then(audioBlob => {
      if (audioBlob) {
        console.log('Recording saved:', audioBlob)
        // Here you can add code to handle the audio blob
      }
    })
    .catch(err => {
      console.error('Error getting recording:', err)
    })
}

// Handle errors
recognition.onerror = event => {
  console.error('Recognition error:', event.error)
}

// Add this to handle speech start
recognition.onstart = () => {
  isRecognitionActive = true
  if (silenceTimer) {
    clearInterval(silenceTimer)
    silenceTimer = null
    if (countdownDisplay) {
      countdownDisplay.remove()
      countdownDisplay = null
    }
  }
}

// Add this function to create and update the countdown display
function updateCountdown(timeLeft, message = 'Interview starting in') {
  if (!countdownDisplay) {
    countdownDisplay = document.createElement('p')
    countdownDisplay.className = 'countdown'
    transcriptionDiv.appendChild(countdownDisplay)
  }

  if (timeLeft > 0) {
    countdownDisplay.textContent = `${message} ${(timeLeft / 1000).toFixed(1)}s`
  } else {
    countdownDisplay.remove()
    countdownDisplay = null
  }
}

// Add the askNextQuestion function
async function askNextQuestion() {
  try {
    const response = await fetch('interview-script.json')
    const script = await response.json()

    if (currentQuestionIndex < script.questions.length) {
      speak(script.questions[currentQuestionIndex].text)
      currentQuestionIndex++
      isWaitingForResponse = true
    } else {
      endInterview()
    }
  } catch (error) {
    console.error('Error loading interview questions:', error)
  }
}

recognition.onend = () => {
  isRecognitionActive = false
}
