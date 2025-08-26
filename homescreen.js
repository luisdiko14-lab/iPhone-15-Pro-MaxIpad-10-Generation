(() => {
  const TOUCH_ID_URL =
    "https://322a44cb-3336-4f7a-9384-2fd6c6824466-00-2ypwmzwt52p8b.worf.replit.dev/touchid.html";
  const ONE_SHOT_KEY = "justUnlocked";  // set by touchid.js on success

  // 1) Security gate: only allow entry immediately after Touch ID success
  document.addEventListener("DOMContentLoaded", () => {
    const justUnlocked = sessionStorage.getItem(ONE_SHOT_KEY) === "true";
    if (!justUnlocked) {
      // Always require Touch ID on direct visit or refresh
      window.location.replace(TOUCH_ID_URL);
      return;
    }
    // Consume the one-shot so refresh locks again
    sessionStorage.removeItem(ONE_SHOT_KEY);

    wireApps();
    startClock();
  });

  function wireApps(){
    // Your exact app redirects
    document.getElementById('settings-app')?.addEventListener('click', () => {
      window.location.href = 'https://322a44cb-3336-4f7a-9384-2fd6c6824466-00-2ypwmzwt52p8b.worf.replit.dev/home.html';
    });

    document.getElementById('vpn-app')?.addEventListener('click', () => {
      window.location.href = 'https://322a44cb-3336-4f7a-9384-2fd6c6824466-00-2ypwmzwt52p8b.worf.replit.dev/index.html';
    });

    document.getElementById('camera-app')?.addEventListener('click', () => {
      window.location.href = 'https://322a44cb-3336-4f7a-9384-2fd6c6824466-00-2ypwmzwt52p8b.worf.replit.dev/camera.html';
    });

    document.getElementById('mail-app')?.addEventListener('click', () => {
      window.location.href = 'https://322a44cb-3336-4f7a-9384-2fd6c6824466-00-2ypwmzwt52p8b.worf.replit.dev/mail.html';
    });

    document.getElementById('ios-update-app')?.addEventListener('click', () => {
      window.location.href = 'https://322a44cb-3336-4f7a-9384-2fd6c6824466-00-2ypwmzwt52p8b.worf.replit.dev/iOS_update.html';
    });
  }

  function startClock(){
    const el = document.getElementById("time");
    if (!el) return;
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      el.textContent = `${hh}:${mm}`;
    };
    tick(); setInterval(tick, 1000);
  }
})();
