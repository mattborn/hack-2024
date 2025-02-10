# Screener - Voice Interface Patterns

## Architecture Decisions
- Use vanilla JavaScript over frameworks for voice projects
- Leverage browser-native Web Speech API for voice features
- Follow patterns from existing voice projects (tellstack, talk-to-json)
- Use WaveSurfer.js for audio visualization
- Keep implementation simple and manually testable
- Separate interview content from application logic
  - Store scripted content (welcome, questions, etc.) in JSON
  - Allow LLM to generate dynamic responses for off-script interactions
  - Maintain hybrid approach: structured flow with AI flexibility
- Use OpenAI TTS instead of Web Speech API for voice output
  - Higher quality, more natural-sounding voice
  - Better suited for professional interview context
  - Consistent voice quality across browsers
  - Worth the API cost for improved candidate experience

## Core Technologies
- Web Speech API for voice input/output
- WaveSurfer.js for audio visualization
- Browser SpeechSynthesis for text-to-speech
- Local storage for session persistence

## Development Workflow
- Implement and test features individually
- Manual browser testing for voice features
- Verify audio visualization before adding complexity
- Test voice recognition in isolation

## Reference Projects
- tellstack: Audio recording patterns
- talk-to-json: Transcription handling

