(function () {
  'use strict';

  const dead = document.getElementById('deadScreen');
  const charging = document.getElementById('chargingScreen');
  const boot = document.getElementById('bootScreen');
  const bbFill = document.getElementById('bbFill');
  const chargePercent = document.getElementById('chargePercent');
  const chargeStatus = document.getElementById('chargeStatus');

  function show(el) {
    [dead, charging, boot].forEach(s => s.classList.remove('active'));
    el.classList.add('active');
  }

  function getLevel() {
    if (window.iOSDevice) return Math.round(window.iOSDevice.getState().battery);
    return 0;
  }

  function paint() {
    const lvl = Math.max(1, getLevel());
    bbFill.style.width = lvl + '%';
    chargePercent.textContent = lvl + '%';
    if (lvl >= 100) {
      chargeStatus.textContent = 'Fully Charged';
    } else if (lvl >= 80) {
      chargeStatus.textContent = 'Charging — almost done';
    } else {
      chargeStatus.textContent = 'Charging…';
    }
  }

  window.plugIn = function () {
    if (window.iOSDevice) {
      window.iOSDevice.setBattery(1);
      window.iOSDevice.setCharging(true);
    }
    show(charging);
    paint();
    chargeLoop();
  };

  let loopId = null;
  function chargeLoop() {
    if (loopId) clearInterval(loopId);
    loopId = setInterval(paint, 500);
  }

  window.unplug = function () {
    const lvl = getLevel();
    if (lvl < 5) {
      alert('Battery too low to unplug. Wait until it reaches at least 5%.');
      return;
    }
    if (window.iOSDevice) window.iOSDevice.setCharging(false);
    if (loopId) clearInterval(loopId);
    show(boot);
    setTimeout(() => {
      window.location.href = 'homescreen.html';
    }, 1400);
  };

  // If already charging when arriving (e.g. from control center), skip dead screen
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const st = window.iOSDevice ? window.iOSDevice.getState() : { charging: false, battery: 0 };
      if (st.charging || st.battery > 0) {
        if (st.battery < 1 && window.iOSDevice) window.iOSDevice.setBattery(1);
        if (window.iOSDevice) window.iOSDevice.setCharging(true);
        show(charging);
        paint();
        chargeLoop();
      } else {
        show(dead);
      }
    }, 50);
  });
})();
