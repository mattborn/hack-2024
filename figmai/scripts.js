const CLIENT_ID = 'YOUR_FIGMA_CLIENT_ID'
const REDIRECT_URI = 'http://localhost:3000'

// Auth handling
const handleAuth = () => {
  const authUrl = `https://www.figma.com/oauth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=files:read files:write&state=abc123&response_type=code`
  window.location.href = authUrl
}

// Check for auth code in URL
const handleCallback = () => {
  const code = new URLSearchParams(window.location.search).get('code')
  if (code) {
    // Exchange code for access token
    // Note: This would require a backend endpoint to securely exchange the code
    console.log('Auth code:', code)
    window.history.replaceState({}, document.title, window.location.pathname)
    return code
  }
  return null
}

// Figma API helpers
const getFigmaFile = async (fileUrl, token) => {
  const fileKey = fileUrl.split('/').pop()
  const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.json()
}

const createFrame = async (fileKey, token) => {
  const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/nodes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'New Frame',
      type: 'FRAME',
      size: { width: 400, height: 400 },
    }),
  })
  return response.json()
}

// UI handlers
document.getElementById('login')?.addEventListener('click', handleAuth)

document.getElementById('fetch')?.addEventListener('click', async () => {
  const fileUrl = document.getElementById('fileUrl').value
  if (!fileUrl) return

  try {
    const token = localStorage.getItem('figma_token')
    const data = await getFigmaFile(fileUrl, token)
    
    // Display frames
    const framesDiv = document.getElementById('frames')
    framesDiv.innerHTML = ''
    
    Object.values(data.document.children).forEach(frame => {
      const frameEl = document.createElement('div')
      frameEl.className = 'frame'
      frameEl.innerHTML = `
        <h3>${frame.name}</h3>
        <p>Type: ${frame.type}</p>
      `
      framesDiv.appendChild(frameEl)
    })
    
    document.querySelector('.actions').classList.remove('hidden')
  } catch (error) {
    console.error('Error fetching Figma file:', error)
  }
})

// Initialize
const init = () => {
  const code = handleCallback()
  if (code) {
    // Exchange code for token
    // Store token in localStorage
    document.getElementById('auth').classList.add('hidden')
    document.getElementById('content').classList.remove('hidden')
  } else {
    const token = localStorage.getItem('figma_token')
    if (token) {
      document.getElementById('auth').classList.add('hidden')
      document.getElementById('content').classList.remove('hidden')
    }
  }
}

document.addEventListener('DOMContentLoaded', init)
