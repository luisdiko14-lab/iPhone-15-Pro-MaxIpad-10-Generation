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
  const modelSelector = document.getElementById('modelSelector');

  const HIST_KEY = 'siriHistory';
  const MODEL_KEY = 'siriModel';
  let history = [];
  try { history = JSON.parse(localStorage.getItem(HIST_KEY)) || []; } catch (e) {}

  let currentModel = localStorage.getItem(MODEL_KEY) || 'offline';
  let availableModels = { groq: false, gemini: false };

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
    "What can you do?",
    "Explain black holes simply",
    "Write a haiku about iPhones",
    "What's the capital of Japan?"
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
    "Today is the day you make something new."
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

  // ===== Local navigation/device intents (always run before AI) =====
  function tryLocalIntent(question) {
    const q = question.trim().toLowerCase();
    if (!q) return null;

    if (/\bopen|launch|start|go to\b/.test(q)) {
      if (/calculator|math app/.test(q)) return navigate('calculator.html', 'Calculator');
      if (/notes/.test(q)) return navigate('notes.html', 'Notes');
      if (/camera/.test(q)) return navigate('camera.html', 'Camera');
      if (/phone|dialer|call app/.test(q)) return navigate('call.html', 'Phone');
      if (/settings|setting/.test(q)) return navigate('home.html', 'Settings');
      if (/music/.test(q)) return navigate('music.html', 'Music');
      if (/weather app/.test(q)) return navigate('weather.html', 'Weather');
      if (/mail|email/.test(q)) return navigate('mail.html', 'Mail');
      if (/home screen|home$/.test(q)) return navigate('homescreen.html', 'Home Screen');
      if (/2048|game|play/.test(q)) return navigate('game.html', 'Games');
      if (/app store|store/.test(q)) return navigate('app-store.html', 'App Store');
    }

    if (/(plug|start charging|turn on charger)/.test(q) && !/unplug|stop/.test(q)) {
      if (window.iOSDevice) window.iOSDevice.setCharging(true);
      return "Done. I've turned on charging.";
    }
    if (/unplug|stop charging|turn off charger/.test(q)) {
      if (window.iOSDevice) window.iOSDevice.setCharging(false);
      return "Charger unplugged.";
    }

    return null;
  }

  // ===== Offline pattern matcher =====
  function offlineAnswer(question) {
    const q = question.trim().toLowerCase();
    if (!q) return "I didn't catch that. Try again.";

    if (/^(hi|hello|hey|yo|hola)\b/.test(q)) return "Hi! What can I help you with?";
    if (/how are you|how's it going/.test(q)) return "I'm doing great, thanks for asking. How can I help?";
    if (/thank|thanks/.test(q)) return "You're welcome!";
    if (/who are you|what are you/.test(q)) return "I'm Siri, your virtual assistant.";
    if (/what can you do|help me|capabilities/.test(q)) {
      return "I can tell you the time, date, battery level, do math, tell jokes, flip coins, roll dice, give weather, and open apps. Switch to Groq or Gemini above for full AI answers.";
    }

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

    if (/battery|charge|power/.test(q)) {
      const st = deviceState();
      const lvl = Math.round(st.battery);
      if (st.charging) return `Your iPhone is at ${lvl}% and charging.`;
      if (lvl <= 20) return `Your battery is low — ${lvl}%. You should plug it in.`;
      return `Your iPhone battery is at ${lvl}%.`;
    }

    if (/wifi|wi-fi|wireless/.test(q)) {
      return deviceState().wifiOn ? "Wi-Fi is on." : "Wi-Fi is off.";
    }
    if (/bluetooth/.test(q)) {
      return deviceState().bluetoothOn ? "Bluetooth is on." : "Bluetooth is off.";
    }

    if (/weather|forecast|rain|sunny|temperature/.test(q)) {
      const conditions = ['sunny', 'partly cloudy', 'cloudy', 'lightly raining', 'clear'];
      const temp = 60 + Math.floor(Math.random() * 25);
      return `Right now it's ${temp}°F and ${pick(conditions)} where you are.`;
    }

    if (/flip.*coin|coin.*flip/.test(q)) return Math.random() < 0.5 ? "Heads." : "Tails.";
    if (/(roll|throw).*(dice|die)|dice|random number/.test(q)) {
      return "I rolled a " + (1 + Math.floor(Math.random() * 6)) + ".";
    }
    if (/joke|funny|humor/.test(q)) return pick(JOKES);
    if (/fortune|future|predict|will i/.test(q)) return pick(FORTUNES);

    const m = evaluateMath(q);
    if (m !== null) return `That's ${m}.`;

    const tm = q.match(/(\d+)\s*(minute|min|sec|second|hour)/);
    if (/timer|alarm/.test(q) && tm) {
      return `Okay, I would set a ${tm[1]} ${tm[2]}${parseInt(tm[1])>1?'s':''} timer (demo).`;
    }

    if (/remind|note|remember/.test(q)) {
      return navigate('notes.html', 'Notes to write that down');
    }

    return pick([
      "I'm not sure I understood that. Try Groq or Gemini above for smarter answers.",
      "Hmm, I don't have an answer for that in offline mode. Switch to Groq or Gemini for AI replies.",
      "I didn't quite get that. Tap a suggestion below or switch to an AI model."
    ]);
  }

  // ===== AI proxy call =====
  async function callAI(model, question) {
    const res = await fetch(`/api/siri/${model}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        history: history.slice(0, 6).reverse()
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.reply) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data.reply;
  }

  async function answer(question) {
    const local = tryLocalIntent(question);
    if (local !== null) return local;

    if (currentModel === 'offline') {
      return offlineAnswer(question);
    }

    try {
      return await callAI(currentModel, question);
    } catch (err) {
      console.warn('AI call failed, falling back to offline:', err);
      const fallback = offlineAnswer(question);
      return fallback + ` (${currentModel} unavailable)`;
    }
  }

  async function ask() {
    const question = input.value.trim();
    if (!question) return;
    transcript.textContent = '"' + question + '"';
    transcript.classList.add('active');
    setStatus(currentModel === 'offline' ? 'Thinking…' : `Asking ${currentModel}…`, 'thinking');
    setOrbState('thinking');
    input.value = '';

    try {
      const a = await answer(question);
      replyEl.textContent = a;
      replyEl.classList.add('active');
      setStatus('', 'idle');
      pushHistory(question, a);
      speak(a);
    } catch (err) {
      replyEl.textContent = "Sorry, something went wrong.";
      setStatus('Error. Try again.', 'idle');
      setOrbState('idle');
    }
  }

  // ===== Model selector =====
  function setModel(model) {
    if (model !== 'offline' && !availableModels[model]) {
      setStatus(`${model} key not configured on the server.`, 'idle');
      return;
    }
    currentModel = model;
    try { localStorage.setItem(MODEL_KEY, model); } catch (e) {}
    modelSelector.querySelectorAll('.model-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.model === model);
    });
    const labels = { offline: 'Offline mode — fast pattern matching', groq: 'Groq (Llama 3.1) — fast AI', gemini: 'Gemini 2.0 Flash — smart AI' };
    setStatus(labels[model] || '', 'idle');
  }

  async function loadModelStatus() {
    try {
      const r = await fetch('/api/siri/status');
      const data = await r.json();
      availableModels = { groq: !!data.groq, gemini: !!data.gemini };
    } catch (e) {
      availableModels = { groq: false, gemini: false };
    }
    modelSelector.querySelectorAll('.model-btn').forEach(b => {
      const m = b.dataset.model;
      if (m === 'offline') return;
      if (!availableModels[m]) {
        b.classList.add('disabled');
        b.title = `${m} API key not configured on server`;
      } else {
        b.classList.remove('disabled');
      }
    });
    if (currentModel !== 'offline' && !availableModels[currentModel]) {
      currentModel = 'offline';
    }
    setModel(currentModel);
  }

  modelSelector.querySelectorAll('.model-btn').forEach(b => {
    b.addEventListener('click', () => setModel(b.dataset.model));
  });

  // Voice input
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

  askBtn.addEventListener('click', ask);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') ask(); });
  micBtn.addEventListener('click', toggleMic);
  orb.addEventListener('click', toggleMic);

  setupRecognition();
  renderSuggestions();
  renderHistory();
  loadModelStatus();

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }
})();
