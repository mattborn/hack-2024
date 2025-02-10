import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import readline from 'readline'

// Initialize lowdb
const adapter = new JSONFile('db.json')
const db = new Low(adapter, [])

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Helper to ask yes/no questions
const askQuestion = question => {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer.toLowerCase().startsWith('y'))
    })
  })
}

// Original schema before enrichment (hardcoded for demo)
const originalSchema = ['name', 'city']

async function reviewLocations() {
  await db.read()

  for (const entry of db.data) {
    console.log('\n----------------------------------------')
    console.log('Current entry:', JSON.stringify(entry, null, 2))

    const approved = await askQuestion('Approve this enriched data? (y/n): ')

    if (!approved) {
      // Reset to original schema
      const cleanEntry = {}
      originalSchema.forEach(key => {
        cleanEntry[key] = entry[key]
      })

      // Replace entry with cleaned version
      const index = db.data.indexOf(entry)
      db.data[index] = cleanEntry

      console.log('Reverted to:', cleanEntry)
    }
  }

  await db.write()
  rl.close()
  return db.data
}

// Immediately execute
reviewLocations()
  .then(result => {
    console.log('\nFinal database:', result)
    process.exit(0)
  })
  .catch(error => {
    console.error('Error:', error)
    process.exit(1)
  })
