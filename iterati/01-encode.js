import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import axios from 'axios'

// Initialize lowdb with default data as empty array
const adapter = new JSONFile('db.json')
const db = new Low(adapter, [])

// Hardcoded transcription text
const transcription =
  "as a test, I'm going to read off a list of the 10 best pizza places in Salt Lake according to TripAdvisor: big daddy's pizza, setteBello pizzeria, the pie pizzeria, rusted sun pizzeria, from scratch, California pizza kitchen, nomad eatery, pizzeria Limone, Sicilia Pizza kitchen, litzas pizza"

// Helper method for GPT-4 calls
const gpt4 = async messages => {
  try {
    const response = await axios.post('https://us-central1-samantha-374622.cloudfunctions.net/openai', {
      messages,
      model: 'gpt-4o',
    })
    return response.data
  } catch (error) {
    console.error('GPT-4 API error:', error)
    return null
  }
}

const toJSON = str => {
  const curly = str.indexOf('{')
  const square = str.indexOf('[')
  let first
  if (curly < 0) first = '['
  else if (square < 0) first = '{'
  else first = curly < square ? '{' : '['
  const last = first === '{' ? '}' : ']'
  let count = 0
  for (const c of str) {
    if (c === '{' || c === '[') count++
    else if (c === '}' || c === ']') count--
  }
  if (!count) return JSON.parse(str.slice(str.indexOf(first), str.lastIndexOf(last) + 1))
}

async function processTranscription() {
  await db.read()

  const schema = {
    name: 'string',
    city: 'string',
  }

  const messages = [
    {
      role: 'system',
      content:
        'Identify the primary category of named entities in the text (e.g., restaurants, people, companies) and extract ONLY those entities that belong to the most prominent category. Also identify the city context if mentioned. Return them as properly capitalized JSON objects.',
    },
    {
      role: 'user',
      content: `Return an array of JSON objects with this schema: ${JSON.stringify(
        schema,
      )} containing only the most common type of named entities and their cities from this text: "${transcription}"`,
    },
  ]

  const response = await gpt4(messages)
  if (response) {
    try {
      const jsonData = toJSON(response)
      const newNames = Array.isArray(jsonData) ? jsonData : [jsonData]

      // Add to database (only if names don't already exist)
      newNames.forEach(entry => {
        if (!db.data.some(item => item.name === entry.name)) {
          db.data.push(entry)
        }
      })

      await db.write()
      return db.data
    } catch (error) {
      console.error('Error processing transcription:', error)
      return null
    }
  }
  return null
}

// Immediately execute
processTranscription()
  .then(result => console.log('Processed names:', result))
  .catch(error => console.error('Error:', error))
