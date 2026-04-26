(function () {
  'use strict';

  const STATE_KEY = 'iosDeviceState';
  const DRAIN_SECONDS_PER_PERCENT = 25;
  const CHARGE_SECONDS_PER_PERCENT = 1.5;

  function defaults() {
    return {
      battery: 87,
      charging: false,
      airplaneMode: false,
      wifiOn: true,
      bluetoothOn: true,
      brightness: 0.75,
      volume: 0.5,
      carrier: 'Verizon',
      lastUpdated: Date.now(),
    };
  }

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
      return Object.assign(defaults(), stored);
    } catch (e) {
      return defaults();
    }
  }

  function saveState() {
    state.lastUpdated = Date.now();
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  const state = loadState();

  function applyElapsed() {
    const now = Date.now();
    const elapsedSec = Math.max(0, (now - state.lastUpdated) / 1000);
    if (state.charging) {
      state.battery = Math.min(100, state.battery + elapsedSec / CHARGE_SECONDS_PER_PERCENT);
    } else {
      state.battery = Math.max(0, state.battery - elapsedSec / DRAIN_SECONDS_PER_PERCENT);
    }
    saveState();
  }
  applyElapsed();

  function pad(n) { return String(n).padStart(2, '0'); }

  function formatTime(d) {
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function formatDate(d) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()];
  }

  function batteryEmoji(level, charging) {
    if (charging) return '⚡';
    if (level <= 10) return '🪫';
    return '🔋';
  }

  function batteryColor(level, charging) {
    if (charging) return '#30d158';
    if (level <= 20) return '#ff3b30';
    if (level <= 30) return '#ff9500';
    return '';
  }

  const dateRegex = /^[A-Za-z]{3}\s+\d{1,2}\s+[A-Za-z]{3}/;

  function updateStatusBars() {
    const now = new Date();
    const timeStr = formatTime(now);
    const dateStr = formatDate(now);
    const battLevel = Math.round(state.battery);
    const battStr = battLevel + '% ' + batteryEmoji(state.battery, state.charging);
    const battColor = batteryColor(state.battery, state.charging);

    document.querySelectorAll('.time, #time').forEach(el => {
      el.textContent = timeStr;
    });

    document.querySelectorAll('.battery').forEach(el => {
      el.textContent = battStr;
      el.style.color = battColor || '';
    });

    document.querySelectorAll('.carrier').forEach(el => {
      const txt = el.textContent.trim();
      if (dateRegex.test(txt) || el.classList.contains('date-display') || el.dataset.role === 'date') {
        el.textContent = dateStr;
      }
    });

    document.querySelectorAll('[data-bind="carrier-name"]').forEach(el => {
      el.textContent = state.carrier;
    });

    document.querySelectorAll('[data-bind="battery-level"]').forEach(el => {
      el.textContent = battLevel + '%';
    });

    document.querySelectorAll('[data-bind="charging-state"]').forEach(el => {
      el.textContent = state.charging ? 'Charging' : 'On Battery';
    });
  }

  let tickCount = 0;
  function tick() {
    tickCount++;
    if (state.charging) {
      state.battery = Math.min(100, state.battery + 1 / CHARGE_SECONDS_PER_PERCENT);
    } else {
      state.battery = Math.max(0, state.battery - 1 / DRAIN_SECONDS_PER_PERCENT);
    }
    if (tickCount % 5 === 0) saveState();
    updateStatusBars();

    const onCharging = window.location.pathname.endsWith('charging.html') ||
                       window.location.pathname.endsWith('/charging.html');
    if (state.battery <= 0 && !state.charging && !onCharging && !window.__chargingRedirected) {
      window.__chargingRedirected = true;
      saveState();
      window.location.href = 'charging.html';
    }
  }

  window.iOSDevice = {
    getState: function () { return Object.assign({}, state); },
    setCharging: function (charging) {
      state.charging = !!charging;
      saveState();
      updateStatusBars();
    },
    setBattery: function (level) {
      state.battery = Math.max(0, Math.min(100, Number(level) || 0));
      saveState();
      updateStatusBars();
    },
    setCarrier: function (name) { state.carrier = String(name); saveState(); updateStatusBars(); },
    setWifi: function (on) { state.wifiOn = !!on; saveState(); },
    setBluetooth: function (on) { state.bluetoothOn = !!on; saveState(); },
    setAirplane: function (on) { state.airplaneMode = !!on; saveState(); },
    setBrightness: function (v) { state.brightness = Math.max(0, Math.min(1, Number(v) || 0)); saveState(); },
    setVolume: function (v) { state.volume = Math.max(0, Math.min(1, Number(v) || 0)); saveState(); },
    forceUpdate: updateStatusBars,
  };

  function boot() {
    updateStatusBars();
    setInterval(tick, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
