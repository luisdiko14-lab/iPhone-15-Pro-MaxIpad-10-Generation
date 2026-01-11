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