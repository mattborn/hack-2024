let data = null
let currentStep = 0
let currentUsage = 0

async function loadData() {
  const response = await fetch('data.json')
  data = await response.json()
  renderGuide()
  renderDevices()
  updateRateInfo()
  startUsageSimulation()
}

function renderGuide() {
  const guide = data.guide[currentStep]
  document.querySelector('.guide-content').innerHTML = `
    <h2>${guide.title}</h2>
    <p>${guide.content}</p>
  `
  
  document.getElementById('prevStep').disabled = currentStep === 0
  document.getElementById('nextStep').disabled = currentStep === data.guide.length - 1
}

function renderDevices() {
  const deviceList = document.getElementById('deviceList')
  deviceList.innerHTML = data.devices.map(device => `
    <div class="device">
      <span class="device-name">${device.name}</span>
      <span class="device-usage">${device.baseloadKw.toFixed(1)} kW</span>
    </div>
  `).join('')
}

function updateRateInfo() {
  const hour = new Date().getHours()
  const isPeak = data.rates.peakHours.includes(hour)
  const rate = isPeak ? data.rates.peak : data.rates.offPeak
  
  document.getElementById('rateInfo').innerHTML = `
    <p>Current rate: $${rate.toFixed(2)}/kWh</p>
    <p>${isPeak ? '⚠️ Peak hours' : '✓ Off-peak hours'}</p>
  `
}

function startUsageSimulation() {
  // Simulate real-time usage updates
  setInterval(() => {
    const baseload = data.devices.reduce((sum, device) => sum + device.baseloadKw, 0)
    const variation = Math.sin(Date.now() / 10000) * 2 // Add some natural variation
    currentUsage = Math.max(0, baseload + variation)
    document.getElementById('kw').textContent = currentUsage.toFixed(1)
  }, 1000)
  
  // Update rate info every minute
  setInterval(updateRateInfo, 60000)
}

// Event Listeners
document.getElementById('prevStep').addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep--
    renderGuide()
  }
})

document.getElementById('nextStep').addEventListener('click', () => {
  if (currentStep < data.guide.length - 1) {
    currentStep++
    renderGuide()
  }
})

// Initialize
loadData()
