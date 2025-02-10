# LinkTink

A minimal URL cleaner and parameter manager that:
- Automatically identifies domains and applies rules
- Removes tracking parameters
- Provides controls for meaningful parameters
- Copies cleaned URLs to clipboard automatically

## Usage

1. Paste a URL into the input field
2. URL is automatically cleaned based on domain rules
3. Adjust parameters using the generated controls
4. Modified URL is automatically copied to clipboard

## Supported Domains

- YouTube (removes tracking, keeps video ID and timestamp)
- Spotify (removes tracking parameters)
- Amazon (keeps only product ID)
- Figma (provides controls for node ID and view mode)

Add more domains and rules by editing `rules.js`.
