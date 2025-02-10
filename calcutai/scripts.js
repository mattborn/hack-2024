let currentDate = new Date()

function formatDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const period = hours >= 12 ? 'p' : 'a'
  const displayHours = hours % 12 || 12

  // Add 25 minutes for end time
  const endMinutes = minutes + 25

  return `${displayHours}:${minutes.toString().padStart(2, '0')}–${displayHours}:${endMinutes
    .toString()
    .padStart(2, '0')}${period}`
}

function getDateStr(date) {
  return date
    .toLocaleDateString('en-CA', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '-')
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    do {
      currentDate.setDate(currentDate.getDate() + (e.key === 'ArrowLeft' ? -1 : 1))
    } while (currentDate.getDay() === 0 || currentDate.getDay() === 6)
    loadData()
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    const blocks = Array.from(document.querySelectorAll('.time-block'))
    const activeBlock = document.querySelector('.time-block.active')
    const currentIndex = blocks.indexOf(activeBlock)
    let newIndex

    if (e.key === 'ArrowUp') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : blocks.length - 1
    } else {
      newIndex = currentIndex < blocks.length - 1 ? currentIndex + 1 : 0
    }

    if (blocks[newIndex]) {
      activateBlock(blocks[newIndex])
      blocks[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
})

function activateBlock(block) {
  document.querySelectorAll('.time-block.active').forEach(el => el.classList.remove('active'))
  block.classList.add('active')
}

function saveState() {
  const blocks = Array.from(document.querySelectorAll('.time-block'))
  const data = blocks.map(block => ({
    start: block.dataset.time,
    project: block.querySelector('.project').textContent,
    task: block.querySelector('.task').textContent,
    result: block.dataset.result || undefined,
  }))
  localStorage.setItem(`calcutai-${getDateStr(currentDate)}`, JSON.stringify(data))
}

function renderItems(data) {
  const timeBlocksEl = document.getElementById('time-blocks')
  document.getElementById('current-date').textContent = formatDate(currentDate)

  // Separate items into categories
  const categories = {
    early: data.filter(item => item.start && parseInt(item.start) < 9),
    nine: data.filter(item => item.start && parseInt(item.start) >= 9 && parseInt(item.start) < 12),
    noon: data.filter(item => item.start && parseInt(item.start) >= 12 && parseInt(item.start) < 15),
    three: data.filter(item => item.start && parseInt(item.start) >= 15),
    ideas: data.filter(item => !item.start),
  }

  // Create HTML for each category
  let html = ''

  // Early section (conditional)
  if (categories.early.length > 0) {
    html += `<h2>early</h2>${renderTimeBlocks(categories.early)}`
  }

  // Main sections (always visible)
  html += `
    <h2>nine</h2>${renderTimeBlocks(categories.nine)}
    <h2>noon</h2>${renderTimeBlocks(categories.noon)}
    <h2>three</h2>${renderTimeBlocks(categories.three)}
  `

  // Ideas section (conditional)
  if (categories.ideas.length > 0) {
    html += `<h2>ideas</h2>${renderTimeBlocks(categories.ideas)}`
  }

  timeBlocksEl.innerHTML = html

  // Add click listeners to the newly created blocks
  timeBlocksEl.querySelectorAll('.time-block').forEach(block => {
    block.addEventListener('click', () => activateBlock(block))
  })

  // Mark past blocks
  const now = new Date()
  if (currentDate.toDateString() === now.toDateString()) {
    timeBlocksEl.querySelectorAll('.time-block').forEach(block => {
      const [hours] = block.dataset.time?.split(':') || []
      if (hours) {
        const blockTime = new Date()
        blockTime.setHours(hours, 0)
        if (blockTime < now) {
          block.classList.add('past')
        }
      }
    })
  }
}

// Helper function to render time blocks
function renderTimeBlocks(items) {
  return items
    .map(item => {
      return `
        <div class="time-block" ${item.start ? `data-time="${item.start}"` : ''}${
        item.result ? ` data-result="${item.result}"` : ''
      }>
          ${item.start ? `<div class="time-range">${formatTime(item.start)}</div>` : '<div></div>'}
          <div class="project">${item.project}</div>
          <div class="task">${item.task}</div>
        </div>
      `
    })
    .join('')
}

async function loadData() {
  try {
    const dateStr = getDateStr(currentDate)
    const stored = localStorage.getItem(`calcutai-${dateStr}`)
    if (stored) {
      renderItems(JSON.parse(stored))
      return
    }

    const response = await fetch(`example/${dateStr}.json`)
    const data = await response.json()
    renderItems(data)
  } catch (error) {
    console.error('Error loading data:', error)
    renderItems([])
  }
}

document.getElementById('download').addEventListener('click', () => {
  const data = JSON.parse(localStorage.getItem(`calcutai-${getDateStr(currentDate)}`))
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${getDateStr(currentDate)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
})

document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Reset all changes?')) {
    localStorage.removeItem(`calcutai-${getDateStr(currentDate)}`)
    loadData()
  }
})

document.getElementById('quick-entry').addEventListener('submit', e => {
  e.preventDefault()
  const input = e.target.querySelector('input')
  const [project, ...taskParts] = input.value.split(',')
  const task = taskParts.join(',').trim()

  if (project && task) {
    const stored = localStorage.getItem(`calcutai-${getDateStr(currentDate)}`)
    const data = stored ? JSON.parse(stored) : []
    data.push({
      start: null,
      project: project.trim(),
      task,
    })
    localStorage.setItem(`calcutai-${getDateStr(currentDate)}`, JSON.stringify(data))
    renderItems(data)
    input.value = ''
  }
})

loadData()
