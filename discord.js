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
function getBotReply(userText) {
  const replies = ["Hello!", "Interesting...", `You said: ${userText}`, "Let's chat more!"];
  return replies[Math.floor(Math.random()*replies.length)];
}

// Send message flow
function sendMessage() {
  const text = input.value.trim();
  if(!text) return;
  addMessage(currentChannel, text, currentUser);
  input.value = '';
  const botReply = getBotReply(text);
  setTimeout(()=>addMessage(currentChannel, botReply, 'Bot'),500);
}

// Auto bot message on page load
window.addEventListener('load', () => {
  loadChannels();
  renderMessages(currentChannel);
  if(confirmFlag === 'true') addMessage(currentChannel, getBotReply("User joined the chat"), 'Bot');
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
