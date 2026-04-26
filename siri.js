(function () {
  'use strict';

  const orb = document.getElementById('siriOrb');
  const status = document.getElementById('siriStatus');
  const transcript = document.getElementById('siriTranscript');
  const replyEl = document.getElementById('siriReply');
  const input = document.getElementById('userQuestion');
  const askBtn = document.getElementById('askBtn');
  const micBtn = document.getElementById('micBtn');
  const suggestionsEl = document.getElementById('suggestions');
  const historyList = document.getElementById('historyList');

  const HIST_KEY = 'siriHistory';
  let history = [];
  try { history = JSON.parse(localStorage.getItem(HIST_KEY)) || []; } catch (e) {}

  const SUGGESTIONS = [
    "What time is it?",
    "How's my battery?",
    "Tell me a joke",
    "Open Calculator",
    "What's the weather?",
    "Roll a dice",
    "Flip a coin",
    "Set a timer for 5 minutes",
    "What day is it?",
    "What can you do?"
  ];

  const JOKES = [
    "I tried to take a picture of some fog. I mist.",
    "Parallel lines have so much in common. It's a shame they'll never meet.",
    "I told my computer I needed a break. It said: no problem, I'll go to sleep.",
    "Why don't scientists trust atoms? Because they make up everything.",
    "I'm reading a book about anti-gravity. It's impossible to put down.",
    "Why did the scarecrow win an award? He was outstanding in his field.",
    "I'm on a seafood diet. I see food and I eat it.",
    "What do you call fake spaghetti? An impasta."
  ];

  const FORTUNES = [
    "A pleasant surprise is waiting for you.",
    "You will find what you've been looking for.",
    "The early bird catches the worm. Set an alarm.",
    "A smooth sea never made a skilled sailor.",
    "Today is the day you make something new.",
  ];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function setStatus(text, kind) {
    status.textContent = text;
    status.dataset.kind = kind || 'idle';
  }

  function setOrbState(state) {
    orb.dataset.state = state;
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.05;
      u.pitch = 1.0;
      u.lang = 'en-US';
      const voices = window.speechSynthesis.getVoices();
      const samantha = voices.find(v => /samantha|karen|female|nicky/i.test(v.name));
      if (samantha) u.voice = samantha;
      u.onstart = () => setOrbState('speaking');
      u.onend = () => setOrbState('idle');
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function pushHistory(q, a) {
    history.unshift({ q, a, t: Date.now() });
    history = history.slice(0, 12);
    try { localStorage.setItem(HIST_KEY, JSON.stringify(history)); } catch (e) {}
    renderHistory();
  }

  function renderHistory() {
    if (!historyList) return;
    if (history.length === 0) {
      historyList.innerHTML = '<div class="hist-empty">No conversations yet</div>';
      return;
    }
    historyList.innerHTML = history.map(h => `
      <div class="hist-item">
        <div class="hist-q">"${escapeHtml(h.q)}"</div>
        <div class="hist-a">${escapeHtml(h.a)}</div>
      </div>
    `).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  }

  function renderSuggestions() {
    if (!suggestionsEl) return;
    const shuffled = SUGGESTIONS.slice().sort(() => Math.random() - 0.5).slice(0, 6);
    suggestionsEl.innerHTML = shuffled.map(s => `<button class="suggestion">${escapeHtml(s)}</button>`).join('');
    suggestionsEl.querySelectorAll('.suggestion').forEach(b => {
      b.addEventListener('click', () => {
        input.value = b.textContent;
        ask();
      });
    });
  }

  function deviceState() {
    if (window.iOSDevice) return window.iOSDevice.getState();
    return { battery: 87, charging: false, wifiOn: true, bluetoothOn: true, carrier: 'Verizon' };
  }

  function evaluateMath(expr) {
    const cleaned = expr
      .replace(/plus/gi, '+').replace(/minus/gi, '-')
      .replace(/times|multiplied by|x/gi, '*')
      .replace(/divided by|over/gi, '/')
      .replace(/[^0-9+\-*/().\s]/g, '');
    if (!cleaned.trim()) return null;
    if (!/[\d]/.test(cleaned)) return null;
    try {
      const r = Function('"use strict";return (' + cleaned + ')')();
      if (typeof r === 'number' && isFinite(r)) return r;
    } catch (e) {}
    return null;
  }

  function navigate(url, what) {
    setTimeout(() => { window.location.href = url; }, 1000);
    return `Opening ${what}…`;
  }

  function answer(question) {
    const q = question.trim().toLowerCase();
    if (!q) return "I didn't catch that. Try again.";

    // Greetings
    if (/^(hi|hello|hey|yo|hola)\b/.test(q)) return "Hi! What can I help you with?";
    if (/how are you|how's it going/.test(q)) return "I'm doing great, thanks for asking. How can I help?";
    if (/thank|thanks/.test(q)) return "You're welcome!";
    if (/who are you|what are you/.test(q)) return "I'm Siri, your virtual assistant.";
    if (/what can you do|help me|capabilities/.test(q)) {
      return "I can tell you the time, date, battery level, do math, tell jokes, flip coins, roll dice, give weather, and open apps like Calculator, Notes, Camera, Phone, and Settings. Just ask!";
    }

    // Time / date
    if (/what.*time|current time|what time is it/.test(q)) {
      const d = new Date();
      const hr = d.getHours(); const mn = String(d.getMinutes()).padStart(2, '0');
      const ampm = hr >= 12 ? 'PM' : 'AM';
      const h12 = ((hr + 11) % 12) + 1;
      return `It's ${h12}:${mn} ${ampm}.`;
    }
    if (/what.*day|what.*date|today/.test(q)) {
      const d = new Date();
      return "Today is " + d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) + ".";
    }

    // Battery
    if (/battery|charge|power/.test(q)) {
      const st = deviceState();
      const lvl = Math.round(st.battery);
      if (st.charging) return `Your iPhone is at ${lvl}% and charging.`;
      if (lvl <= 20) return `Your battery is low — ${lvl}%. You should plug it in.`;
      return `Your iPhone battery is at ${lvl}%.`;
    }

    // Wifi / bluetooth status
    if (/wifi|wi-fi|wireless/.test(q)) {
      return deviceState().wifiOn ? "Wi-Fi is on." : "Wi-Fi is off.";
    }
    if (/bluetooth/.test(q)) {
      return deviceState().bluetoothOn ? "Bluetooth is on." : "Bluetooth is off.";
    }

    // Weather (mock)
    if (/weather|forecast|rain|sunny|temperature/.test(q)) {
      const conditions = ['sunny', 'partly cloudy', 'cloudy', 'lightly raining', 'clear'];
      const temp = 60 + Math.floor(Math.random() * 25);
      return `Right now it's ${temp}°F and ${pick(conditions)} where you are.`;
    }

    // Coin flip
    if (/flip.*coin|coin.*flip/.test(q)) {
      return Math.random() < 0.5 ? "Heads." : "Tails.";
    }

    // Dice
    if (/(roll|throw).*(dice|die)|dice|random number/.test(q)) {
      return "I rolled a " + (1 + Math.floor(Math.random() * 6)) + ".";
    }

    // Joke
    if (/joke|funny|humor/.test(q)) return pick(JOKES);

    // Fortune
    if (/fortune|future|predict|will i/.test(q)) return pick(FORTUNES);

    // Open apps
    if (/open|launch|start|go to/.test(q)) {
      if (/calculator|math/.test(q)) return navigate('calculator.html', 'Calculator');
      if (/notes/.test(q)) return navigate('notes.html', 'Notes');
      if (/camera/.test(q)) return navigate('camera.html', 'Camera');
      if (/phone|dialer|call/.test(q)) return navigate('call.html', 'Phone');
      if (/settings|setting/.test(q)) return navigate('home.html', 'Settings');
      if (/music/.test(q)) return navigate('music.html', 'Music');
      if (/weather/.test(q)) return navigate('weather.html', 'Weather');
      if (/mail|email/.test(q)) return navigate('mail.html', 'Mail');
      if (/home|home screen/.test(q)) return navigate('homescreen.html', 'Home Screen');
      if (/game|2048|play/.test(q)) return navigate('game.html', 'Games');
      if (/app store|store/.test(q)) return navigate('app-store.html', 'App Store');
    }

    // Math
    const m = evaluateMath(q);
    if (m !== null) return `That's ${m}.`;

    // Set timer (mock)
    const tm = q.match(/(\d+)\s*(minute|min|sec|second|hour)/);
    if (/timer|alarm/.test(q) && tm) {
      return `Okay, I would set a ${tm[1]} ${tm[2]}${parseInt(tm[1])>1?'s':''} timer (demo).`;
    }

    // Reminders / notes (mock)
    if (/remind|note|remember/.test(q)) {
      return navigate('notes.html', 'Notes to write that down');
    }

    // Charger control
    if (/(plug|charge).*(charger|in)|start charging/.test(q)) {
      if (window.iOSDevice) window.iOSDevice.setCharging(true);
      return "Done. I've turned on charging.";
    }
    if (/unplug|stop charging/.test(q)) {
      if (window.iOSDevice) window.iOSDevice.setCharging(false);
      return "Charger unplugged.";
    }

    // Fallbacks
    const fallbacks = [
      "I'm not sure I understood that. Try asking about the time, weather, battery, or to open an app.",
      "Hmm, I don't have an answer for that yet. Try a different question.",
      "I didn't quite get that. Tap a suggestion below to see what I can do."
    ];
    return pick(fallbacks);
  }

  function ask() {
    const question = input.value.trim();
    if (!question) return;
    transcript.textContent = '"' + question + '"';
    transcript.classList.add('active');
    setStatus('Thinking…', 'thinking');
    setOrbState('thinking');
    setTimeout(() => {
      const a = answer(question);
      replyEl.textContent = a;
      replyEl.classList.add('active');
      setStatus('', 'idle');
      pushHistory(question, a);
      speak(a);
      input.value = '';
    }, 500);
  }

  // Voice input via Web Speech API
  let recognition = null;
  let listening = false;
  function setupRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      micBtn.disabled = true;
      micBtn.title = "Voice input not supported in this browser";
      micBtn.style.opacity = '0.4';
      return;
    }
    recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      listening = true;
      setOrbState('listening');
      setStatus('Listening…', 'listening');
      transcript.textContent = '';
      transcript.classList.add('active');
    };
    recognition.onresult = (event) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      transcript.textContent = '"' + text + '"';
      input.value = text;
    };
    recognition.onerror = () => {
      listening = false;
      setOrbState('idle');
      setStatus('Microphone error. Try typing instead.', 'idle');
    };
    recognition.onend = () => {
      listening = false;
      setOrbState('idle');
      if (input.value.trim()) ask();
      else setStatus("I didn't hear you. Try again.", 'idle');
    };
  }

  function toggleMic() {
    if (!recognition) {
      setStatus('Voice not supported. Type your question.', 'idle');
      return;
    }
    if (listening) {
      try { recognition.stop(); } catch (e) {}
    } else {
      try { recognition.start(); } catch (e) {}
    }
  }

  // Wire up
  askBtn.addEventListener('click', ask);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') ask(); });
  micBtn.addEventListener('click', toggleMic);
  orb.addEventListener('click', toggleMic);

  setupRecognition();
  renderSuggestions();
  renderHistory();
  setStatus("Hi, I'm Siri. What can I help you with?", 'idle');

  // Voices may load async
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }
})();
