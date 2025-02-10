class AudioChat {
  constructor() {
    this.recordButton = document.getElementById('recordButton')
    this.conversation = document.getElementById('conversation')

    this.isRecording = false
    this.mediaRecorder = null
    this.audioChunks = []
    this.recordingStartTime = null

    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    this.setupRecognition()
    this.setupEventListeners()

    // Add silence detection properties
    this.silenceTimer = null
    this.silenceThreshold = 1500 // 1.5 seconds of silence before stopping
    this.lastSpeechTime = null

    this.responseDelay = 2000 // 2 second delay before response
  }

  setupRecognition() {
    this.recognition.continuous = true
    this.recognition.interimResults = true

    this.recognition.onresult = event => {
      this.lastSpeechTime = performance.now()
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ')

      // Update the current message
      const currentMessage = this.conversation.lastElementChild
      if (currentMessage) {
        currentMessage.querySelector('.content').textContent = transcript
      }

      // Reset silence timer
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer)
      }
      this.silenceTimer = setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording()
        }
      }, this.silenceThreshold)
    }

    // Remove the auto-stop on recognition end since we're using silence detection
    this.recognition.onend = () => {
      if (this.isRecording) {
        this.recognition.start()
      }
    }
  }

  setupEventListeners() {
    this.recordButton.addEventListener('click', () => this.toggleRecording())
  }

  async toggleRecording() {
    if (!this.isRecording) {
      await this.startRecording()
    }
  }

  createMessageElement(role, startTime = null) {
    const message = document.createElement('div')
    message.className = `message ${role}`
    message.innerHTML = `
      <h3>${role === 'user' ? 'You' : 'Assistant'}</h3>
      <div class="content"></div>
      ${startTime ? '<div class="latency"></div>' : ''}
      ${role === 'user' ? '<div class="countdown"></div>' : ''}
    `
    this.conversation.appendChild(message)
    return message
  }

  updateCountdown(element, timeLeft) {
    if (timeLeft > 0) {
      element.textContent = `Response in ${(timeLeft / 1000).toFixed(1)}s...`
      setTimeout(() => this.updateCountdown(element, timeLeft - 100), 100)
    } else {
      element.textContent = 'Processing response...'
    }
  }

  async startRecording() {
    try {
      this.recordingStartTime = performance.now()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(stream)
      this.audioChunks = []

      // Create new message element for user
      this.createMessageElement('user', this.recordingStartTime)

      this.mediaRecorder.ondataavailable = event => {
        this.audioChunks.push(event.data)
      }

      this.mediaRecorder.onstop = async () => {
        const recordingLatency = performance.now() - this.recordingStartTime
        const currentMessage = this.conversation.lastElementChild
        currentMessage.querySelector('.latency').textContent = `recording: ${Math.round(recordingLatency)}ms`

        const processingStartTime = performance.now()
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        await this.processAudioInput(audioBlob, processingStartTime)
      }

      this.mediaRecorder.start()
      this.recognition.start()
      this.isRecording = true
      this.recordButton.textContent = 'Recording...'
      this.recordButton.classList.add('recording')

      // Initialize silence detection
      this.lastSpeechTime = performance.now()
      this.silenceTimer = setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording()
        }
      }, this.silenceThreshold)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  async stopRecording() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer)
      this.silenceTimer = null
    }
    this.mediaRecorder.stop()
    this.recognition.stop()
    this.isRecording = false
    this.recordButton.textContent = 'Start Recording'
    this.recordButton.classList.remove('recording')

    // Start countdown timer
    const currentMessage = this.conversation.lastElementChild
    const countdownElement = currentMessage.querySelector('.countdown')
    this.updateCountdown(countdownElement, this.responseDelay)

    // Wait for countdown before processing
    await new Promise(resolve => setTimeout(resolve, this.responseDelay))
  }

  async processAudioInput(audioBlob, startTime) {
    try {
      const currentMessage = this.conversation.lastElementChild
      const countdownElement = currentMessage.querySelector('.countdown')
      countdownElement.textContent = 'Processing response...'

      const audioContext = new AudioContext()
      const audioData = await audioBlob.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(audioData)

      const wavBuffer = this.audioBufferToWav(audioBuffer)
      const base64str = btoa(new Uint8Array(wavBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))

      const responseStartTime = performance.now()
      const response = await fetch('https://us-central1-samantha-374622.cloudfunctions.net/openai-4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-audio-preview',
          modalities: ['text', 'audio'],
          audio: { voice: 'nova', format: 'wav' },
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: 'What is in this recording?' },
                { type: 'input_audio', input_audio: { data: base64str, format: 'wav' } },
              ],
            },
          ],
        }),
      })

      const processingLatency = responseStartTime - startTime
      currentMessage.querySelector('.latency').textContent += `, processing: ${Math.round(processingLatency)}ms`

      const data = await response.json()
      const responseLatency = performance.now() - responseStartTime

      // Create and display assistant message
      const assistantMessage = this.createMessageElement('assistant', responseStartTime)
      assistantMessage.querySelector('.content').textContent = data.choices[0].message.content
      assistantMessage.querySelector('.latency').textContent = `response: ${Math.round(responseLatency)}ms`

      // Auto-play the response audio
      if (data.choices[0].message.audio?.data) {
        const audioData = data.choices[0].message.audio.data
        const audioBlob = new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], { type: 'audio/wav' })
        const audio = new Audio(URL.createObjectURL(audioBlob))
        audio.play()

        // Start new recording after response finishes playing
        audio.onended = () => {
          this.startRecording()
        }
      }

      // Clear countdown when response is received
      countdownElement.remove()
    } catch (error) {
      console.error('Error processing audio:', error)
      const countdownElement = this.conversation.lastElementChild.querySelector('.countdown')
      countdownElement.textContent = 'Error processing response'
    }
  }

  audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1
    const bitDepth = 16

    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample

    const data = this.interleave(buffer)
    const dataSize = data.length * bytesPerSample
    const fileSize = 44 + dataSize

    const arrayBuffer = new ArrayBuffer(fileSize)
    const view = new DataView(arrayBuffer)

    this.writeString(view, 0, 'RIFF')
    view.setUint32(4, fileSize - 8, true)
    this.writeString(view, 8, 'WAVE')
    this.writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    this.writeString(view, 36, 'data')
    view.setUint32(40, dataSize, true)

    this.floatTo16BitPCM(view, 44, data)

    return arrayBuffer
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  interleave(buffer) {
    const numChannels = buffer.numberOfChannels
    const length = buffer.length * numChannels
    const result = new Float32Array(length)

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < buffer.length; i++) {
        result[i * numChannels + channel] = channelData[i]
      }
    }

    return result
  }

  floatTo16BitPCM(view, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AudioChat()
})
