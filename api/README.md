# OpenAI Edge Function

Simple API wrapper for GPT-4 Optimized, deployed as a Vercel Edge Function.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`

## Local Development

```bash
npm start
```

Test endpoint at http://localhost:3000/api/openai

## Testing

```bash
curl -X POST http://localhost:3000/api/openai \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "model": "gpt-4o"
  }'
```

## Deploy

```bash
vercel env add OPENAI_API_KEY
vercel deploy
```
