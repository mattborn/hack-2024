function addRow() {
  const row = document.createElement('div')
  row.className = 'row'
  row.innerHTML = `
    <input type="number" placeholder="Rate" onchange="calculate()">
    <input type="number" placeholder="Hours" onchange="calculate()">
    <label>
      <input type="checkbox" onchange="calculate()"> Billable
    </label>
    <button onclick="this.parentElement.remove(); calculate()">Remove</button>
  `
  document.getElementById('rows').appendChild(row)
}

function calculate() {
  let billable = 0
  let nonBillable = 0
  
  document.querySelectorAll('.row').forEach(row => {
    const rate = Number(row.children[0].value) || 0
    const hours = Number(row.children[1].value) || 0
    const isBillable = row.querySelector('input[type="checkbox"]').checked
    const amount = rate * hours
    
    if (isBillable) billable += amount
    else nonBillable += amount
  })
  
  document.getElementById('billable').textContent = billable.toFixed(2)
  document.getElementById('non-billable').textContent = nonBillable.toFixed(2)
  document.getElementById('total').textContent = (billable + nonBillable).toFixed(2)
}

// Add initial row
addRow()
