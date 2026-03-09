// iOS Home Screen JavaScript
class HomeScreen {
  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.startClock();
    this.recentApps = JSON.parse(localStorage.getItem('recentApps')) || [];
    this.touchStartY = 0;
    this.isAppSwitcherOpen = false;
  }

  initializeElements() {
    this.timeElement = document.getElementById("time");
    this.apps = document.querySelectorAll('.app');
    this.appSwitcher = document.getElementById('appSwitcher');
    this.recentAppsContainer = document.getElementById('recentApps');
    this.homeIndicatorArea = document.getElementById('homeIndicatorArea');
  }

  setupEventListeners() {
    // Wire up app clicks
    this.wireApps();

    // Add touch feedback to all apps
    this.apps.forEach(app => {
      app.addEventListener('touchstart', this.addTouchFeedback, {passive: true});
      app.addEventListener('touchend', this.removeTouchFeedback, {passive: true});
    });

    // Swipe detection
    this.setupSwipeDetection();
  }

  setupSwipeDetection() {
    document.addEventListener('touchstart', (e) => {
      this.touchStartY = e.touches[0].clientY;
    }, {passive: true});

    document.addEventListener('touchmove', (e) => {
      if (!this.isAppSwitcherOpen && e.touches[0].clientY > window.innerHeight - 100) {
        const diff = this.touchStartY - e.touches[0].clientY;
        if (diff > 50) {
          this.openAppSwitcher();
        }
      }
    }, {passive: true});

    document.addEventListener('touchend', (e) => {
      if (this.isAppSwitcherOpen) {
        const diff = this.touchStartY - e.changedTouches[0].clientY;
        if (diff < -50) {
          this.closeAppSwitcher();
        }
      }
    }, {passive: true});

    // Home indicator click
    this.homeIndicatorArea.addEventListener('click', () => {
      if (!this.isAppSwitcherOpen) {
        this.openAppSwitcher();
      }
    });
  }

  openAppSwitcher() {
    this.isAppSwitcherOpen = true;
    this.appSwitcher.classList.add('active');
    this.updateRecentApps();
  }

  closeAppSwitcher() {
    this.appSwitcher.classList.add('closing');
    setTimeout(() => {
      this.appSwitcher.classList.remove('active', 'closing');
      this.isAppSwitcherOpen = false;
    }, 300);
  }

  updateRecentApps() {
    this.recentAppsContainer.innerHTML = '';
    const uniqueApps = [...new Map(this.recentApps.map(app => [app.id, app])).values()];
    const recentAppsToShow = uniqueApps.slice(0, 4);

    recentAppsToShow.forEach(app => {
      const card = document.createElement('div');
      card.className = 'recent-app-card';
      card.innerHTML = `
        <div class="recent-app-icon">${app.icon}</div>
        <div class="recent-app-name">${app.name}</div>
      `;
      card.addEventListener('click', () => {
        if (app.url) {
          this.navigateToApp(app.url);
        }
      });
      this.recentAppsContainer.appendChild(card);
    });
  }

  generateCallback() {
    return Math.random().toString(36).substring(2, 10);
  }

  addToRecentApps(appId, appName, icon, url) {
    const app = { id: appId, name: appName, icon, url };
    this.recentApps = this.recentApps.filter(a => a.id !== appId);
    this.recentApps.unshift(app);
    localStorage.setItem('recentApps', JSON.stringify(this.recentApps));
  }

  wireApps() {
    // Main app navigation
    this.setupAppClick('settings-app', `home.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Settings', '⚙️');
    this.setupAppClick('app-store-app', `app-store.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'App Store', '🏪');
    this.setupAppClick('vpn-app', `index.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'VPN', '🛡️');
    this.setupAppClick('auth-app', `auth.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Sign In', '🔐');
    this.setupAppClick('wallet-app', `wallet.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Wallet', '💳');
    this.setupAppClick('messages-app', `discord_2.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Messages', '💬');
    this.setupAppClick('music-app', `music.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Music', '🎵');
    this.setupAppClick('weather-app', `weather.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Weather', '⛅');
    
    // Dock apps
    this.setupAppClick('dock-phone', null, 'Phone', '📞');
    this.setupAppClick('dock-safari', null, 'Safari', '🌐');
    this.setupAppClick('dock-messages', 'discord_2.html', 'Messages', '💬');
    this.setupAppClick('dock-music', 'music.html', 'Music', '🎵');
    
    // Other apps - show coming soon
    const comingSoonApps = ['phone-app', 'camera-app', 'photos-app', 
                           'safari-app', 'mail-app', 'notes-app', 
                           'calculator-app', 'clock-app', 'maps-app',
                           'facetime-app', 'health-app', 'find-my-app'];
    
    comingSoonApps.forEach(appId => {
      const appElement = document.getElementById(appId);
      if (appElement) {
        const appName = appElement.querySelector('span')?.textContent || 'App';
        const appIcon = appElement.querySelector('.app-icon')?.textContent || '📱';
        this.setupAppClick(appId, null, appName, appIcon);
      }
    });
  }
  
  setupAppClick(appId, url, appName, appIcon) {
    const element = document.getElementById(appId);
    if (!element) return;
    
    element.addEventListener('click', () => {
      this.addToRecentApps(appId, appName, appIcon, url);
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
      animation: fadeIn 0.2s ease-out;
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
        animation: scaleIn 0.2s ease-out;
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
          transition: opacity 0.2s;
        " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">OK</button>
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