# Gmail Unspam Utility

## Setup Required
1. Copy credentials.json from gfux/ directory
2. Enable Gmail API in Google Cloud Console if not already enabled
3. Place credentials.json in project root
4. Create .env file with necessary environment variables

## Technical Constraints 
- Gmail API limits results to 500 emails per request
- OAuth flow requires credentials.json from Google Cloud Console
- Must use same OAuth setup as gfux/ project for credential sharing
- Express server handles both static files and API endpoints
- Token-based authentication persists between sessions

## Security Notes
- credentials.json and token.json should be in .gitignore
- Never commit .env file
- OAuth tokens are project-specific but credentials can be shared

## Usage
```bash
node index.js
```
Then visit http://localhost:3000
