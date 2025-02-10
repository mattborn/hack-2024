// Testing guide steps
const guideSteps = [
  {
    title: "Calibration Setup",
    content: "First, we'll calibrate the load cell to ensure accurate force measurements."
  },
  {
    title: "Initial Testing",
    content: "We'll start with low assist levels and verify basic functionality."
  },
  {
    title: "Power Testing",
    content: "Gradually increase power while monitoring system response."
  },
  {
    title: "Safety Verification",
    content: "Test all safety features including emergency cutoff."
  }
]

let currentStep = 0
let readings = {
  zero: null,
  weight: null
}

// Initialize
function init() {
  renderGuide()
  setupEventListeners()
}

function renderGuide() {
  const guide = guideSteps[currentStep]
  document.querySelector('.guide-content').innerHTML = `
    <h2>${guide.title}</h2>
    <p>${guide.content}</p>
  `
  
  document.getElementById('prevStep').disabled = currentStep === 0
  document.getElementById('nextStep').disabled = currentStep === guideSteps.length - 1
}

function setupEventListeners() {
  // Guide navigation
  document.getElementById('prevStep').addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--
      renderGuide()
    }
  })

  document.getElementById('nextStep').addEventListener('click', () => {
    if (currentStep < guideSteps.length - 1) {
      currentStep++
      renderGuide()
    }
  })

  // Testing controls
  document.getElementById('assistLevel').addEventListener('input', e => {
    document.getElementById('assistValue').textContent = `${e.target.value}%`
    logSetting('Assist Level', `${e.target.value}%`)
  })

  document.getElementById('forceThreshold').addEventListener('input', e => {
    const force = (e.target.value / 10).toFixed(1)
    document.getElementById('forceValue').textContent = `${force} kg`
    logSetting('Force Threshold', `${force} kg`)
  })

  document.getElementById('maxSpeed').addEventListener('input', e => {
    document.getElementById('speedValue').textContent = `${e.target.value}.0 km/h`
    logSetting('Max Speed', `${e.target.value} km/h`)
  })
}

function logReading(type) {
  const mockReading = type === 'zero' ? 8420 : 84932
  readings[type] = mockReading

  if (type === 'weight') {
    const weight = document.getElementById('testWeight').value
    const factor = ((readings.weight - readings.zero) / weight).toFixed(1)
    
    document.getElementById('calibrationResult').innerHTML = `
      <p>Calibration Factor: ${factor}</p>
      <p>Update CALIBRATION_FACTOR in lope.ino to this value</p>
      <button onclick="startTesting()">Start Testing Phase</button>
    `
  }

  addLogEntry(`Recorded ${type} reading: ${mockReading}`, 'success')
}

function startTesting() {
  document.getElementById('calibration').style.display = 'none'
  document.getElementById('testing').style.display = 'block'
  document.getElementById('phase').textContent = 'Testing'
}

function logSetting(name, value) {
  addLogEntry(`Updated ${name}: ${value}`)
}

function addLogEntry(message, type = '') {
  const entry = document.createElement('div')
  entry.className = `log-entry ${type}`
  entry.innerHTML = `
    <div>${message}</div>
    <small>${new Date().toLocaleTimeString()}</small>
  `
  
  const logEntries = document.getElementById('logEntries')
  logEntries.insertBefore(entry, logEntries.firstChild)
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init)
