import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import axios from 'axios'

// Initialize lowdb
const adapter = new JSONFile('db.json')
const db = new Low(adapter, [])

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

async function enrichLocation(entry) {
  const schema = {
    address: 'string',
    latitude: 'number',
    longitude: 'number',
  }

  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful assistant that provides accurate location data. Return address and coordinates in JSON format.',
    },
    {
      role: 'user',
      content: `Return a single JSON object with this schema: ${JSON.stringify(
        schema,
      )} for this entry: ${JSON.stringify(entry)}`,
    },
  ]

  const response = await gpt4(messages)
  if (response) {
    try {
      return toJSON(response)
    } catch (error) {
      console.error(`Error enriching location for ${entry.name}:`, error)
      return null
    }
  }
  return null
}

async function enrichLocations() {
  await db.read()

  for (const entry of db.data) {
    if (!entry.address) {
      console.log(`Enriching location data for:`, entry)
      const locationData = await enrichLocation(entry)

      if (locationData) {
        Object.assign(entry, locationData)
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  await db.write()
  return db.data
}

// Immediately execute
enrichLocations()
  .then(result => console.log('Enriched locations:', result))
  .catch(error => console.error('Error:', error))
