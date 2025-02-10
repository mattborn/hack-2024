const { OpenAI } = require('openai')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST!' })
  }

  try {
    const { messages, model = 'gpt-4o' } = req.body

    const completion = await openai.chat.completions.create({
      model,
      messages,
    })

    res.status(200).json(completion.choices[0].message)
  } catch (error) {
    console.error('OpenAI API error:', error)
    res.status(500).json({ error: error.message })
  }
}
