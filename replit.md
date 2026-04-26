# iOS Settings App Replica

## Overview

A comprehensive web-based iOS ecosystem simulator that replicates the iPhone experience in the browser. The project includes a home screen launcher, an iOS-style settings interface with many sub-pages (Wi-Fi, Bluetooth, Battery, Display, Cellular, Notifications, Focus, etc.), authentication flows, an App Store mock, and several mini-apps such as Calculator, Camera, Mail, Music, Files, Phone/Call, Game Center, and a Discord clone. It is primarily an educational/demo project showcasing iOS-style UI patterns and client-side interactivity.

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
- **New Working Apps**: `notes.html` (full notes app with autosave), `calculator.html` (full iOS calculator), `call.html` (phone dialer), `camera.html` (webcam), `music.html`, `weather.html`. Calculator/Notes/Phone/Camera are now wired into the home screen.
- **Charging Flow**: `charging.html` + `charging.css` + `charging.js` render the empty-battery / plug-in / charging animation when battery reaches 0%.
- **Python Stub**: `main.py` exists as a minimal placeholder and is not central to the application.
- **TypeScript Helper**: `discord_setup.ts` documents Discord OAuth2 configuration but is not part of a build pipeline.

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