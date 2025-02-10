const linkInput = document.getElementById('linkInput')
const paramsDiv = document.getElementById('params')
const historyDiv = document.getElementById('history')
let rules = []
let history = JSON.parse(localStorage.getItem('linkHistory') || '[]')

// Load rules
fetch('rules.json')
  .then(response => response.json())
  .then(data => {
    rules = data
    renderHistory()
  })

function getDomainRule(url) {
  try {
    const domain = new URL(url).hostname
    return rules.find(r => r.domain === domain || domain.includes(r.domain))
  } catch (e) {
    return null
  }
}

async function updateClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

function addToHistory(url, success) {
  history = history.map(item => ({ ...item, success: false }))

  const entry = { url, success, timestamp: Date.now() }
  history = [entry, ...history]
  localStorage.setItem('linkHistory', JSON.stringify(history))
  renderHistory()

  if (success) {
    setTimeout(() => {
      const index = history.findIndex(item => item.url === url && item.timestamp === entry.timestamp)
      if (index !== -1) {
        history[index].success = false
        renderHistory()
      }
    }, 2000)
  }
}

function renderHistory() {
  historyDiv.innerHTML = history
    .map(
      item => `
      <div class="history-item ${item.success ? 'success' : ''}" onclick="navigator.clipboard.writeText('${item.url}')">
        ${item.url}
        ${item.success ? '<span class="checkmark">✓</span>' : ''}
      </div>
    `,
    )
    .join('')
}

async function processLink(url) {
  try {
    const urlObj = new URL(url)
    const rule = getDomainRule(url)

    if (!rule) return

    // Clear previous params
    paramsDiv.innerHTML = ''

    // Remove www subdomain
    if (urlObj.hostname.startsWith('www.')) {
      urlObj.hostname = urlObj.hostname.replace('www.', '')
    }

    // Handle Figma's special path rules
    if (rule.pathRules) {
      const pathType = urlObj.pathname.split('/')[1] // 'design' or 'proto'
      const pathRule = rule.pathRules[pathType]

      if (pathRule?.keepOnlyParams) {
        const params = new URLSearchParams(urlObj.search)
        urlObj.search = ''
        pathRule.keepOnlyParams.forEach(param => {
          if (params.has(param)) {
            urlObj.searchParams.set(param, params.get(param))
          }
        })
      }
    }
    // Handle path segments if specified in rule
    else if (rule.keepSegments) {
      const pathParts = urlObj.pathname.split('/')
      Object.entries(rule.keepSegments).forEach(([segment, action]) => {
        const segmentIndex = pathParts.indexOf(segment)
        if (segmentIndex !== -1 && action === 'next' && segmentIndex + 1 < pathParts.length) {
          urlObj.pathname = `/${segment}/${pathParts[segmentIndex + 1]}`
        }
      })
    }

    // Process regular params according to rule
    if (rule.removeParams) {
      rule.removeParams.forEach(param => urlObj.searchParams.delete(param))
    }

    if (rule.keepOnlyParams) {
      const params = new URLSearchParams(urlObj.search)
      urlObj.search = ''
      rule.keepOnlyParams.forEach(param => {
        if (params.has(param)) {
          urlObj.searchParams.set(param, params.get(param))
        }
      })
    }

    // Clear input and update history
    const processedUrl = urlObj.toString()
    linkInput.value = ''
    const success = await updateClipboard(processedUrl)
    addToHistory(processedUrl, success)
  } catch (e) {
    console.error(e)
  }
}

linkInput.addEventListener('paste', e => {
  e.preventDefault()
  const text = e.clipboardData.getData('text')
  setTimeout(() => processLink(text), 0)
})

document.getElementById('clearHistory').addEventListener('click', () => {
  history = []
  localStorage.removeItem('linkHistory')
  renderHistory()
})
