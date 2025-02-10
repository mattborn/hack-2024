# Screener - AI-Powered Interview Assistant

## Overview
Screener is a web application that automates initial phone screen interviews, replacing traditional recruiter-led screening processes. It uses voice interaction, LLM technology, and real-time transcription to conduct and analyze candidate interviews.

## Core Features (MVP)

### Voice Interface
- Real-time voice interaction with candidates using Web Speech API
- Natural language processing for dynamic conversation flow
- Browser-native text-to-speech for interviewer questions
- Browser-native speech-to-text for candidate responses
- WaveSurfer.js for audio visualization

### Interview Management
- Single page application with vanilla JavaScript
- Real-time transcription display
- Automatic follow-up question generation
- Email sharing functionality
- Session transcript export

### Technical Requirements
- Web Speech API for voice input/output
- OpenAI GPT-4 API for conversation intelligence
- WaveSurfer.js for audio visualization
- Simple email integration for sharing

## Setup Requirements

### API Keys Required
- OpenAI API key for LLM functionality

### Development Environment
```bash
# Node.js version
node >= 18.0.0

# Package manager
npm

# Required global dependencies
none
```

### Installation
```bash
npm install
```

### Environment Variables
```
OPENAI_API_KEY=your_key_here
```

## Architecture

### Frontend
- Vanilla HTML, CSS, JavaScript
- Web Speech API for voice interaction
- WaveSurfer.js for audio visualization
- Local Storage for session persistence

### Backend
- Serverless functions for OpenAI API integration
- Simple email service integration

## Development Roadmap

### Phase 1: Voice Interface
- [ ] Implement basic voice recording with WaveSurfer.js
- [ ] Add real-time transcription with Web Speech API
- [ ] Integrate text-to-speech for interviewer
- [ ] Build conversation flow manager

### Phase 2: LLM Integration
- [ ] Connect OpenAI API
- [ ] Implement dynamic question generation
- [ ] Add response analysis
- [ ] Create interview scoring system

### Phase 3: Sharing
- [ ] Email integration
- [ ] Transcript formatting
- [ ] Session link generation
- [ ] PDF export option

## Security Considerations
- Secure handling of interview transcripts
- Client-side only storage of session data
- Secure API key management
- Time-limited sharing links

## License
This project is licensed under the MIT License - see the LICENSE file for details.
