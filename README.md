# iOS Settings App Replica

## Overview

A comprehensive web-based iOS ecosystem simulator that replicates the iPhone experience, including a home screen, settings interface, authentication system, App Store, and various iOS apps. The project serves as an educational demonstration of iOS-like interface design and functionality using pure web technologies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Multi-Page Application**: Static HTML pages for each iOS feature (homescreen.html, home.html for settings, auth.html, app-store.html, and individual settings pages like wifi.html, bluetooth.html, etc.)
- **Component-Based JavaScript**: ES6 classes organize functionality per page (HomeScreen, SettingsHome, BluetoothSettings, etc.) with each page having its own dedicated JS file
- **Mobile-First Design**: CSS designed to mimic iOS interface patterns with proper spacing, rounded corners, and authentic visual styling
- **Event-Driven Architecture**: DOM event handling for user interactions including touch feedback simulation and form validation

### Design System
- **CSS Custom Properties**: Centralized theming using CSS variables (--bg-primary, --text-primary, --accent-blue, etc.) defined in multiple CSS files
- **Dark Theme Default**: Optimized for mobile viewing with authentic iOS dark mode colors
- **iOS Design Language**: Mimics native iOS settings with grouped rows, chevron navigation indicators, toggle switches, and proper typography
- **Shared Styles**: settings-page.css provides common styling for settings subpages while individual pages can have their own CSS

### Data Management
- **Client-Side State Only**: All data persists in browser localStorage
- **Per-Feature Storage**: Settings saved with descriptive keys (e.g., 'bluetoothEnabled', 'wifiNetworks', 'profileName')
- **Form Validation**: Real-time input validation with visual feedback
- **Session Persistence**: User authentication state maintained across page reloads

### Navigation Pattern
- **Page-Based Navigation**: Each settings category is a separate HTML file
- **Back Button Pattern**: Consistent iOS-style back navigation using window.location.href
- **Home Screen Entry Point**: homescreen.html serves as the main launcher with app icons linking to features

### File Organization
- **HTML Files**: One per feature/page (home.html, bluetooth.html, wifi.html, etc.)
- **CSS Files**: Shared (settings-page.css, home.css, homescreen.css) and page-specific styles
- **JS Files**: One per page matching the HTML filename (bluetooth.js, wifi.js, etc.)

## External Dependencies

### Browser APIs Used
- **Local Storage API**: Persisting all user configuration and settings data
- **DOM API**: Dynamic interface updates, event handling, and UI manipulation
- **Vibration API**: Haptic feedback simulation on toggle switches and buttons
- **MediaDevices API**: Camera access for the camera feature (camera.js)

### Third-Party Services
- **Groq API**: Used in discord.js for AI-powered bot responses in the Discord clone feature
- **Google Fonts**: Inter font family loaded in camera.html

### No Build Tools Required
- **Pure Vanilla JavaScript**: No frameworks (React, Vue, etc.)
- **Native CSS**: No preprocessors (Sass, Less) or CSS frameworks
- **Static HTML**: No templating engines or build steps
- **Self-Contained Assets**: All functionality contained within the project files

### Node.js Dependencies (package.json)
- discord.js, dotenv, give, terminal - These appear to be for a separate Discord bot feature, not the main iOS simulator

## Siri Issue.
- Siri keeps saying **i dont understand**. why? becuase on **vercel&github pages** siri doesnt work and i didnt add the **api key** here. but.. on the replit version it should be there.


## Nexus Upgrade Pack — iOS (15 additions)

On the simulated iPhone home screen, open the floating **Nexus** control to access the new tools.

1. Dynamic Island: demo music and timer live-status pills.
2. Control Center+: hotspot, AirDrop, rotation lock, low-power and silent toggles.
3. Lock Screen Studio: wallpaper and clock-style presets.
4. Focus Profiles: Personal, Work, Sleep and Gaming modes.
5. Live Activities: configurable countdown timer with island status.
6. Home Screen Customizer: icon scale, labels, badges and grid layout.
7. Privacy Dashboard: simulated camera, microphone, photos, location and tracking permissions.
8. Battery Lab: virtual battery health, charge limit and optimized charging.
9. StandBy Mode: full-screen bedside clock preview.
10. Quick Notes: create, tag, save and delete local notes.
11. Safari Tab Groups: save named website tabs and reopen them.
12. AirDrop Share: share-sheet demo with clipboard fallback.
13. Face ID Demo: animated unlock flow without collecting biometric data.
14. Smart Stack: cycle through weather, calendar, reminders and battery cards.
15. Haptics & Accessibility: touch feedback, text size, bold text and reduced motion.

These are simulated iOS interactions, not real device services or biometric/security controls. Data is stored locally in the browser.


## Nexus iPhone Expansion Pack (+30)

The Nexus panel now includes 30 additional iPhone-focused simulator tools (45 upgrades total):

1. Call Screening — allow, screen and block sample callers with a recent-call log.
2. Message Effects — compose local previews with iMessage-style bubble effects.
3. Health Rings — track simulated steps, exercise minutes and stand goals.
4. Journal — save dated entries with mood labels.
5. Medication Tracker — keep a local dose checklist and schedule.
6. Sleep Schedule — configure bedtime, wake-up and wind-down preferences.
7. HomeKit Home — control mock room accessories and save scenes.
8. AirPods Lab — explore device profiles, noise control and battery levels.
9. Camera Studio — tune camera lens, format, exposure and capture settings.
10. Photo Editor — preview color filters and save an edit preset.
11. Safari Reader — create a distraction-free reading view with themes.
12. Mail Rules — build sample inbox rules and categories.
13. Calendar Planner — schedule local events with dates and times.
14. Keyboard Lab — configure typing behavior and one-handed mode.
15. Text Replacements — create and test typing shortcuts.
16. CarPlay Dashboard — explore a driving-friendly dashboard profile.
17. Crash Detection Demo — walk through a safety countdown UI.
18. Location Sharing — manage mock sharing sessions and durations.
19. Find Devices — view sample devices and trigger a demo sound state.
20. Screen Distance — explore manual viewing-distance guidance.
21. App Limits — set daily time budgets for selected apps.
22. Notification Summary — plan a scheduled notification bundle.
23. Emergency Contacts — save a local emergency contact list.
24. Wallet Cards — organize placeholder cards using labels and last four digits only.
25. iCloud Sync Lab — choose sample sync categories and run a mock sync.
26. Voice Control — try navigation commands using typed input.
27. AssistiveTouch — preview a floating accessibility control.
28. Podcast Queue — build and reorder a podcast episode queue.
29. Siri Shortcuts — create and run simple local automations.
30. Game Mode — configure gaming focus and performance preferences.

All added features are browser simulations. They do not connect to Apple services, place calls, read physical device sensors, transmit location, process payments, control smart accessories or provide medical/emergency services. Preferences and demo data are stored in browser localStorage.


## Nexus Expansion Pack — +4 tools (49 total)

The Nexus panel now adds four more working simulator utilities:

46. **Device Backup** — export and restore safe local simulator data as JSON. Passwords, tokens, authentication/session values, API keys and credentials are excluded.
47. **Device Diagnostics** — inspect browser API support, online status, touch support and local storage usage.
48. **Network Lab** — switch between balanced, low-latency, data-saver and offline demo profiles, then run a simulated latency test.
49. **Wallpaper Studio** — design a two-color gradient wallpaper, preview it and apply it to the current simulator page.

These are browser-level simulations. Network profiles do not alter real connectivity, diagnostics do not inspect physical hardware, and backups remain local unless the user exports a file.
