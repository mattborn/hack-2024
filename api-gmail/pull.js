#!/usr/bin/env node

const { authenticate } = require('@google-cloud/local-auth')
const { google } = require('googleapis')
const fs = require('fs').promises

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

async function pullEmails(limit) {
  try {
    // Authenticate with OAuth2
    const auth = await authenticate({
      keyfilePath: 'credentials.json',
      scopes: SCOPES,
      port: 3000,
      redirectUri: 'http://localhost:3000/oauth2callback',
    })

    const gmail = google.gmail({ version: 'v1', auth })

    // Get recent emails
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: limit
    })

    const messages = response.data.messages || []
    console.log(`Fetched ${messages.length} message headers...`)

    const emails = []

    // Get full message details
    for (const [index, message] of messages.entries()) {
      if (index % 10 === 0) {
        console.log(`Processing message ${index + 1} of ${messages.length}...`)
      }

      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
      })

      const headers = email.data.payload.headers
      const subject = headers.find(h => h.name === 'Subject')?.value || ''
      const from = headers.find(h => h.name === 'From')?.value || ''
      const date = headers.find(h => h.name === 'Date')?.value || ''

      // Get email body
      let body = ''
      if (email.data.payload.parts) {
        const textPart = email.data.payload.parts.find(part => part.mimeType === 'text/plain')
        if (textPart && textPart.body.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString()
        }
      }

      emails.push({ subject, from, date, body })
    }

    await fs.writeFile('emails.json', JSON.stringify(emails, null, 2))
    console.log(`Saved ${emails.length} emails to emails.json`)

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

const limit = parseInt(process.argv[2]) || 100
pullEmails(limit)
