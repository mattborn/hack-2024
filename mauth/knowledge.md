# Mauth Project

## Overview
Simple Jamstack app that authenticates with GitHub via Clerk and displays repo metadata.

## Setup Required
1. Create a Clerk application and get your publishable key
2. Add the key to the data-clerk-publishable-key attribute in index.html
3. Enable GitHub OAuth in Clerk dashboard
4. Configure GitHub OAuth scopes to include repo access

## Architecture
- Pure vanilla JS/HTML/CSS
- Uses Clerk for auth
- Stores repo data in memory
- No build step required

## Security Notes
- GitHub token handled securely via Clerk
- No sensitive data stored locally

## Important Implementation Notes
- Use Clerk's async script tag with data-clerk-publishable-key attribute
- Must handle async script loading with a wait function
- No manual Clerk.init needed when using data-clerk-publishable-key
- Clerk script should be loaded before any code that uses it
