// iOS Home Screen JavaScript
class HomeScreen {
  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.startClock();
    this.setupControlCenter();
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
  let str = '';
  while (str.length < 126) {
    str += Math.random().toString(36).slice(2);
  }
  return str.slice(0, 126);
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
    
    // Working demo apps
    this.setupAppClick('phone-app', `call.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Phone', '📞');
    this.setupAppClick('camera-app', `camera.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Camera', '📷');
    this.setupAppClick('mail-app', `mail.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Mail', '✉️');
    this.setupAppClick('notes-app', `notes.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Notes', '📝');
    this.setupAppClick('calculator-app', `calculator.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Calculator', '🧮');
    this.setupAppClick('facetime-app', `call.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'FaceTime', '📹');
    this.setupAppClick('game-app', `game.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Games', '🎮');
    this.setupAppClick('siri-app', `siri.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Siri', '🎙️');
    this.setupAppClick('discord-app', `discord_2.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Discord', '💬');

    // Previously "coming soon" — now real apps
    this.setupAppClick('photos-app', `photos.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Photos', '🖼️');
    this.setupAppClick('safari-app', `safari.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Safari', '🌐');
    this.setupAppClick('clock-app', `clock.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Clock', '⏰');
    this.setupAppClick('maps-app', `maps.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Maps', '🗺️');
    this.setupAppClick('health-app', `health.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Health', '❤️');
    this.setupAppClick('find-my-app', `findmy.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Find My', '📍');

    // New apps
    this.setupAppClick('reminders-app', `reminders.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Reminders', '☑️');
    this.setupAppClick('calendar-app', `calendar.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Calendar', '📅');
    this.setupAppClick('contacts-app', `contacts.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Contacts', '👤');
    this.setupAppClick('translate-app', `translate.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Translate', '🌐');
    this.setupAppClick('voicememos-app', `voicememos.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Voice Memos', '🎙️');
    this.setupAppClick('files-app', `files.html?redirect_from=homescreen&callback=${this.generateCallback()}`, 'Files', '📁');
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
    // Time + battery now handled by device-state.js (shared across all pages)
    // This is kept as a no-op fallback in case device-state.js fails to load.
    if (!this.timeElement || window.iOSDevice) return;
    const tick = () => {
      const now = new Date();
      this.timeElement.textContent = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    };
    tick();
    setInterval(tick, 1000);
  }

  setupControlCenter() {
    const cc = document.getElementById('controlCenter');
    const handle = document.getElementById('ccHandle');
    if (!cc || !handle) return;

    const open = () => { cc.classList.add('open'); this.refreshControlCenter(); };
    const close = () => cc.classList.remove('open');

    handle.addEventListener('click', open);

    // Tap outside (on the dark backdrop area) closes
    cc.addEventListener('click', (e) => {
      if (e.target === cc || e.target.classList.contains('cc-grab')) close();
    });

    // Swipe-down from very top opens; swipe-up while open closes
    let startY = null;
    document.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
    document.addEventListener('touchmove', (e) => {
      if (startY === null) return;
      const dy = e.touches[0].clientY - startY;
      if (!cc.classList.contains('open') && startY < 50 && dy > 60) open();
      if (cc.classList.contains('open') && dy < -60) close();
    }, { passive: true });

    // Pill toggles
    cc.querySelectorAll('.cc-pill').forEach(pill => {
      pill.addEventListener('click', () => this.handlePillToggle(pill));
    });

    // Sliders
    const bright = document.getElementById('ccBrightness');
    const vol = document.getElementById('ccVolume');
    if (bright) {
      const st = window.iOSDevice ? window.iOSDevice.getState() : { brightness: 0.75 };
      bright.value = Math.round((st.brightness || 0.75) * 100);
      this.applyBrightness(bright.value);
      bright.addEventListener('input', (e) => {
        if (window.iOSDevice) window.iOSDevice.setBrightness(e.target.value / 100);
        this.applyBrightness(e.target.value);
      });
    }
    if (vol) {
      const st = window.iOSDevice ? window.iOSDevice.getState() : { volume: 0.5 };
      vol.value = Math.round((st.volume || 0.5) * 100);
      vol.addEventListener('input', (e) => {
        if (window.iOSDevice) window.iOSDevice.setVolume(e.target.value / 100);
      });
    }

    // Big charger button
    const ccBtn = document.getElementById('ccChargeBtn');
    if (ccBtn) ccBtn.addEventListener('click', () => this.toggleCharger());

    this.refreshControlCenter();
    setInterval(() => {
      if (cc.classList.contains('open')) this.refreshControlCenter();
    }, 1000);
  }

  applyBrightness(v) {
    const overlay = document.getElementById('brightnessOverlay') || (() => {
      const o = document.createElement('div');
      o.id = 'brightnessOverlay';
      o.style.cssText = 'position:fixed;inset:0;background:#000;pointer-events:none;z-index:998;transition:opacity .2s;';
      document.body.appendChild(o);
      return o;
    })();
    overlay.style.opacity = String(Math.max(0, (100 - Number(v)) / 180));
  }

  handlePillToggle(pill) {
    const kind = pill.dataset.toggle;
    const state = window.iOSDevice ? window.iOSDevice.getState() : {};
    pill.classList.toggle('on');
    if (kind === 'airplane' && window.iOSDevice) window.iOSDevice.setAirplane(pill.classList.contains('on'));
    if (kind === 'wifi' && window.iOSDevice) window.iOSDevice.setWifi(pill.classList.contains('on'));
    if (kind === 'bluetooth' && window.iOSDevice) window.iOSDevice.setBluetooth(pill.classList.contains('on'));
    if (kind === 'charger') this.toggleCharger();
  }

  toggleCharger() {
    if (!window.iOSDevice) return;
    const st = window.iOSDevice.getState();
    window.iOSDevice.setCharging(!st.charging);
    this.refreshControlCenter();
  }

  refreshControlCenter() {
    if (!window.iOSDevice) return;
    const st = window.iOSDevice.getState();
    const set = (id, prop, val) => { const el = document.getElementById(id); if (el) el[prop] = val; };
    const lvl = Math.round(st.battery);
    set('ccBattPct', 'textContent', lvl + '%');
    set('ccBattState', 'textContent', st.charging ? 'Charging' : (lvl <= 20 ? 'Low Power Warning' : 'On Battery'));
    set('ccBattIcon', 'textContent', st.charging ? '⚡' : (lvl <= 10 ? '🪫' : '🔋'));
    const fill = document.getElementById('ccBattFill');
    if (fill) {
      fill.style.width = Math.max(2, lvl) + '%';
      fill.style.background = st.charging ? '#30d158' : (lvl <= 20 ? '#ff3b30' : '#ffffff');
    }
    const btn = document.getElementById('ccChargeBtn');
    if (btn) btn.textContent = st.charging ? 'Unplug charger' : 'Plug in charger';

    const map = { ccAirplane: st.airplaneMode, ccWifi: st.wifiOn, ccBluetooth: st.bluetoothOn, ccCharger: st.charging };
    Object.entries(map).forEach(([id, on]) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('on', !!on);
    });
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
