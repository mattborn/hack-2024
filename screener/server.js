const express = require('express')
const cors = require('cors')
const OpenAI = require('openai')
require('dotenv').config()

const app = express()
const port = 3000

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

app.use(cors())
app.use(express.json())

app.post('/tts', async (req, res) => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: req.body.voice || 'alloy',
      input: req.body.text,
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())
    res.set('Content-Type', 'audio/mpeg')
    res.send(buffer)
  } catch (error) {
    console.error('OpenAI API Error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(port, () => {
  console.log(`TTS server running at http://localhost:${port}`)
})
