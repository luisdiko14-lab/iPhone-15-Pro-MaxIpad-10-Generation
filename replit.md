# iOS Settings App Replica

## Overview

A comprehensive web-based iOS Settings app replica that provides an authentic mobile-first interface for managing device settings. The application includes a complete settings ecosystem with functional pages for Wi-Fi, Bluetooth, Cellular Data, Battery, General settings, Control Centre, Display & Brightness, and Apple Account/iCloud management. Features authentic iOS dark theme, interactive functionality, real-time updates, and proper navigation throughout all settings categories. Built as a single-page application using vanilla HTML, CSS, and JavaScript with focus on authentic iOS design patterns and user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single-Page Application (SPA)**: Built entirely with vanilla web technologies without frameworks
- **Component-Based JavaScript**: Uses ES6 classes to organize functionality into logical components (VPNConfig class)
- **Mobile-First Design**: Responsive CSS with iOS-style interface patterns and animations
- **Event-Driven Architecture**: DOM event handling for user interactions and form validation

### Design System
- **CSS Custom Properties**: Centralized theming system using CSS variables for colors, spacing, and transitions
- **Dark Theme**: Default dark color scheme optimized for mobile viewing
- **iOS Design Language**: Mimics native iOS settings interface with appropriate spacing, typography, and interactive elements

### Data Management
- **Client-Side State Management**: JavaScript class manages form state and validation
- **Local Storage**: Browser localStorage for persisting VPN configuration data
- **Form Validation**: Real-time input validation with visual feedback

### User Interface Components
- **Status Bar**: Authentic iOS status bar with GMT-6 time, Verizon carrier, Wi-Fi, and battery indicators
- **Header Navigation**: Back/Edit button patterns with proper iOS styling
- **Settings Groups**: Grouped settings with rounded corners and proper spacing
- **Toggle Controls**: iOS-style toggle switches with smooth animations
- **Modal Dialogs**: Native iOS-style modals for confirmations and detailed settings
- **Navigation**: Smooth page transitions with proper back navigation
- **Interactive Elements**: Touch feedback, haptic simulation, and real-time updates

## External Dependencies

### Browser APIs
- **Local Storage API**: For persisting user configuration data across sessions
- **DOM API**: For dynamic interface updates and event handling

### No External Libraries
- **Pure Vanilla JavaScript**: No external JavaScript frameworks or libraries
- **Native CSS**: No CSS frameworks or preprocessors
- **Self-Contained**: All assets and functionality contained within the three core files

### Functional Settings Pages
- **Wi-Fi**: Network management, connection, password entry, and network discovery
- **Bluetooth**: Device pairing, connection states, battery levels, and scanning
- **Cellular Data**: SIM information (+1 834 872 127), data usage tracking, app permissions
- **Battery**: Usage analytics, charts, Low Power Mode, and optimization settings
- **General**: About device, software updates, storage management, and system settings
- **Control Centre**: Customizable control layout with drag-and-drop functionality
- **Display & Brightness**: Appearance modes, brightness control, True Tone, Night Shift
- **Apple Account**: iCloud profile, device management, storage visualization, Family Sharing