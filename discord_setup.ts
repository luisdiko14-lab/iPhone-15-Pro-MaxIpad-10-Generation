// Discord OAuth2 Configuration & Verification Script
// Documents the redirect URI you need to paste into the Discord Developer Portal.
// The actual OAuth flow is implemented server-side in `server.py`.

export const discordConfig = {
    // Public OAuth client ID. Safe to commit; the *secret* is read from the
    // DISCORD_CLIENT_SECRET environment variable on the server only.
    clientId: '1454564220413808731',

    // The full domain is resolved at runtime from window.location so the
    // app keeps working even when Replit rotates the dev URL.
    get domain(): string {
        if (typeof window !== 'undefined' && window.location?.host) {
            return window.location.host;
        }
        // Server-side fallback (Node) — read from env.
        const proc: any = (typeof process !== 'undefined') ? process : {};
        const envDomain: string | undefined =
            proc.env?.REPLIT_DOMAINS || proc.env?.REPLIT_DEV_DOMAIN;
        return (envDomain || 'localhost:5000').split(',')[0];
    },

    get redirectUri(): string {
        const proto = (typeof window !== 'undefined' && window.location?.protocol) || 'https:';
        return `${proto}//${this.domain}/api/callback`;
    },

    // Scopes the app requests. Mirror these in server.py if you change them.
    scopes: ['identify', 'guilds', 'email', 'connections', 'guilds.member.read'],

    // OAuth state token length (CSRF protection). Matches server.py.
    stateLength: 126,

    instructions: {
        portalSetup: 'Add the redirectUri above to your Discord Application\'s OAuth2 Redirects.',
        secrets: 'Add DISCORD_CLIENT_SECRET to your Replit Secrets — it must NOT be hard-coded.',
        verification: 'Visit /login on your deployed domain to test the flow.',
    },
};

/**
 * Verifies that the Flask server has the OAuth credentials it needs.
 * Hits the /api/discord/status endpoint and reports back.
 */
export async function verifySetup(): Promise<boolean> {
    console.log('Checking Discord OAuth2 Configuration…');
    console.log(`Redirect URI: ${discordConfig.redirectUri}`);
    console.log(`Required Scopes: ${discordConfig.scopes.join(', ')}`);
    console.log(`State length: ${discordConfig.stateLength} chars`);

    try {
        const response = await fetch('/api/discord/status', { credentials: 'same-origin' });
        if (!response.ok) {
            console.error(`Server check failed (HTTP ${response.status}).`);
            return false;
        }
        const status = await response.json();
        if (!status.configured) {
            console.warn('Server is up but DISCORD_CLIENT_SECRET is not set.');
            return false;
        }
        console.log('✓ Server is configured for Discord OAuth.');
        return true;
    } catch (error) {
        console.error('Server check failed. Ensure the Flask server is running on port 5000.', error);
        return false;
    }
}

// Example usage:
// import { discordConfig, verifySetup } from './discord_setup.ts';
// console.log(discordConfig.redirectUri);
// verifySetup().then(ok => console.log('Ready:', ok));
