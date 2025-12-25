const messagesEl = document.getElementById('messages');
const input = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const channelNameEl = document.getElementById('channelName');
const createServerBtn = document.getElementById('createServerBtn');

// Channels object with persistence
let channels = {};
const STORAGE_KEY = 'mini_discord_channels_v1';
function loadChannels() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw) channels = JSON.parse(raw);
}
function saveChannels() { localStorage.setItem(STORAGE_KEY, JSON.stringify(channels)); }

// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const currentChannel = urlParams.get('chat') || 'general';
const channelName = urlParams.get('name') || currentChannel;
const currentUser = urlParams.get('user.login') || 'DemoUser';
const confirmFlag = urlParams.get('confirm') || 'false';

channelNameEl.textContent = `# ${channelName}`;
if(!channels[currentChannel]) channels[currentChannel] = [];

// Render messages
function renderMessages(channelId) {
  messagesEl.innerHTML = '';
  channels[channelId].forEach(m => {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<strong>${m.author}</strong>: ${m.text}`;
    messagesEl.appendChild(div);
  });
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Add message
function addMessage(channelId, text, author=currentUser) {
  if(!channels[channelId]) channels[channelId] = [];
  channels[channelId].push({text, author});
  saveChannels();
  renderMessages(channelId);
}

// Bot reply
async function getBotReply(userText) {
  const apiKey = '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';
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: userText }]
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching bot reply:', error);
    return "I'm having trouble connecting right now.";
  }
}

// Send message flow
async function sendMessage() {
  const text = input.value.trim();
  if(!text) return;
  addMessage(currentChannel, text, currentUser);
  input.value = '';
  
  // Show typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message typing';
  typingDiv.innerHTML = `<em>Bot is typing...</em>`;
  messagesEl.appendChild(typingDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  const botReply = await getBotReply(text);
  
  // Remove typing indicator
  messagesEl.removeChild(typingDiv);
  
  addMessage(currentChannel, botReply, 'Bot');
}

// Auto bot message on page load
window.addEventListener('load', async () => {
  loadChannels();
  renderMessages(currentChannel);
  if(confirmFlag === 'true') {
    const welcome = await getBotReply("The user has just joined the chat. Say hello!");
    addMessage(currentChannel, welcome, 'Bot');
  }
});

// Event listeners
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', e=>{if(e.key==='Enter') sendMessage();});

// Sidebar channel clicks
document.querySelectorAll('.sidebar li[data-channel]').forEach(li=>{
  li.addEventListener('click', ()=>{
    const id = li.getAttribute('data-channel');
    const name = li.textContent.replace(/^#\s*/,'') || id;
    if(!channels[id]) channels[id] = [];
    channelNameEl.textContent = `# ${name}`;
    renderMessages(id);
    const params = new URLSearchParams(window.location.search);
    params.set('chat',id);
    params.set('name',name);
    history.pushState({},'',`discord.html?${params.toString()}`);
  });
});

// Create server button
if(createServerBtn){
  createServerBtn.addEventListener('click', ()=>{
    const name = prompt('Enter new server name:');
    if(name) alert(`Server "${name}" created (demo).`);
  });
}
