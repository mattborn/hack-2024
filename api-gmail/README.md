# Gmail Pull

A minimal CLI tool to pull Gmail messages into a JSON file.

## Setup

1. Create a Google Cloud project and enable Gmail API
2. Download credentials.json from Google Cloud Console
3. Place credentials.json in project root
4. Install dependencies: `npm install`

## Usage

```bash
# Pull last 100 emails (default)
node pull.js

# Pull specific number of emails
node pull.js 500
```

Output is saved to emails.json in the current directory.
