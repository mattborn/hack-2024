async function loadTemplate(name) {
  const response = await fetch(`${name}/index.html`)
  const html = await response.text()
  return html
}

async function loadReadme(name) {
  const response = await fetch(`${name}/README.md`)
  const text = await response.text()
  const lines = text.split('\n')
  return {
    title: lines[0].replace('# ', ''),
    description: lines[2],
  }
}

document.querySelectorAll('.template').forEach(async template => {
  const name = template.dataset.template
  const { title, description } = await loadReadme(name)
  const html = await loadTemplate(name).then(code => code.replace(/</g, '&lt;').replace(/>/g, '&gt;'))

  template.innerHTML = `
    <h2>${title}</h2>
    <p>${description}</p>
    <pre><code class="language-markup">${html}</code></pre>
    <button class="copy">Copy</button>
  `

  Prism.highlightElement(template.querySelector('code'))
})

document.addEventListener('click', e => {
  if (e.target.matches('.copy')) {
    const code = e.target.previousElementSibling.textContent
    navigator.clipboard.writeText(code)

    e.target.textContent = 'Copied!'
    setTimeout(() => {
      e.target.textContent = 'Copy'
    }, 2000)
  }
})
