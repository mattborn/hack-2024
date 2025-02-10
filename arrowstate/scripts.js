const state = {
  current: 0,
  items: [],
}

const loadStates = async () => {
  try {
    const response = await fetch('example.json')
    state.items = await response.json()
    setupPreviewElements()
    renderState()
  } catch (error) {
    console.error('Error loading states:', error)
  }
}

const setupPreviewElements = () => {
  const preview = document.querySelector('.preview')

  state.items.forEach((item, index) => {
    const container = document.createElement('div')
    container.classList.add('state-preview')
    container.dataset.state = index

    const title = document.createElement('h2')
    title.textContent = item.title

    const desc = document.createElement('p')
    desc.textContent = item.description

    container.appendChild(title)
    container.appendChild(desc)
    preview.appendChild(container)
  })
}

const renderState = () => {
  const currentState = state.items[state.current]
  if (!currentState) return

  // Update JSON view
  document.querySelector('.state').innerHTML = `<pre><code class="language-json">${JSON.stringify(
    currentState,
    null,
    2,
  )}</code></pre>`
  Prism.highlightAll()

  // Show current state preview, hide others
  document.querySelectorAll('.state-preview').forEach((el, index) => {
    el.style.display = index === state.current ? 'block' : 'none'
  })
}

const handleKeyPress = e => {
  if (e.key === 'ArrowLeft' && state.current > 0) {
    state.current--
    renderState()
  } else if (e.key === 'ArrowRight' && state.current < state.items.length - 1) {
    state.current++
    renderState()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', handleKeyPress)
  loadStates()
})
