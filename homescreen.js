// iOS Home Screen JavaScript
class HomeScreen {
  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.startClock();
  }

  initializeElements() {
    this.timeElement = document.getElementById("time");
    this.apps = document.querySelectorAll('.app');
  }

  setupEventListeners() {
    // Wire up app clicks
    this.wireApps();

    // Add touch feedback to all apps
    this.apps.forEach(app => {
      app.addEventListener('touchstart', this.addTouchFeedback, {passive: true});
      app.addEventListener('touchend', this.removeTouchFeedback, {passive: true});
    });
  }

  wireApps() {
    // Main app navigation
    this.setupAppClick('settings-app', 'home.html?=redirected_from=homescreen.html');
    this.setupAppClick('app-store-app', 'app-store.html?=redirected_from=homescreen.html');
    this.setupAppClick('vpn-app', 'index.html?=redirected_from=homescreen.html');
    this.setupAppClick('auth-app', 'auth.html?=redirected_from=homescreen.html');
    this.setupAppClick('wallet-app', 'wallet.html?=redirected_from=homescreen.html');
    this.setupAppClick('messages-app', 'discord_2.html?=redirected_from=homescreen.html');
    
    // Dock apps
    this.setupAppClick('dock-phone', null, 'Phone');
    this.setupAppClick('dock-safari', null, 'Safari');
    this.setupAppClick('dock-messages', 'discord_2.html');
    this.setupAppClick('dock-music', null, 'Music');
    
    // Other apps - show coming soon
    const comingSoonApps = ['phone-app', 'camera-app', 'photos-app', 
                           'safari-app', 'mail-app', 'music-app', 'notes-app', 
                           'calculator-app', 'weather-app', 'clock-app', 'maps-app',
                           'facetime-app', 'health-app', 'find-my-app'];
    
    comingSoonApps.forEach(appId => {
      const appElement = document.getElementById(appId);
      if (appElement) {
        const appName = appElement.querySelector('span')?.textContent || 'App';
        this.setupAppClick(appId, null, appName);
      }
    });
  }
  
  setupAppClick(appId, url, appName) {
    const element = document.getElementById(appId);
    if (!element) return;
    
    element.addEventListener('click', () => {
      if (url) {
        this.navigateToApp(url);
      } else if (appName) {
        this.showComingSoon(appName);
      }
    });
  }
  
  showComingSoon(appName) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;
    
    modal.innerHTML = `
      <div style="
        background: rgba(40, 40, 40, 0.95);
        backdrop-filter: blur(20px);
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        max-width: 300px;
      ">
        <div style="font-size: 50px; margin-bottom: 15px;">📱</div>
        <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">${appName}</h3>
        <p style="margin: 0 0 20px 0; font-size: 14px; opacity: 0.8;">This app is not available in the demo.</p>
        <button onclick="this.closest('div').parentElement.remove()" style="
          background: #007aff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
        ">OK</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Remove on click outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  navigateToApp(url) {
    // Add navigation animation
    const body = document.body;
    body.style.opacity = '0.8';
    body.style.transform = 'scale(0.95)';

    setTimeout(() => {
      window.location.href = url;
    }, 150);
  }

  addTouchFeedback(event) {
    event.target.style.transform = 'scale(0.95)';
    event.target.style.opacity = '0.8';
  }

  removeTouchFeedback(event) {
    event.target.style.transform = 'scale(1)';
    event.target.style.opacity = '1';
  }

  startClock() {
    if (!this.timeElement) return;
    
    const tick = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      this.timeElement.textContent = `${hours}:${minutes}`;
    };
    
    tick(); // Update immediately
    setInterval(tick, 1000); // Update every second
  }
}

// Initialize the home screen when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new HomeScreen();
});

// Handle back navigation
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    // Reset any transition states when navigating back
    document.body.style.opacity = '1';
    document.body.style.transform = 'scale(1)';
  }
});
