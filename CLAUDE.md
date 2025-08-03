# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based Buddhist chant counter application (念佛计数器) that helps users count their Buddhist chants with multiple modes: keyboard/wooden fish mode, metronome mode, and Buddha light meditation mode.

## Development Commands

Since this is a static web application, no build process is required. To develop:

1. **Serve locally**: Use any static server (e.g., `python -m http.server 8000` or `npx serve .`)
2. **Test in browser**: Open `index.html` in a modern browser (Chrome, Edge, Safari, Firefox)

## Architecture

### Core Components

- **BuddhistChantCounter Class** (`app.js`): Main application logic handling counting and various modes
- **Keyboard/Wooden Fish Mode**: Manual counting with keyboard input and wooden fish sound effects
- **Metronome Mode**: Automatic counting at a set tempo
- **Buddha Light Mode**: Meditation mode with visual effects
- **Local Storage**: Persists counts across browser sessions

### Key Features

1. **Multiple Modes**: Three distinct modes for different practice preferences
2. **Wooden Fish Sound**: Authentic wooden fish sound effect for immersive experience
3. **Visual Effects**: Buddha light effects, lotus flower growth, and combo animations
4. **Focus Mode**: Distraction-free practice with automatic rhythm detection
5. **Offerings System**: Virtual offerings of water, flowers, and lamps
6. **Persistence**: Automatic save/load of counts using localStorage

### Application Flow

1. User selects a mode (Keyboard, Metronome, or Buddha Light)
2. In Keyboard mode: User presses keys to simulate wooden fish hits
3. In Metronome mode: Automatic counting at set BPM
4. In Buddha Light mode: Meditation with visual effects
5. Counts are incremented based on mode rules (e.g., 4 hits = 1 chant)
6. UI updates with animations and visual feedback
7. Counts and offerings are persisted to localStorage

## Code Patterns

### Mode Handling
- Mode switching with proper cleanup of previous mode
- Keyboard mode with rhythm recording and auto-play in focus mode
- Metronome with adjustable BPM (30-480)
- Buddha Light with adjustable frequency and intensity

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

- Modern browser with Web Audio API support
- JavaScript enabled
- Recommended: Chrome, Edge, Safari, or Firefox for best compatibility

## File Structure

- `index.html`: Main application interface
- `app.js`: Core JavaScript functionality
- `styles.css`: Styling and responsive design
- `amituofo.jpg`: Buddha image for visual appeal