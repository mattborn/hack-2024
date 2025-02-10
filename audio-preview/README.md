# gpt-4o-audio-preview

Released [October 1, 2024](https://openai.com/index/introducing-the-realtime-api/)

## Requirements

- Use my existing endpoint: https://us-central1-samantha-374622.cloudfunctions.net/openai
- Test the modality for audio in → text + audio out
- Use my microphone for the audio input
- Use the Nova voice for the audio output
- Display both the input and output transcription on the page if possible

## Copied from OpenAI documentation

Audio input to model

```js
import OpenAI from 'openai'
const openai = new OpenAI()

// Fetch an audio file and convert it to a base64 string
const url = 'https://openaiassets.blob.core.windows.net/$web/API/docs/audio/alloy.wav'
const audioResponse = await fetch(url)
const buffer = await audioResponse.arrayBuffer()
const base64str = Buffer.from(buffer).toString('base64')

const response = await openai.chat.completions.create({
  model: 'gpt-4o-audio-preview',
  modalities: ['text', 'audio'],
  audio: { voice: 'alloy', format: 'wav' },
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What is in this recording?' },
        { type: 'input_audio', input_audio: { data: base64str, format: 'wav' } },
      ],
    },
  ],
})

console.log(response.choices[0])
```

Audio output from model

```js
import { writeFileSync } from 'node:fs'
import OpenAI from 'openai'

const openai = new OpenAI()

// Generate an audio response to the given prompt
const response = await openai.chat.completions.create({
  model: 'gpt-4o-audio-preview',
  modalities: ['text', 'audio'],
  audio: { voice: 'alloy', format: 'wav' },
  messages: [
    {
      role: 'user',
      content: 'Is a golden retriever a good family dog?',
    },
  ],
})

// Inspect returned data
console.log(response.choices[0])

// Write audio data to a file
writeFileSync('dog.wav', Buffer.from(response.choices[0].message.audio.data, 'base64'), { encoding: 'utf-8' })
```
