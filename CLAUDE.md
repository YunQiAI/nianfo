# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based Buddhist chant counter application (念佛计数器) that uses speech recognition to automatically count chants like "阿弥陀佛". The application runs entirely in the browser and uses the Web Speech API for real-time speech recognition.

## Development Commands

Since this is a static web application, no build process is required. To develop:

1. **Serve locally**: Use any static server (e.g., `python -m http.server 8000` or `npx serve .`)
2. **Test in browser**: Open `index.html` in a modern browser with speech recognition support (Chrome, Edge, Safari)

## Architecture

### Core Components

- **BuddhistChantCounter Class** (`app.js`): Main application logic handling speech recognition and counting
- **Speech Recognition Engine**: Uses Web Speech API (`webkitSpeechRecognition` or `SpeechRecognition`)
- **Pattern Matching**: Regex patterns to identify Buddhist chants in Chinese speech
- **Local Storage**: Persists counts across browser sessions

### Key Features

1. **Speech Recognition**: Continuous listening with interim and final results processing
2. **Duplicate Prevention**: Cooldown period and processed text tracking to avoid double-counting
3. **Pattern Recognition**: Supports multiple Buddhist chant patterns (阿弥陀佛, 南无阿弥陀佛, etc.)
4. **Real-time Updates**: Live transcript and count updates with visual feedback
5. **Persistence**: Automatic save/load of counts using localStorage

### Application Flow

1. User clicks "开始识别" to start speech recognition
2. Speech input is processed through `processContinuousText()` and `processInterimText()`
3. Text is matched against chant patterns using regex
4. Counts are incremented with cooldown protection
5. UI updates with animations and transcript logging
6. Counts are persisted to localStorage

## Code Patterns

### Speech Recognition Handling
- Continuous recognition with automatic restart
- Separate processing for interim and final results
- Error handling for various speech recognition states
- Cooldown mechanism to prevent duplicate counting

### UI Updates
- Animated count changes with CSS transforms
- Status indicators for recognition state
- Real-time transcript with timestamp logging
- Responsive design for mobile devices

### Data Management
- Simple object-based state management
- localStorage for persistence
- Set-based duplicate text tracking
- Automatic cleanup of old processed texts

## Browser Requirements

- Modern browser with Web Speech API support
- Chinese language support for speech recognition
- Microphone access permissions required
- Recommended: Chrome, Edge, or Safari for best compatibility

## File Structure

- `index.html`: Main application interface
- `app.js`: Core JavaScript functionality
- `styles.css`: Styling and responsive design
- `amituofo.jpg`: Buddha image for visual appeal