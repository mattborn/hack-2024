const assert = require('assert')
const { getRecentEmails } = require('./index.js')

async function testGetRecentEmails() {
  try {
    console.log('Testing getRecentEmails...')
    const emails = await getRecentEmails(5) // Only fetch 5 emails for testing
    
    // Basic validation
    assert(Array.isArray(emails), 'Emails should be an array')
    assert(emails.length > 0, 'Should fetch at least one email')
    
    // Validate email structure
    const firstEmail = emails[0]
    assert(firstEmail.subject !== undefined, 'Email should have subject')
    assert(firstEmail.from !== undefined, 'Email should have from')
    assert(firstEmail.date !== undefined, 'Email should have date')
    assert(firstEmail.body !== undefined, 'Email should have body')
    
    console.log('✓ All tests passed')
    console.log(`Retrieved ${emails.length} emails`)
  } catch (error) {
    console.error('✗ Test failed:', error)
    process.exit(1)
  }
}

testGetRecentEmails()
