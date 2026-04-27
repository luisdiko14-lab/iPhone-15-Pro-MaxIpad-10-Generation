# iOS Settings App Replica

## Overview

A comprehensive web-based iOS ecosystem simulator that replicates the iPhone experience in the browser. The project includes a home screen launcher, an iOS-style settings interface with many sub-pages (Wi-Fi, Bluetooth, Battery, Display, Cellular, Notifications, Focus, etc.), authentication flows, an App Store mock, and several mini-apps such as Calculator, Camera, Mail, Music, Files, Phone/Call, Siri, a 2048 mini-game (built in React via CDN), Game Center, and a Discord clone. It is primarily an educational/demo project showcasing iOS-style UI patterns and client-side interactivity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Multi-Page Application**: Each iOS feature is its own static HTML page (e.g., `homescreen.html`, `home.html` for settings, `auth.html`, `app-store.html`, plus settings pages like `wifi.html`, `bluetooth.html`, `battery.html`, etc.).
- **Component-Based JavaScript**: ES6 classes encapsulate per-page functionality (e.g., `HomeScreen`, `SettingsHome`, `BluetoothSettings`, `BatterySettings`), with each page having a dedicated JS file matching its HTML name.
- **Mobile-First Design**: CSS mimics iOS interface patterns including grouped rows, chevron indicators, toggle switches, status bars, and home indicators.
- **Event-Driven Interactions**: DOM event handlers manage user input, including touch feedback, form validation, and simulated haptics.

### Design System
- **CSS Custom Properties**: Centralized theming via CSS variables (`--bg-primary`, `--text-primary`, `--accent-blue`, etc.) defined across multiple stylesheets.
- **Dark Theme Default**: Authentic iOS dark mode color palette optimized for mobile viewing.
- **iOS Design Language**: Replicates native iOS Settings appearance with consistent typography, spacing, and visual cues.
- **Shared and Page-Specific Styles**: `settings-page.css` provides shared styling for settings sub-pages; pages may also include their own dedicated CSS (e.g., `home.css`, `homescreen.css`, `mail.css`, `discord.css`, `gamecenter.css`, `installer.css`, `iOS_update.css`).

### Data Management
- **Client-Side State Only**: All persistence uses browser `localStorage`.
- **Per-Feature Storage Keys**: Settings saved with descriptive keys (e.g., `bluetoothEnabled`, `wifiNetworks`, `profileName`, `batteryPercentage`, `appearance`).
- **Form Validation**: Real-time input validation with visual feedback.
- **Session Persistence**: Authentication state persists across page reloads.

### Shared Device State (`device-state.js`)
- **Single source of truth** for time, battery, charging, Wi-Fi/Bluetooth/Airplane mode, brightness, volume, and carrier.
- Auto-loaded on every page that has a status bar; updates every `.time`, `.battery`, and date `.carrier` element automatically each second.
- **Battery simulation**: drains ~1% per ~25s; when plugged in, charges ~1% per ~1.5s. Elapsed time is applied between page loads (state stays accurate even after navigation).
- **Auto-charge screen**: when battery hits 0%, the page redirects to `charging.html` (the iconic empty-battery screen with a "Plug in charger" button). After plugging in, the user sees a live charging animation, then unplugs to return to the home screen.
- **Public API**: `window.iOSDevice.getState()`, `setCharging()`, `setBattery()`, `setCarrier()`, `setWifi()`, `setBluetooth()`, `setAirplane()`, `setBrightness()`, `setVolume()`, `forceUpdate()`.
- Persisted under `localStorage` key `iosDeviceState`.

### Control Center (Home Screen)
- Tap the top-right edge of the home screen (or swipe down from the top on touch) to open a translucent Control Center overlay.
- Includes Airplane/Wi-Fi/Bluetooth/Charger pill toggles, a battery card with a one-tap "Plug in charger" button, plus brightness and volume sliders. Brightness applies a real dimming overlay in the page.

### Navigation Pattern
- **Page-Based Navigation**: Each settings category and app is a separate HTML file.
- **iOS-Style Back Navigation**: Consistent back-button pattern using `window.location.href` or `window.history.back()`.
- **Home Screen Launcher**: `homescreen.html` is the primary entry point with app icons that open features.
- **Installer/Setup Flow**: `index.html` / `installer.html` simulate an OS installer that routes to the iOS or Windows setup experience.

### File Organization
- **HTML Files**: One per feature/page.
- **CSS Files**: A mix of shared (`settings-page.css`, `home.css`, `homescreen.css`, `charging.css`) and page-specific stylesheets.
- **JS Files**: One per page, named to match the HTML file. `device-state.js` is the cross-page shared state script.
- **Working Apps**: `notes.html` (notes app with autosave), `calculator.html` (full iOS calculator), `call.html` (full phone app — see below), `camera.html` (webcam), `music.html`, `weather.html`, `siri.html` (smart offline Siri — see below), `game.html` (React-powered 2048 game). All are wired into the home screen launcher.
- **Charging Flow**: `charging.html` + `charging.css` + `charging.js` render the empty-battery / plug-in / charging animation when battery reaches 0%.
- **Python Stub**: `main.py` exists as a minimal placeholder and is not central to the application.
- **TypeScript Helper**: `discord_setup.ts` documents Discord OAuth2 configuration but is not part of a build pipeline.

### Phone App (`call.html`)
- Full iOS-style phone with a 5-tab bottom bar: Favorites, Recents, Contacts, Keypad, Voicemail.
- Keypad uses Web Audio API to synthesize **real DTMF tones** (the dual-tone frequencies actual phones use) on each key press.
- Quick-call from any contact, favorite, or recent. The active call screen shows caller avatar (auto-colored by name), name, number, status ("Calling…" → "Ringing…" → live timer), and 6 control buttons (mute, keypad, speaker, add call, FaceTime, contacts) plus a red end-call button.
- Recents are persisted in `localStorage` (`phoneRecents`) and auto-update with every call. Voicemails (`phoneVoicemails`) and contacts (`phoneContacts`) also persist with sensible seed data.

### Siri (`siri.html` / `siri.js`)
- Three-mode assistant with a **model selector** at the top: **⚡ Offline**, **🧠 Groq**, **✨ Gemini**. Selection persisted to `localStorage` (`siriModel`).
- **Offline**: pattern matches for time, date, battery, Wi-Fi/Bluetooth, weather (mock), jokes, fortunes, dice, coin flips, math, and friendly fallbacks. No network needed.
- **Groq**: calls Flask proxy `/api/siri/groq` which uses `GROQ_SECRET` to hit Groq's `llama-3.1-8b-instant` (very fast, free tier friendly).
- **Gemini**: calls Flask proxy `/api/siri/gemini` which uses `GEMINI_SECRET` to hit Google's `gemini-2.0-flash-lite`.
- Both AI calls send the last 6 conversation turns as context so Siri remembers what you just said. Server-side `SIRI_SYSTEM_PROMPT` keeps replies short, conversational, no markdown (so they speak nicely).
- **Local intents always run first** before any AI call — "open Calculator", "plug in charger", etc. work in any mode and never waste an API call.
- **Auto-fallback**: if Groq/Gemini errors out (network, quota, etc.), Siri quietly falls back to the offline answer with a "(model unavailable)" note appended.
- **Availability check**: on load, `/api/siri/status` returns which keys are configured; missing models are shown with a 🔒 lock and disabled.
- Uses the browser's **SpeechRecognition API** for voice input and **SpeechSynthesis API** to speak responses out loud.
- Animated Siri orb (multicolor conic gradient with pulsing rings) reflects state: idle / listening / thinking / speaking.
- Suggestion chips, transcript display, and a 12-item conversation history persisted to `localStorage`.

### Server-side AI Proxy (`server.py`)
- New Flask routes added: `POST /api/siri/groq`, `POST /api/siri/gemini`, `GET /api/siri/status`.
- API keys (`GROQ_SECRET`, `GEMINI_SECRET`) are read from environment **server-side only** and never exposed to the browser.
- Both endpoints accept `{question, history}` JSON, prepend the shared `SIRI_SYSTEM_PROMPT`, replay the last 6 conversation turns as context, call the upstream API with a 20-second timeout, and return `{reply, model}` or `{error, detail}`.

### Mini Game (`game.html` — React)
- Full **2048** implementation using **React 18 + ReactDOM via CDN** (loaded from unpkg, no build pipeline). Demonstrates that React can be used in this app without rewriting the existing pages.
- Self-contained `game.js` uses `React.createElement` (no JSX/Babel needed for speed). All game state managed via `useState`/`useEffect`/`useCallback`/`useRef`.
- Supports keyboard arrows, WASD, swipe gestures, and an on-screen D-pad. Tracks best score in `localStorage` (`game2048Best`). Includes win and game-over overlays.

### Installer Flow (`installer.html`)
- 5-step guided setup with a step-dot indicator: Drive selection → iOS version → Region → License agreement → Installation.
- Drive list shows multiple realistic drives with status tags (Recommended/Slow/Insufficient Space/Offline) and disk-usage bars.
- Installation simulation streams a live log window (green-on-black "[time] phase: message" lines), plus live metrics for transfer speed, ETA, and file count.

## External Dependencies

### Browser APIs Used
- **Local Storage API**: Persists user configuration and settings data.
- **DOM API**: Dynamic UI updates, event handling, and interface manipulation.
- **Vibration API**: Haptic feedback simulation on toggles and buttons.
- **MediaDevices API (getUserMedia)**: Camera access for the camera feature (`camera.js`).
- **Fetch API**: Used to call external services (e.g., Groq) from client-side scripts.

### Third-Party Services
- **Groq API**: Used in `discord.js` for AI-powered bot replies in the Discord clone feature (API key is currently embedded client-side, which is not secure for production use).
- **Discord OAuth2 (planned/configured)**: `discord_setup.ts` documents intended OAuth setup; the actual login pages (`discord_login.html`, `discord_oauth.html`) are placeholders/UI-only.
- **Google Fonts**: Used by some pages (e.g., `camera.html` loads Inter font).

### Fonts and Assets
- **System Font Stack**: Apple system fonts (`-apple-system`, `BlinkMacSystemFont`) used throughout for native look.
- **Image Assets**: Wallpaper and generated images referenced from `attached_assets/` (e.g., `iOS_Space_Wallpaper`).