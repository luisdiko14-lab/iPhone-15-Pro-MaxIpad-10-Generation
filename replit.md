# iOS Settings App Replica

## Overview

This project is a web-based iOS ecosystem simulator that replicates the iPhone experience in a browser. It includes a home screen launcher, an iOS-style settings interface with various sub-pages (e.g., Wi-Fi, Bluetooth, Battery), authentication flows, an App Store mock, and several mini-applications such as Calculator, Camera, Mail, Music, Files, Phone, Siri, a 2048 game, Game Center, and a Discord clone. Its primary purpose is to serve as an educational and demo platform, showcasing iOS-style UI patterns and client-side interactivity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Multi-Page Application**: Each iOS feature is a static HTML page.
- **Component-Based JavaScript**: ES6 classes manage page-specific functionality.
- **Mobile-First Design**: CSS mimics iOS interface patterns, including grouped rows, chevron indicators, toggle switches, status bars, and home indicators.
- **Event-Driven Interactions**: DOM event handlers manage user input and simulated haptics.

### Design System
- **CSS Custom Properties**: Centralized theming using CSS variables.
- **Dark Theme Default**: Authentic iOS dark mode color palette.
- **iOS Design Language**: Replicates native iOS Settings appearance with consistent typography and visual cues.
- **Shared and Page-Specific Styles**: Utilizes a combination of shared and dedicated CSS files.

### Data Management
- **Client-Side State Only**: All persistence uses browser `localStorage`.
- **Per-Feature Storage Keys**: Settings are saved with descriptive keys.
- **Form Validation**: Real-time input validation with visual feedback.
- **Session Persistence**: Authentication state persists across page reloads.

### Shared Device State (`device-state.js`)
- Provides a single source of truth for device status (time, battery, charging, connectivity, brightness, volume, carrier).
- Includes a realistic battery simulation with draining and charging mechanics.
- Features an auto-charge screen redirection when the battery hits 0%.
- Exposes a public API for state management and updates.

### Control Center
- Accessible via a tap/swipe gesture from the home screen, providing quick access to common toggles and sliders.

### Navigation Pattern
- **Page-Based Navigation**: Each settings category and app is a separate HTML file.
- **iOS-Style Back Navigation**: Consistent back-button pattern.
- **Home Screen Launcher**: `homescreen.html` serves as the primary entry point.
- **Installer/Setup Flow**: `index.html` / `installer.html` simulate an OS installation and setup process.

### File Organization
- **HTML Files**: One per feature/page.
- **CSS Files**: A mix of shared and page-specific stylesheets.
- **JS Files**: One per page, plus `device-state.js` for cross-page shared state.
- **Working Apps**: Includes `notes.html`, `calculator.html`, `call.html`, `camera.html`, `music.html`, `weather.html`, `siri.html`, and `game.html`.
- **Charging Flow**: Dedicated files for the charging animation.
- **Python Stub**: `main.py` is a minimal placeholder.

### Phone App (`call.html`)
- Full iOS-style phone app with 5-tab navigation.
- Keypad uses Web Audio API for DTMF tone synthesis.
- Features quick-call functionality and persistence for recents, voicemails, and contacts.

### Siri (`siri.html` / `siri.js`)
- Three-mode assistant (Offline, Groq, Gemini) with a model selector.
- **Offline mode**: Handles common queries without network access.
- **Groq & Gemini modes**: Utilize Flask proxy for AI calls with conversation history context.
- Prioritizes local intents before AI calls.
- Includes auto-fallback for AI model unavailability.
- Uses SpeechRecognition and SpeechSynthesis APIs for voice interaction.
- Features an animated Siri orb, suggestion chips, and conversation history.

### Server-side AI Proxy (`server.py`)
- Flask routes for Groq and Gemini API calls, handling secrets server-side.
- Provides an endpoint for Siri status to check configured models.

### Mini Game (`game.html` — React)
- A 2048 game implemented using React 18 via CDN, demonstrating React integration without a build pipeline.
- Supports various input methods and tracks best scores.

### Installer Flow (`installer.html`)
- A 10-step guided wizard simulating an OS installation, including system requirements, drive selection, version choice, and a detailed installation log.

### Setup Flow (`setup.html`)
- A 15-step Apple-style activation flow, covering language, region, Wi-Fi setup, Apple ID, Face ID, passcode, Siri training, and appearance settings.

## External Dependencies

### Browser APIs Used
- **Local Storage API**: For user configuration and settings.
- **DOM API**: For UI updates and event handling.
- **Vibration API**: For haptic feedback.
- **MediaDevices API (getUserMedia)**: For camera access.
- **Fetch API**: For external service calls.

### Third-Party Services
- **Groq API**: Used for AI-powered bot replies (in Discord clone) and Siri.
- **Discord OAuth2 (live)**: Full server-side OAuth flow implemented in `server.py`.
- **Google Fonts**: Used for specific pages.

### Discord OAuth2 Flow
- **Server-side routes** (`server.py`) for handling login, callback, user data retrieval, status checks, and logout.
- **Scopes**: `identify guilds email connections openid guilds.members.read`. The earlier "Scope 4 is invalid" error came from a misspelled `guilds.member.read` (singular) — the correct Discord scope is `guilds.members.read` (plural).
  - `openid` — returns an `id_token` JWT in the token response. The server decodes the JWT payload (no signature verification — it's read directly off the HTTPS response from Discord) and stashes the OIDC claims (`preferred_username`, `picture`, `email`, `locale`, `sub`, `email_verified`, …) in the session under `discord_id_claims`.
  - `guilds.members.read` — lets the server call `/users/@me/guilds/{guild_id}/member` per server to fetch the user's nickname, role IDs, join date, and Nitro-boost status.
- **CSRF state**: 126-character URL-safe token, validated with constant-time comparison on `/api/callback`.
- **Secrets**: `DISCORD_CLIENT_SECRET` is read from environment variables (no hard-coded fallback).
- **Cookies**: Configured with `SESSION_COOKIE_SAMESITE=Lax`, `SESSION_COOKIE_SECURE=True`, `SESSION_COOKIE_HTTPONLY=True`.
- **Redirect URI**: Dynamically resolved to match the Replit development URL.
- **Bot chat**: `POST /api/discord/bot` → Groq powers "Pixel", the Discord clone's chat bot. Falls back to a friendly stub message if `GROQ_SECRET` isn't set or the API errors.
  - **Text model**: `llama-3.1-8b-instant`. **Vision model**: `meta-llama/llama-4-scout-17b-16e-instruct` (auto-selected when an image attachment is present; falls back to text model on 400/404 with `vision_failed:true` in the response).
  - **Web search**: when the request body has `web_search:true`, the server runs a DuckDuckGo query (via the `ddgs` package — note: the older `duckduckgo-search` package was renamed to `ddgs`) for the user's message, top 5 results, and prepends them as a numbered `WEB SEARCH RESULTS [1]…[5]` context block. The system prompt instructs Pixel to cite inline like `[1]`. Results are also returned to the client as `search_results` so the chat bubble can render clickable source links underneath the reply.
  - **Attachments** (`attachments: [{kind, name, mime, ...}]`, max 5):
    - `kind:'image'` with `data_url` → forwarded to the vision model as an OpenAI-style `image_url` content part. Client-side cap 4 MB; server-side cap 5 MB on the data URL.
    - `kind:'text'` with `text` → inlined into the prompt inside a fenced block, capped at 50 KB server-side / 200 KB client-side. Used both for actual text files (.txt/.md/.json/.csv/.log/.html/.xml/.yml/.js/.ts/.py/.css/etc) **and** for PDFs after extraction.
- **PDF extraction**: `POST /api/discord/extract-pdf` (multipart `file`) → uses `pypdf` to extract text page-by-page, capped at 8 MB upload / 80 KB extracted text. Returns `{name, pages, chars, truncated, text}`. The Discord chat front-end uploads PDFs here first, then forwards the resulting text as a `kind:'text'` attachment to `/api/discord/bot`.
- **Standalone search endpoint**: `GET /api/discord/search?q=…` (also accepts POST JSON `{query}`) returns the raw DDG results without invoking the LLM.
- **Per-guild member data**: `/api/me` fans out (8-way parallel `ThreadPoolExecutor`, capped at 50 guilds) to fetch each guild's member info; the response embeds a `member: {nick, roles, joined_at, premium_since, pending}` object on each guild.
- **Frontend** (`discord_login.html`, `discord_2.html`): Manages login button state, QR code generation, and session-cookie token handling. The profile page shows banner/accent color, avatar, verified badge, locale, account-creation date (decoded from Discord snowflake), tap-to-copy user ID, sorted server list with real guild icons + per-server nickname/role count/join date/boost status, connections with verified badges, an "OpenID Identity" section listing every OIDC claim Discord returns, and the Groq-powered bot chat with typing indicator.

### Homescreen Apps
The homescreen launcher (`homescreen.html` / `homescreen.js`) wires up icons via `setupAppClick(elementId, url, name, emoji)`. Discord lives at `#discord-app` (Discord-purple icon with the official logo SVG) and routes to `discord_2.html`.

### Fonts and Assets
- **System Font Stack**: Uses Apple system fonts.
- **Image Assets**: Referenced from `attached_assets/` for wallpapers and generated images.