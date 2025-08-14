# VPN Configuration Interface

## Overview

A web-based VPN configuration interface that provides a mobile-first, iOS-style user interface for setting up VPN connections. The application allows users to configure various VPN types (IKEv2, L2TP, IPSec) with comprehensive settings including server details, authentication credentials, and proxy configurations. Built as a single-page application using vanilla HTML, CSS, and JavaScript with a focus on clean design and user experience.

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
- **Header Navigation**: Cancel/Done button pattern common in mobile interfaces
- **Form Sections**: Grouped input fields with consistent styling
- **Toggle Controls**: Custom proxy configuration toggles
- **Input Types**: Text inputs, dropdowns, and toggle buttons with appropriate validation

## External Dependencies

### Browser APIs
- **Local Storage API**: For persisting user configuration data across sessions
- **DOM API**: For dynamic interface updates and event handling

### No External Libraries
- **Pure Vanilla JavaScript**: No external JavaScript frameworks or libraries
- **Native CSS**: No CSS frameworks or preprocessors
- **Self-Contained**: All assets and functionality contained within the three core files

### Supported VPN Protocols
- **IKEv2**: Internet Key Exchange version 2 protocol support
- **L2TP**: Layer 2 Tunneling Protocol configuration
- **IPSec**: Internet Protocol Security setup options