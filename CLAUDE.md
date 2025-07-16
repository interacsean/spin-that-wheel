# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Spin that Wheel" is a React-based web application for Comedy Roulette, a live comedy show. It features a spinning wheel game with multiple presentation screens, keyboard controls for live operation, and Firebase integration for remote item management.

## Development Commands

- **Development server**: `npm run dev` - Starts Vite dev server with hot reload
- **Build**: `npm run build` - Runs TypeScript compiler and Vite build
- **Lint**: `npm run lint` - ESLint with TypeScript, fails on warnings
- **Deploy**: `npm run deploy` - Deploys to comedyroulette.surge.sh via Surge
- **Preview build**: `npm run preview` - Preview production build locally

## Architecture

### Core State Management
The application's state is centralized in `src/components/App/App.tsx` with these key states:
- **Screen states**: Ambient, OnStage, Like, Social, Break, End, Wheel, Settings
- **Wheel states**: Spinning, Rest
- **Audio states**: WheelAudio, OneOff, Silent
- **Items management**: Tracks available items, current item, and items to discard

### Key Components
- **App** (`src/components/App/`): Main orchestrator handling screens, state, and keyboard shortcuts
- **Wheel** (`src/components/Wheel/`): Canvas-based spinning wheel with physics calculations
- **AssetLoader**: Preloads all assets to ensure smooth performance during live shows
- **AudioPlayer** (`src/services/local-media/`): Manages sound effects and music playback

### Firebase Integration
- Configuration in `src/services/db/firestore.ts`
- Remote items synced via `useRemoteItems` hook
- Updates persisted to Firestore collection `items/list`

### Keyboard Controls
Extensive keyboard shortcuts managed through `useKeyAction` hook:
- `s`: Spin the wheel
- `w`: Show wheel screen
- `1-4`: Navigate to different screens
- `b`: Fade out audio
- `f/F`: Fade in/out wheel opacity
- `h`: Hide wheel (go to ambient)
- `x/k`: Discard selected item
- `_`: Reset all items
- `\`: Settings screen

### Audio System
- Multiple "jaja" sound variations (jaja-1.mp3 through jaja-5.mp3)
- Benny Hill theme variations for wheel spinning
- Random track selection on each spin
- Fade in/out controls with configurable rates

## Important Implementation Details

1. **Canvas Rendering**: The wheel uses direct canvas manipulation for performance. When modifying wheel visuals, work in `src/components/Wheel/Wheel.tsx`

2. **Item Management**: Items are newline-separated strings stored in Firebase. The app trims whitespace and filters empty lines.

3. **Wake Lock**: Prevents screen sleep during shows using the Wake Lock API

4. **Deployment**: Uses Surge with a custom 200.html for client-side routing support

5. **Spotify Integration**: Experimental cross-tab control requires manual console script injection (see README.md)

## Current Development Focus

Based on TODO.md, these features are pending:
- Double-keyboard shortcut for reset all items
- Stage-ready graphics improvements (indicator, colors, borders)
- Randomized audio selection for wheel spins

## Testing

No test framework is currently configured. When adding tests, you'll need to set up a testing framework (Jest/Vitest recommended for Vite projects).