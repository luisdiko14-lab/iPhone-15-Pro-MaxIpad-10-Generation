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
    // App click handlers with relative paths
    document.getElementById('settings-app')?.addEventListener('click', () => {
      this.navigateToApp('home.html');
    });

    document.getElementById('vpn-app')?.addEventListener('click', () => {
      this.navigateToApp('index.html');
    });

    document.getElementById('camera-app')?.addEventListener('click', () => {
      this.navigateToApp('camera.html');
    });

    document.getElementById('mail-app')?.addEventListener('click', () => {
      this.navigateToApp('mail.html');
    });

    document.getElementById('ios-update-app')?.addEventListener('click', () => {
      this.navigateToApp('iOS_update.html');
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
