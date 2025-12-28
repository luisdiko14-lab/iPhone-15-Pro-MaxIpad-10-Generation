// Discord OAuth2 Configuration and Verification Script
// This script provides the necessary configuration for the Discord Developer Portal

export const discordConfig = {
    clientId: '1454564220413808731',
    // Public domain for the Replit environment
    domain: 'bae87d28-4cce-4757-b6dd-10ac5b1f7c9f-00-2ytaz5tnphbrh.kirk.replit.dev',
    
    // Redirect URI to be pasted into the Discord Developer Portal
    get redirectUri(): string {
        return `https://${this.domain}/api/callback`;
    },
    
    // Required scopes for the application
    scopes: ['identify', 'guilds', 'email', 'connections'],
    
    // Instructions for the user
    instructions: {
        portalSetup: "Add the redirectUri above to your Discord Application's OAuth2 Redirects.",
        secrets: "Add DISCORD_CLIENT_SECRET to your Replit Secrets (Environment Variables).",
        verification: "Visit https://${this.domain}/login to test the flow."
    }
};

/**
 * Verifies if the current environment is ready for Discord Authentication
 */
export async function verifySetup(): Promise<boolean> {
    console.log("Checking Discord OAuth2 Configuration...");
    console.log(`Redirect URI: ${discordConfig.redirectUri}`);
    console.log(`Required Scopes: ${discordConfig.scopes.join(', ')}`);
    
    try {
        const response = await fetch('/api/user');
        return response.status !== 404;
    } catch (error) {
        console.error("Server check failed. Ensure the Flask server is running on port 5000.");
        return false;
    }
}

// Example usage:
// import { discordConfig } from './discord_setup.ts';
// console.log(discordConfig.redirectUri);
