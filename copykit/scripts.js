document.getElementById('run-button').addEventListener('click', async () => {
  const prompt = document.getElementById('prompt').value;
  const inputJson = document.getElementById('input-json').value;
  const outputElement = document.getElementById('output-json');
  
  try {
    // Validate JSON input
    const parsedInput = JSON.parse(inputJson);
    
    // TODO: Replace with actual API call
    const mockResponse = {
      ...parsedInput,
      processed: true,
      timestamp: new Date().toISOString()
    };
    
    outputElement.textContent = JSON.stringify(mockResponse, null, 2);
  } catch (error) {
    outputElement.textContent = `Error: ${error.message}`;
  }
});

// Add syntax highlighting to JSON input
document.getElementById('input-json').addEventListener('input', (e) => {
  try {
    const parsed = JSON.parse(e.target.value);
    e.target.style.color = 'var(--color-gray-900)';
  } catch (error) {
    e.target.style.color = 'red';
  }
});
