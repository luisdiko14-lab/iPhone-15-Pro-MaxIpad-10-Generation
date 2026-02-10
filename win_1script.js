let currentSetupStep = 0;
let userData = {
    username: 'User',
    password: '',
    email: '',
    accountType: 'local',
    selectedDrive: -1,
    wifiNetwork: ''
};
let openWindows = [];
let nextWindowZ = 100;
let calculatorDisplay = '0';
let calculatorMemory = 0;
let calculatorOperator = null;
let cpuUsage = 0;
let memUsage = 0;
let processes = [];

const setupSteps = [
    'step-welcome',
    'step-region',
    'step-keyboard',
    'step-wifi',
    'step-drive',
    'step-account-type',
    'step-installing'
];

function setupNext() {
    const currentStep = setupSteps[currentSetupStep];

    if (currentStep === 'step-wifi') {
        if (!userData.wifiNetwork) {
            userData.wifiNetwork = 'offline';
        }
    }

    if (currentStep === 'step-drive') {
        if (userData.selectedDrive === -1) {
            alert('Please select a drive');
            return;
        }
    }

    if (currentStep === 'step-account') {
        const username = document.getElementById('username-input').value.trim();
        if (!username) {
            alert('Please enter a name');
            return;
        }
        userData.username = username;
    }

    if (currentStep === 'step-password') {
        const password = document.getElementById('password-input').value;
        const confirm = document.getElementById('password-confirm').value;
        if (!password) {
            alert('Please enter a password');
            return;
        }
        if (password !== confirm) {
            alert('Passwords do not match');
            return;
        }
        userData.password = password;
    }

    if (currentStep === 'step-microsoft-account') {
        const email = document.getElementById('microsoft-email').value.trim();
        if (!email) {
            alert('Please enter your email');
            return;
        }
        userData.email = email;
        userData.username = email.split('@')[0];
        document.getElementById('microsoft-email-display').textContent = email;
    }

    if (currentStep === 'step-microsoft-password') {
        const password = document.getElementById('microsoft-password-input').value;
        if (!password) {
            alert('Please enter your password');
            return;
        }
        userData.password = password;
    }

    const currentStepElement = document.getElementById(currentStep);
    if (currentStepElement) {
        currentStepElement.classList.remove('active');
    }
    currentSetupStep++;

    if (currentSetupStep < setupSteps.length) {
        const nextStepElement = document.getElementById(setupSteps[currentSetupStep]);
        if (nextStepElement) {
            nextStepElement.classList.add('active');
        }

        if (setupSteps[currentSetupStep] === 'step-installing') {
            startInstallation();
        }
    }
}

function selectWifi(networkName) {
    userData.wifiNetwork = networkName;
    document.getElementById('wifi-network-name').textContent = networkName;

    if (networkName === 'Guest Network') {
        setupNext();
    } else {
        document.getElementById('step-wifi').classList.remove('active');
        document.getElementById('step-wifi-password').classList.add('active');
    }
}

function connectWifi() {
    const password = document.getElementById('wifi-password-input').value;
    if (!password) {
        alert('Please enter the network password');
        return;
    }

    document.getElementById('step-wifi-password').classList.remove('active');
    document.getElementById('step-wifi').classList.add('active');
    setupNext();
}

function selectDrive(driveIndex) {
    document.querySelectorAll('.drive-item').forEach((item, index) => {
        item.classList.toggle('selected', index === driveIndex);
    });

    userData.selectedDrive = driveIndex;
    document.getElementById('drive-next-btn').disabled = false;
}

function selectAccountType(type) {
    userData.accountType = type;

    if (type === 'microsoft') {
        document.getElementById('step-account-type').classList.remove('active');
        document.getElementById('step-microsoft-account').classList.add('active');
    } else {
        document.getElementById('step-account-type').classList.remove('active');
        document.getElementById('step-account').classList.add('active');
    }
}

function handleMicrosoftAccountNext() {
    document.getElementById('step-microsoft-account').classList.remove('active');
    document.getElementById('step-microsoft-password').classList.add('active');
}

function handleMicrosoftPasswordNext() {
    document.getElementById('step-microsoft-password').classList.remove('active');
    document.getElementById('step-privacy').classList.add('active');
}

function handleLocalAccountNext() {
    const username = document.getElementById('username-input').value.trim();
    if (!username) {
        alert('Please enter a name');
        return;
    }
    userData.username = username;
    document.getElementById('step-account').classList.remove('active');
    document.getElementById('step-password').classList.add('active');
}

function handleLocalPasswordNext() {
    const password = document.getElementById('password-input').value;
    const confirm = document.getElementById('password-confirm').value;
    if (!password) {
        alert('Please enter a password');
        return;
    }
    if (password !== confirm) {
        alert('Passwords do not match');
        return;
    }
    userData.password = password;
    document.getElementById('step-password').classList.remove('active');
    document.getElementById('step-privacy').classList.add('active');
}

function handleMicrosoftAccountNext() {
    const email = document.getElementById('microsoft-email').value.trim();
    if (!email) {
        alert('Please enter your email');
        return;
    }
    userData.email = email;
    userData.username = email.split('@')[0];
    document.getElementById('microsoft-email-display').textContent = email;
    document.getElementById('step-microsoft-account').classList.remove('active');
    document.getElementById('step-microsoft-password').classList.add('active');
}

function handleMicrosoftPasswordNext() {
    const password = document.getElementById('microsoft-password-input').value;
    if (!password) {
        alert('Please enter your password');
        return;
    }
    userData.password = password;
    document.getElementById('step-microsoft-password').classList.remove('active');
    document.getElementById('step-privacy').classList.add('active');
}

function handlePrivacyNext() {
    document.getElementById('step-privacy').classList.remove('active');
    currentSetupStep = setupSteps.indexOf('step-installing');
    document.getElementById('step-installing').classList.add('active');
    startInstallation();
}

function createMicrosoftAccount() {
    alert('Create account feature - redirects to Microsoft account creation page');
}

function forgotPassword() {
    alert('Forgot password feature - redirects to Microsoft account recovery');
}

function startInstallation() {
    const messages = [
        'Installing Windows...',
        'Setting up devices...',
        'Getting ready...',
        'Almost there...',
        'Finalizing setup...'
    ];

    let progress = 0;
    let messageIndex = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;

        document.getElementById('progress-fill').style.width = progress + '%';
        document.getElementById('progress-text').textContent = Math.floor(progress) + '%';

        if (progress > 20 * (messageIndex + 1) && messageIndex < messages.length - 1) {
            messageIndex++;
            document.getElementById('install-message').textContent = messages[messageIndex];
        }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                showScreen('screen-lock');
                updateLockTime();
            }, 1000);
        }
    }, 500);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function updateLockTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const lockTime = document.getElementById('lock-time');
    const lockDate = document.getElementById('lock-date');

    if (lockTime) lockTime.textContent = timeStr;
    if (lockDate) lockDate.textContent = dateStr;
}

document.addEventListener('DOMContentLoaded', () => {
    const savedUserData = localStorage.getItem('windowsUserData');
    if (!savedUserData) {
        window.location.href = 'setup_1.html';
        return;
    }

    const parsed = JSON.parse(savedUserData);
    userData.username = parsed.username || 'User';
    userData.password = parsed.password || '';
    userData.email = parsed.email || '';
    userData.accountType = parsed.accountType || 'local';

    startBootSequence();

    document.getElementById('screen-lock')?.addEventListener('click', () => {
        showScreen('screen-login');
        document.getElementById('login-username').textContent = userData.username;
    });

    document.getElementById('login-password')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });

    updateClock();
    setInterval(updateClock, 1000);

    startPerformanceMonitoring();

    checkUrlParams();
});

function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const openedApp = params.get('opened');
    if (openedApp) {
        setTimeout(() => {
            openApp(openedApp);
        }, 5500);
    }
}

function updateUrlParam(appName) {
    const url = new URL(window.location);
    if (appName) {
        url.searchParams.set('opened', appName);
    } else {
        url.searchParams.delete('opened');
    }
    window.history.replaceState({}, '', url);
}

function playSound(soundName) {
    try {
        if (soundName === 'startup') {
            const iframe = document.getElementById('startup-sound');
            if (iframe) {
                iframe.src = 'https://www.myinstants.com/instant/windows-10-startup-sound-tune-93817/embed/';
            }
        } else if (soundName === 'boot') {
            const iframe = document.getElementById('boot-sound');
            if (iframe) {
                iframe.src = 'https://www.myinstants.com/instant/windows-10-boot-8293/embed/';
            }
        } else {
            const audio = document.getElementById(soundName + '-sound');
            if (audio) {
                audio.currentTime = 0;
                audio.volume = 0.5;
                audio.play().catch(() => {});
            }
        }
    } catch (e) {}
}

function startBootSequence() {
    playSound('boot');

    const bootStatus = document.getElementById('boot-status');
    const bootMessages = [
        'Loading Windows...',
        'Starting services...',
        'Loading system files...'
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        messageIndex++;
        if (messageIndex < bootMessages.length) {
            if (bootStatus) bootStatus.textContent = bootMessages[messageIndex];
        }
    }, 800);

    setTimeout(() => {
        clearInterval(messageInterval);
        showScreen('screen-lock');
        updateLockTime();
        playSound('startup');
    }, 2500);
}

function startLoginSequence() {
    const loggingInText = document.getElementById('logging-in-text');
    const loginStatus = document.getElementById('login-status');

    if (loggingInText) loggingInText.textContent = 'Welcome';
    if (loginStatus) loginStatus.textContent = userData.username;

    showScreen('screen-logging-in');

    setTimeout(() => {
        if (loggingInText) loggingInText.textContent = 'Signing in...';
        if (loginStatus) loginStatus.textContent = 'Setting up your account';
    }, 1500);

    setTimeout(() => {
        showScreen('screen-getting-ready');
    }, 3000);

    setTimeout(() => {
        showScreen('screen-desktop');
        document.getElementById('start-username').textContent = userData.username;
        playSound('notification');
    }, 5000);
}

function attemptLogin() {
    const enteredPassword = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');

    if (enteredPassword === userData.password) {
        document.getElementById('login-password').value = '';
        errorElement.textContent = '';
        startLoginSequence();
    } else {
        errorElement.textContent = 'Incorrect password. Please try again.';
        document.getElementById('login-password').value = '';
        playSound('error');
    }
}

function switchUser() {
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').textContent = '';
}

function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

    const clockElement = document.getElementById('taskbar-clock');
    if (clockElement) {
        clockElement.innerHTML = `${timeStr}<br>${dateStr}`;
    }
}

function toggleStartMenu() {
    const startMenu = document.getElementById('start-menu');
    startMenu.classList.toggle('active');

    const powerMenu = document.getElementById('power-menu');
    if (powerMenu.classList.contains('active')) {
        powerMenu.classList.remove('active');
    }
}

function togglePowerMenu() {
    const powerMenu = document.getElementById('power-menu');
    powerMenu.classList.toggle('active');
}

function toggleNotifications() {
    const notificationCenter = document.getElementById('notification-center');
    notificationCenter.classList.toggle('active');
}

function lockScreen() {
    showScreen('screen-lock');
    updateLockTime();
    closeAllWindows();
}

function signOut() {
    closeAllWindows();
    toggleStartMenu(false);

    showScreen('screen-signout');

    setTimeout(() => {
        showScreen('screen-lock');
        updateLockTime();
        document.getElementById('login-password').value = '';
    }, 2500);
}

function restart() {
    closeAllWindows();
    showScreen('screen-shutdown');
    document.getElementById('shutdown-text').textContent = 'Restarting...';

    setTimeout(() => {
        showScreen('screen-lock');
        updateLockTime();
    }, 3000);
}

function shutdown() {
    playSound('shutdown');
    closeAllWindows();
    toggleStartMenu(false);
    showScreen('screen-shutdown');
    document.getElementById('shutdown-text').textContent = 'Shutting down...';

    setTimeout(() => {
        showScreen('screen-off');

        setTimeout(() => {
            window.close();

            if (!window.closed) {
                document.body.innerHTML = `
                    <div style="width: 100%; height: 100vh; background: #000; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #333;">
                        <p style="font-size: 14px; color: #555;">Computer has been shut down</p>
                        <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #0078d4; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">🔄 Power On</button>
                    </div>
                `;
            }
        }, 500);
    }, 5000);
}

function closeAllWindows() {
    openWindows.forEach(win => {
        if (win.element && win.element.parentNode) {
            win.element.parentNode.removeChild(win.element);
        }
    });
    openWindows = [];
    updateTaskbar();
}

function openApp(appName) {
    const existingWindow = openWindows.find(w => w.appName === appName);
    if (existingWindow) {
        focusWindow(existingWindow);
        return;
    }

    const windowData = createWindow(appName);
    openWindows.push(windowData);
    updateTaskbar();
    updateUrlParam(appName);

    const startMenu = document.getElementById('start-menu');
    if (startMenu.classList.contains('active')) {
        startMenu.classList.remove('active');
    }
}

function createWindow(appName) {
    const windowEl = document.createElement('div');
    windowEl.className = 'window active';
    windowEl.style.left = (100 + openWindows.length * 30) + 'px';
    windowEl.style.top = (80 + openWindows.length * 30) + 'px';
    windowEl.style.zIndex = nextWindowZ++;

    const apps = {
        calculator: { title: '🔢 Calculator', content: createCalculator() },
        notepad: { title: '📝 Notepad', content: createNotepad() },
        explorer: { title: '📁 File Explorer', content: createExplorer() },
        settings: { title: '⚙️ Settings', content: createSettings() },
        taskmgr: { title: '📊 Task Manager', content: createTaskManager() },
        browser: { title: '🌐 Microsoft Edge', content: createBrowser() },
        computer: { title: '💻 This PC', content: createComputer() },
        trash: { title: '🗑️ Recycle Bin', content: '<p>Recycle Bin is empty</p>' },
        search: { title: '🔍 Search', content: '<p>Type to search your PC...</p>' },
        google_setup: { title: '🌐 Google Chrome Setup', content: createGoogleSetup() },
        chrome: { title: '🔵 Google Chrome', content: createChrome() },
        cmd: { title: '⬛ Command Prompt', content: createCMD() },
        paint: { title: '🎨 Paint', content: createPaint() },
        weather: { title: '🌤️ Weather', content: createWeather() },
        snipping: { title: '✂️ Snipping Tool', content: createSnipping() },
        photos: { title: '🖼️ Photos', content: createPhotos() },
        calendar: { title: '📅 Calendar', content: createCalendar() },
        clock: { title: '⏰ Alarms & Clock', content: createClockApp() },
        maps: { title: '🗺️ Maps', content: createMaps() },
        store: { title: '🛍️ Microsoft Store', content: createStore() },
        wifi: { title: '📶 Network & Internet', content: createWifiSettings() },
        defender: { title: '🛡️ Windows Security', content: createDefender() }
    };

    const appData = apps[appName] || { title: 'Window', content: '<p>App content</p>' };

    windowEl.innerHTML = `
        <div class="window-titlebar">
            <div class="window-title">${appData.title}</div>
            <div class="window-controls">
                <button class="window-control minimize" onclick="minimizeWindow('${appName}')">−</button>
                <button class="window-control maximize" onclick="maximizeWindow('${appName}')">□</button>
                <button class="window-control close" onclick="closeWindow('${appName}')">✕</button>
            </div>
        </div>
        <div class="window-content ${appName === 'notepad' ? 'notepad-content' : ''}" id="window-content-${appName}">
            ${appData.content}
        </div>
    `;

    document.getElementById('windows-container').appendChild(windowEl);

    windowEl.addEventListener('mousedown', () => focusWindow({ appName, element: windowEl }));

    makeDraggable(windowEl);

    return { appName, element: windowEl, title: appData.title };
}

function makeDraggable(element) {
    const titlebar = element.querySelector('.window-titlebar');
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    titlebar.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + 'px';
        element.style.left = (element.offsetLeft - pos1) + 'px';
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function focusWindow(windowData) {
    openWindows.forEach(w => {
        if (w.element) w.element.classList.remove('active');
    });
    if (windowData.element) {
        windowData.element.classList.add('active');
        windowData.element.style.zIndex = nextWindowZ++;
    }
    updateTaskbar();
}

function minimizeWindow(appName) {
    const windowData = openWindows.find(w => w.appName === appName);
    if (windowData && windowData.element) {
        windowData.element.style.display = 'none';
    }
    updateTaskbar();
}

function maximizeWindow(appName) {
    const windowData = openWindows.find(w => w.appName === appName);
    if (windowData && windowData.element) {
        const win = windowData.element;
        if (win.style.width === '100%') {
            win.style.width = '';
            win.style.height = '';
            win.style.left = '';
            win.style.top = '';
        } else {
            win.style.width = '100%';
            win.style.height = 'calc(100% - 48px)';
            win.style.left = '0';
            win.style.top = '0';
        }
    }
}

function closeWindow(appName) {
    const windowData = openWindows.find(w => w.appName === appName);
    if (windowData && windowData.element) {
        windowData.element.remove();
    }
    openWindows = openWindows.filter(w => w.appName !== appName);
    updateTaskbar();
}

function updateTaskbar() {
    const taskbarApps = document.getElementById('taskbar-apps');
    taskbarApps.innerHTML = '';

    openWindows.forEach(win => {
        const btn = document.createElement('button');
        btn.className = 'taskbar-app';
        btn.textContent = win.title;
        btn.onclick = () => {
            if (win.element.style.display === 'none') {
                win.element.style.display = 'flex';
                focusWindow(win);
            } else {
                focusWindow(win);
            }
        };

        if (win.element && win.element.classList.contains('active') && win.element.style.display !== 'none') {
            btn.classList.add('active');
        }

        taskbarApps.appendChild(btn);
    });
}

function createCalculator() {
    setTimeout(() => {
        calculatorDisplay = '0';
        updateCalculatorDisplay();
    }, 10);

    return `
        <div class="calculator-grid">
            <div class="calculator-display" id="calc-display">0</div>
            <button class="calc-btn" onclick="calcClear()">C</button>
            <button class="calc-btn" onclick="calcClearEntry()">CE</button>
            <button class="calc-btn operator" onclick="calcDelete()">⌫</button>
            <button class="calc-btn operator" onclick="calcOperation('/')">÷</button>
            <button class="calc-btn" onclick="calcNumber('7')">7</button>
            <button class="calc-btn" onclick="calcNumber('8')">8</button>
            <button class="calc-btn" onclick="calcNumber('9')">9</button>
            <button class="calc-btn operator" onclick="calcOperation('*')">×</button>
            <button class="calc-btn" onclick="calcNumber('4')">4</button>
            <button class="calc-btn" onclick="calcNumber('5')">5</button>
            <button class="calc-btn" onclick="calcNumber('6')">6</button>
            <button class="calc-btn operator" onclick="calcOperation('-')">−</button>
            <button class="calc-btn" onclick="calcNumber('1')">1</button>
            <button class="calc-btn" onclick="calcNumber('2')">2</button>
            <button class="calc-btn" onclick="calcNumber('3')">3</button>
            <button class="calc-btn operator" onclick="calcOperation('+')">+</button>
            <button class="calc-btn" onclick="calcNumber('0')">0</button>
            <button class="calc-btn" onclick="calcDecimal()">.</button>
            <button class="calc-btn equals" onclick="calcEquals()" style="grid-column: span 2">=</button>
        </div>
    `;
}

function calcNumber(num) {
    if (calculatorDisplay === '0' || calculatorDisplay === 'Error') {
        calculatorDisplay = num;
    } else {
        calculatorDisplay += num;
    }
    updateCalculatorDisplay();
}

function calcOperation(op) {
    if (calculatorOperator && calculatorDisplay !== '') {
        calcEquals();
    }
    calculatorMemory = parseFloat(calculatorDisplay);
    calculatorOperator = op;
    calculatorDisplay = '';
}

function calcEquals() {
    if (calculatorOperator && calculatorDisplay !== '') {
        const current = parseFloat(calculatorDisplay);
        let result = 0;

        switch (calculatorOperator) {
            case '+': result = calculatorMemory + current; break;
            case '-': result = calculatorMemory - current; break;
            case '*': result = calculatorMemory * current; break;
            case '/': result = calculatorMemory / current; break;
        }

        calculatorDisplay = result.toString();
        calculatorOperator = null;
        updateCalculatorDisplay();
    }
}

function calcClear() {
    calculatorDisplay = '0';
    calculatorMemory = 0;
    calculatorOperator = null;
    updateCalculatorDisplay();
}

function calcClearEntry() {
    calculatorDisplay = '0';
    updateCalculatorDisplay();
}

function calcDelete() {
    if (calculatorDisplay.length > 1) {
        calculatorDisplay = calculatorDisplay.slice(0, -1);
    } else {
        calculatorDisplay = '0';
    }
    updateCalculatorDisplay();
}

function calcDecimal() {
    if (!calculatorDisplay.includes('.')) {
        calculatorDisplay += '.';
        updateCalculatorDisplay();
    }
}

function updateCalculatorDisplay() {
    const display = document.getElementById('calc-display');
    if (display) {
        display.textContent = calculatorDisplay;
    }
}

function createNotepad() {
    return '<textarea class="notepad-textarea" placeholder="Start typing..."></textarea>';
}

let explorerPath = 'This PC';
let explorerHistory = ['This PC'];
let explorerHistoryIndex = 0;

const fileSystem = {
    'This PC': {
        type: 'folder',
        items: [
            { name: 'Desktop', type: 'folder', icon: '🖥️', color: '#0078d4' },
            { name: 'Documents', type: 'folder', icon: '📁', color: '#f4b400' },
            { name: 'Downloads', type: 'folder', icon: '⬇️', color: '#34a853' },
            { name: 'Pictures', type: 'folder', icon: '🖼️', color: '#ea4335' },
            { name: 'Music', type: 'folder', icon: '🎵', color: '#9c27b0' },
            { name: 'Videos', type: 'folder', icon: '🎬', color: '#ff5722' },
            { name: 'Local Disk (C:)', type: 'drive', icon: '💾', color: '#607d8b', size: '237 GB free of 476 GB' },
            { name: 'USB Drive (D:)', type: 'drive', icon: '🔌', color: '#795548', size: '14.2 GB free of 16 GB' }
        ]
    },
    'Desktop': {
        type: 'folder',
        items: [
            { name: 'This PC', type: 'shortcut', icon: '💻', color: '#0078d4' },
            { name: 'Recycle Bin', type: 'shortcut', icon: '🗑️', color: '#666' },
            { name: 'Notes.txt', type: 'file', icon: '📝', color: '#4caf50' },
            { name: 'Project.docx', type: 'file', icon: '📄', color: '#2196f3' }
        ]
    },
    'Documents': {
        type: 'folder',
        items: [
            { name: 'Work', type: 'folder', icon: '💼', color: '#795548' },
            { name: 'Personal', type: 'folder', icon: '👤', color: '#9c27b0' },
            { name: 'Resume.pdf', type: 'file', icon: '📕', color: '#f44336' },
            { name: 'Budget.xlsx', type: 'file', icon: '📊', color: '#4caf50' },
            { name: 'Notes.txt', type: 'file', icon: '📝', color: '#ff9800' }
        ]
    },
    'Downloads': {
        type: 'folder',
        items: [
            { name: 'Setup.exe', type: 'file', icon: '⚙️', color: '#607d8b' },
            { name: 'Photo.jpg', type: 'file', icon: '🖼️', color: '#e91e63' },
            { name: 'Music.mp3', type: 'file', icon: '🎵', color: '#9c27b0' },
            { name: 'Video.mp4', type: 'file', icon: '🎬', color: '#ff5722' }
        ]
    },
    'Pictures': {
        type: 'folder',
        items: [
            { name: 'Wallpapers', type: 'folder', icon: '🖼️', color: '#3f51b5' },
            { name: 'Screenshots', type: 'folder', icon: '📸', color: '#009688' },
            { name: 'vacation.jpg', type: 'file', icon: '🏖️', color: '#ff9800' },
            { name: 'family.png', type: 'file', icon: '👨‍👩‍👧', color: '#e91e63' }
        ]
    },
    'Music': {
        type: 'folder',
        items: [
            { name: 'Playlists', type: 'folder', icon: '📋', color: '#673ab7' },
            { name: 'song1.mp3', type: 'file', icon: '🎵', color: '#9c27b0' },
            { name: 'song2.mp3', type: 'file', icon: '🎵', color: '#9c27b0' }
        ]
    },
    'Videos': {
        type: 'folder',
        items: [
            { name: 'Movies', type: 'folder', icon: '🎬', color: '#f44336' },
            { name: 'Clips', type: 'folder', icon: '🎥', color: '#ff5722' }
        ]
    }
};

function createExplorer() {
    setTimeout(() => setupExplorerEvents(), 100);
    return renderExplorer();
}

function renderExplorer() {
    const currentFolder = fileSystem[explorerPath] || fileSystem['This PC'];
    const items = currentFolder.items || [];

    return `
        <div class="explorer-toolbar" style="background: linear-gradient(180deg, #f8f9fa, #e9ecef); padding: 8px 12px; display: flex; gap: 8px; align-items: center; border-bottom: 1px solid #dee2e6;">
            <button class="explorer-nav-btn" onclick="explorerBack()" style="padding: 6px 12px; border: 1px solid #ced4da; border-radius: 4px; background: white; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                <span style="font-size: 16px;">←</span>
            </button>
            <button class="explorer-nav-btn" onclick="explorerForward()" style="padding: 6px 12px; border: 1px solid #ced4da; border-radius: 4px; background: white; cursor: pointer;">
                <span style="font-size: 16px;">→</span>
            </button>
            <button class="explorer-nav-btn" onclick="explorerUp()" style="padding: 6px 12px; border: 1px solid #ced4da; border-radius: 4px; background: white; cursor: pointer;">
                <span style="font-size: 16px;">↑</span>
            </button>
            <div style="flex: 1; display: flex; align-items: center; background: white; border: 1px solid #ced4da; border-radius: 4px; padding: 6px 12px;">
                <span style="color: #0078d4; margin-right: 8px;">📁</span>
                <span id="explorer-path-display" style="color: #333;">${explorerPath}</span>
            </div>
            <input type="text" placeholder="🔍 Search" style="padding: 6px 12px; border: 1px solid #ced4da; border-radius: 4px; width: 200px;">
        </div>
        <div style="display: flex; flex: 1; overflow: hidden;">
            <div class="explorer-sidebar" style="width: 200px; background: #f8f9fa; border-right: 1px solid #dee2e6; padding: 12px; overflow-y: auto;">
                <div style="margin-bottom: 16px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 8px; font-weight: 600;">Quick access</div>
                    <div class="explorer-sidebar-item" onclick="navigateExplorer('Desktop')" style="padding: 8px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s;">
                        <span style="font-size: 18px;">🖥️</span> Desktop
                    </div>
                    <div class="explorer-sidebar-item" onclick="navigateExplorer('Downloads')" style="padding: 8px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 18px;">⬇️</span> Downloads
                    </div>
                    <div class="explorer-sidebar-item" onclick="navigateExplorer('Documents')" style="padding: 8px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 18px;">📁</span> Documents
                    </div>
                    <div class="explorer-sidebar-item" onclick="navigateExplorer('Pictures')" style="padding: 8px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 18px;">🖼️</span> Pictures
                    </div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 8px; font-weight: 600;">This PC</div>
                    <div class="explorer-sidebar-item" onclick="navigateExplorer('This PC')" style="padding: 8px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 18px;">💻</span> This PC
                    </div>
                </div>
            </div>
            <div class="explorer-main" id="explorer-main" style="flex: 1; padding: 16px; overflow-y: auto; background: white;">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px;">
                    ${items.map(item => `
                        <div class="explorer-item" onclick="${item.type === 'folder' ? `navigateExplorer('${item.name}')` : `openFile('${item.name}')`}" 
                             style="padding: 16px; border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.2s; border: 2px solid transparent;">
                            <div style="font-size: 48px; margin-bottom: 8px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));">${item.icon}</div>
                            <div style="font-size: 13px; color: #333; word-break: break-word;">${item.name}</div>
                            ${item.size ? `<div style="font-size: 11px; color: #666; margin-top: 4px;">${item.size}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        <div style="background: #f8f9fa; padding: 6px 12px; border-top: 1px solid #dee2e6; font-size: 12px; color: #666;">
            ${items.length} items
        </div>
    `;
}

function setupExplorerEvents() {
    document.querySelectorAll('.explorer-sidebar-item').forEach(item => {
        item.addEventListener('mouseenter', () => item.style.background = '#e9ecef');
        item.addEventListener('mouseleave', () => item.style.background = 'transparent');
    });
    document.querySelectorAll('.explorer-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.background = '#e3f2fd';
            item.style.borderColor = '#90caf9';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = 'transparent';
            item.style.borderColor = 'transparent';
        });
    });
}

function navigateExplorer(path) {
    if (fileSystem[path]) {
        explorerPath = path;
        explorerHistory = explorerHistory.slice(0, explorerHistoryIndex + 1);
        explorerHistory.push(path);
        explorerHistoryIndex = explorerHistory.length - 1;
        updateExplorerView();
    }
}

function explorerBack() {
    if (explorerHistoryIndex > 0) {
        explorerHistoryIndex--;
        explorerPath = explorerHistory[explorerHistoryIndex];
        updateExplorerView();
    }
}

function explorerForward() {
    if (explorerHistoryIndex < explorerHistory.length - 1) {
        explorerHistoryIndex++;
        explorerPath = explorerHistory[explorerHistoryIndex];
        updateExplorerView();
    }
}

function explorerUp() {
    if (explorerPath !== 'This PC') {
        navigateExplorer('This PC');
    }
}

function updateExplorerView() {
    const explorerWindow = document.querySelector('.window[data-app="explorer"] .window-content');
    if (explorerWindow) {
        explorerWindow.innerHTML = renderExplorer();
        setTimeout(() => setupExplorerEvents(), 50);
    }
}

function openFile(filename) {
    if (filename.endsWith('.txt')) {
        openApp('notepad');
    } else if (filename.endsWith('.jpg') || filename.endsWith('.png')) {
        openApp('photos');
    } else if (filename.endsWith('.mp3')) {
        playSound('notification');
        alert('Now playing: ' + filename);
    } else {
        alert('Opening: ' + filename);
    }
}

let currentWallpaper = 'gradient1';
let accentColor = '#0078d4';

function createSettings() {
    setTimeout(() => {
        const menuItems = document.querySelectorAll('.settings-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                menuItems.forEach(mi => mi.classList.remove('active'));
                this.classList.add('active');

                const contentArea = this.closest('.window-content').querySelector('.settings-content');
                const section = this.textContent.trim();

                let content = '';

                switch(section) {
                    case 'System':
                        content = `
                            <h2>⚙️ System</h2>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Display brightness</div>
                                    <div class="setting-description">Adjust screen brightness</div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <input type="range" min="20" max="100" value="80" style="width: 200px;" oninput="setSettingsBrightness(this.value)">
                                    <span id="settings-brightness-val">80%</span>
                                </div>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Night light</div>
                                    <div class="setting-description">Reduce blue light to help you sleep</div>
                                </div>
                                <label class="toggle-switch"><input type="checkbox" onchange="toggleSettingsNightLight(this.checked)"><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Sound volume</div>
                                    <div class="setting-description" id="sound-vol-desc">Volume: 75%</div>
                                </div>
                                <input type="range" min="0" max="100" value="75" style="width: 200px;" oninput="document.getElementById('sound-vol-desc').textContent='Volume: '+this.value+'%'">
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Notifications</div>
                                    <div class="setting-description">Get notifications from apps</div>
                                </div>
                                <label class="toggle-switch"><input type="checkbox" checked><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Power & battery</div>
                                    <div class="setting-description">87% - Plugged in</div>
                                </div>
                                <select style="padding: 8px; border-radius: 4px;">
                                    <option>Balanced</option>
                                    <option>Best performance</option>
                                    <option>Best battery life</option>
                                </select>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Storage</div>
                                    <div class="setting-description">C: Drive - 237 GB free of 476 GB</div>
                                </div>
                                <div style="width: 200px; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
                                    <div style="width: 50%; height: 100%; background: #0078d4;"></div>
                                </div>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">About</div>
                                    <div class="setting-description">Windows 10 Pro - Version 22H2</div>
                                </div>
                                <button onclick="alert('Device name: DESKTOP-WIN10\\nProcessor: Intel Core i7\\nRAM: 16.0 GB\\nSystem type: 64-bit')" style="padding: 8px 16px; cursor: pointer; border-radius: 4px; border: 1px solid #ccc;">View specs</button>
                            </div>
                        `;
                        break;
                    case 'Personalization':
                        content = `
                            <h2>🎨 Personalization</h2>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Background</div>
                                    <div class="setting-description">Choose your desktop wallpaper</div>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0;">
                                <div class="wallpaper-option" onclick="setWallpaper('gradient1', this)" style="height: 80px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 8px; cursor: pointer; border: 3px solid ${currentWallpaper === 'gradient1' ? '#0078d4' : 'transparent'};"></div>
                                <div class="wallpaper-option" onclick="setWallpaper('gradient2', this)" style="height: 80px; background: linear-gradient(135deg, #11998e, #38ef7d); border-radius: 8px; cursor: pointer; border: 3px solid ${currentWallpaper === 'gradient2' ? '#0078d4' : 'transparent'};"></div>
                                <div class="wallpaper-option" onclick="setWallpaper('gradient3', this)" style="height: 80px; background: linear-gradient(135deg, #ee0979, #ff6a00); border-radius: 8px; cursor: pointer; border: 3px solid ${currentWallpaper === 'gradient3' ? '#0078d4' : 'transparent'};"></div>
                                <div class="wallpaper-option" onclick="setWallpaper('gradient4', this)" style="height: 80px; background: linear-gradient(135deg, #2193b0, #6dd5ed); border-radius: 8px; cursor: pointer; border: 3px solid ${currentWallpaper === 'gradient4' ? '#0078d4' : 'transparent'};"></div>
                                <div class="wallpaper-option" onclick="setWallpaper('solid1', this)" style="height: 80px; background: #0078d4; border-radius: 8px; cursor: pointer; border: 3px solid ${currentWallpaper === 'solid1' ? '#0078d4' : 'transparent'};"></div>
                                <div class="wallpaper-option" onclick="setWallpaper('solid2', this)" style="height: 80px; background: #1a1a2e; border-radius: 8px; cursor: pointer; border: 3px solid ${currentWallpaper === 'solid2' ? '#0078d4' : 'transparent'};"></div>
                                <div class="wallpaper-option" onclick="setWallpaper('solid3', this)" style="height: 80px; background: #16213e; border-radius: 8px; cursor: pointer; border: 3px solid ${currentWallpaper === 'solid3' ? '#0078d4' : 'transparent'};"></div>
                                <div class="wallpaper-option" onclick="setWallpaper('nature', this)" style="height: 80px; background: linear-gradient(to bottom, #87ceeb, #228b22); border-radius: 8px; cursor: pointer; border: 3px solid ${currentWallpaper === 'nature' ? '#0078d4' : 'transparent'};"></div>
                            </div>
                            <div class="setting-item" style="background: #f0f8ff; border-radius: 8px; padding: 16px; margin: 16px 0;">
                                <div style="margin-bottom: 12px;">
                                    <div class="setting-label">🌐 Custom wallpaper from URL</div>
                                    <div class="setting-description">Paste an image URL to use as wallpaper</div>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <input type="text" id="custom-wallpaper-url" placeholder="https://example.com/image.jpg" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                                    <button onclick="setCustomWallpaper()" style="padding: 10px 20px; background: #0078d4; color: white; border: none; border-radius: 4px; cursor: pointer;">Apply</button>
                                </div>
                                <div id="wallpaper-preview" style="margin-top: 12px; display: none;">
                                    <img id="wallpaper-preview-img" style="max-width: 200px; max-height: 100px; border-radius: 8px; border: 2px solid #0078d4;">
                                </div>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Accent color</div>
                                    <div class="setting-description">Used for highlights and buttons</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px; margin: 16px 0;">
                                <div onclick="setAccentColor('#0078d4', this)" style="width: 40px; height: 40px; background: #0078d4; border-radius: 4px; cursor: pointer; border: 3px solid ${accentColor === '#0078d4' ? 'white' : 'transparent'};"></div>
                                <div onclick="setAccentColor('#e81123', this)" style="width: 40px; height: 40px; background: #e81123; border-radius: 4px; cursor: pointer; border: 3px solid ${accentColor === '#e81123' ? 'white' : 'transparent'};"></div>
                                <div onclick="setAccentColor('#107c10', this)" style="width: 40px; height: 40px; background: #107c10; border-radius: 4px; cursor: pointer; border: 3px solid ${accentColor === '#107c10' ? 'white' : 'transparent'};"></div>
                                <div onclick="setAccentColor('#ff8c00', this)" style="width: 40px; height: 40px; background: #ff8c00; border-radius: 4px; cursor: pointer; border: 3px solid ${accentColor === '#ff8c00' ? 'white' : 'transparent'};"></div>
                                <div onclick="setAccentColor('#881798', this)" style="width: 40px; height: 40px; background: #881798; border-radius: 4px; cursor: pointer; border: 3px solid ${accentColor === '#881798' ? 'white' : 'transparent'};"></div>
                                <div onclick="setAccentColor('#00cc6a', this)" style="width: 40px; height: 40px; background: #00cc6a; border-radius: 4px; cursor: pointer; border: 3px solid ${accentColor === '#00cc6a' ? 'white' : 'transparent'};"></div>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Transparency effects</div>
                                    <div class="setting-description">Add blur and transparency to windows</div>
                                </div>
                                <label class="toggle-switch"><input type="checkbox" checked onchange="toggleTransparency(this.checked)"><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Animation effects</div>
                                    <div class="setting-description">Animate windows and controls</div>
                                </div>
                                <label class="toggle-switch"><input type="checkbox" checked><span class="toggle-slider"></span></label>
                            </div>
                        `;
                        break;
                    case 'Apps':
                        content = `
                            <h2>📦 Apps & features</h2>
                            <div style="margin-bottom: 16px;">
                                <input type="text" placeholder="Search apps..." style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                            </div>
                            <div class="setting-item">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 24px;">🧮</span>
                                    <div>
                                        <div class="setting-label">Calculator</div>
                                        <div class="setting-description">125 MB • Microsoft</div>
                                    </div>
                                </div>
                                <button onclick="uninstallApp('Calculator', this)" style="padding: 6px 16px; border-radius: 4px; background: #f0f0f0; border: 1px solid #ccc; cursor: pointer;">Uninstall</button>
                            </div>
                            <div class="setting-item">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 24px;">🌐</span>
                                    <div>
                                        <div class="setting-label">Microsoft Edge</div>
                                        <div class="setting-description">1.2 GB • Microsoft</div>
                                    </div>
                                </div>
                                <button onclick="uninstallApp('Edge', this)" style="padding: 6px 16px; border-radius: 4px; background: #f0f0f0; border: 1px solid #ccc; cursor: pointer;">Uninstall</button>
                            </div>
                            <div class="setting-item">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 24px;">📝</span>
                                    <div>
                                        <div class="setting-label">Notepad</div>
                                        <div class="setting-description">45 MB • Microsoft</div>
                                    </div>
                                </div>
                                <button onclick="uninstallApp('Notepad', this)" style="padding: 6px 16px; border-radius: 4px; background: #f0f0f0; border: 1px solid #ccc; cursor: pointer;">Uninstall</button>
                            </div>
                            <div class="setting-item">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 24px;">🎨</span>
                                    <div>
                                        <div class="setting-label">Paint</div>
                                        <div class="setting-description">89 MB • Microsoft</div>
                                    </div>
                                </div>
                                <button onclick="uninstallApp('Paint', this)" style="padding: 6px 16px; border-radius: 4px; background: #f0f0f0; border: 1px solid #ccc; cursor: pointer;">Uninstall</button>
                            </div>
                            <div class="setting-item">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 24px;">🛍️</span>
                                    <div>
                                        <div class="setting-label">Microsoft Store</div>
                                        <div class="setting-description">256 MB • Microsoft</div>
                                    </div>
                                </div>
                                <span style="color: #666; font-size: 12px;">System app</span>
                            </div>
                            <h3 style="margin-top: 24px;">Default apps</h3>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Web browser</div>
                                </div>
                                <select style="padding: 8px 12px; border-radius: 4px; border: 1px solid #ccc;">
                                    <option>Microsoft Edge</option>
                                    <option>Google Chrome</option>
                                </select>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Email</div>
                                </div>
                                <select style="padding: 8px 12px; border-radius: 4px; border: 1px solid #ccc;">
                                    <option>Mail</option>
                                    <option>Outlook</option>
                                </select>
                            </div>
                        `;
                        break;
                    case 'Accounts':
                        content = `
                            <h2>👤 Your info</h2>
                            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px; background: linear-gradient(135deg, #f0f8ff, #e6f3ff); padding: 24px; border-radius: 12px;">
                                <div id="account-avatar" style="width: 100px; height: 100px; background: ${userData.avatarColor || '#0078d4'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 48px; cursor: pointer; transition: transform 0.2s; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" onclick="changeAvatar()" title="Click to change avatar">
                                    ${userData.avatar || '👤'}
                                </div>
                                <div>
                                    <div style="font-size: 24px; font-weight: 600; margin-bottom: 4px;" id="display-username">${userData.username}</div>
                                    <div style="font-size: 14px; color: #666;">${userData.email || 'Local Account'}</div>
                                    <div style="font-size: 12px; color: #0078d4; margin-top: 4px;">Administrator</div>
                                </div>
                            </div>

                            <h3 style="margin: 24px 0 16px;">Edit profile</h3>
                            <div class="setting-item" style="background: #f8f9fa; border-radius: 8px; padding: 16px;">
                                <div style="width: 100%;">
                                    <div class="setting-label" style="margin-bottom: 8px;">Username</div>
                                    <div style="display: flex; gap: 8px;">
                                        <input type="text" id="edit-username" value="${userData.username}" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                                        <button onclick="updateUsername()" style="padding: 10px 20px; background: #0078d4; color: white; border: none; border-radius: 4px; cursor: pointer;">Save</button>
                                    </div>
                                </div>
                            </div>
                            <div class="setting-item" style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin-top: 12px;">
                                <div style="width: 100%;">
                                    <div class="setting-label" style="margin-bottom: 8px;">Change Password</div>
                                    <div style="display: flex; flex-direction: column; gap: 8px;">
                                        <input type="password" id="current-password" placeholder="Current password" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                                        <input type="password" id="new-password" placeholder="New password" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                                        <input type="password" id="confirm-password" placeholder="Confirm new password" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                                        <button onclick="updatePassword()" style="padding: 10px 20px; background: #0078d4; color: white; border: none; border-radius: 4px; cursor: pointer; align-self: flex-start;">Update Password</button>
                                    </div>
                                </div>
                            </div>
                            <div class="setting-item" style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin-top: 12px;">
                                <div style="width: 100%;">
                                    <div class="setting-label" style="margin-bottom: 8px;">Profile Picture</div>
                                    <div class="setting-description" style="margin-bottom: 12px;">Choose an avatar or use a custom image</div>
                                    <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px;">
                                        <div onclick="setAvatar('👤', '#0078d4')" style="width: 50px; height: 50px; background: #0078d4; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; border: 3px solid ${(userData.avatar || '👤') === '👤' ? '#333' : 'transparent'};">👤</div>
                                        <div onclick="setAvatar('😊', '#4caf50')" style="width: 50px; height: 50px; background: #4caf50; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; border: 3px solid ${userData.avatar === '😊' ? '#333' : 'transparent'};">😊</div>
                                        <div onclick="setAvatar('🎮', '#9c27b0')" style="width: 50px; height: 50px; background: #9c27b0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; border: 3px solid ${userData.avatar === '🎮' ? '#333' : 'transparent'};">🎮</div>
                                        <div onclick="setAvatar('🎨', '#ff5722')" style="width: 50px; height: 50px; background: #ff5722; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; border: 3px solid ${userData.avatar === '🎨' ? '#333' : 'transparent'};">🎨</div>
                                        <div onclick="setAvatar('💻', '#607d8b')" style="width: 50px; height: 50px; background: #607d8b; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; border: 3px solid ${userData.avatar === '💻' ? '#333' : 'transparent'};">💻</div>
                                        <div onclick="setAvatar('🚀', '#e91e63')" style="width: 50px; height: 50px; background: #e91e63; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; border: 3px solid ${userData.avatar === '🚀' ? '#333' : 'transparent'};">🚀</div>
                                        <div onclick="setAvatar('🌟', '#ffc107')" style="width: 50px; height: 50px; background: #ffc107; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; border: 3px solid ${userData.avatar === '🌟' ? '#333' : 'transparent'};">🌟</div>
                                        <div onclick="setAvatar('🐱', '#795548')" style="width: 50px; height: 50px; background: #795548; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; border: 3px solid ${userData.avatar === '🐱' ? '#333' : 'transparent'};">🐱</div>
                                    </div>
                                    <div style="display: flex; gap: 8px;">
                                        <input type="text" id="custom-avatar-url" placeholder="Or enter image URL..." style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                                        <button onclick="setCustomAvatar()" style="padding: 10px 20px; background: #0078d4; color: white; border: none; border-radius: 4px; cursor: pointer;">Apply</button>
                                    </div>
                                </div>
                            </div>

                            <h3 style="margin: 24px 0 16px;">Sign-in options</h3>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Windows Hello</div>
                                    <div class="setting-description">Sign in with face, fingerprint, or PIN</div>
                                </div>
                                <button style="padding: 8px 16px; border-radius: 4px; background: #f0f0f0; border: 1px solid #ccc; cursor: pointer;">Set up</button>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Require sign-in</div>
                                    <div class="setting-description">When should Windows require you to sign in again?</div>
                                </div>
                                <select style="padding: 8px 12px; border-radius: 4px; border: 1px solid #ccc;">
                                    <option>When PC wakes from sleep</option>
                                    <option>Never</option>
                                </select>
                            </div>
                        `;
                        break;
                    case 'Time & Language':
                        content = `
                            <h2>Date & time</h2>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Set time automatically</div>
                                    <div class="setting-description">Sync with internet time servers</div>
                                </div>
                                <label class="toggle-switch"><input type="checkbox" checked><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Time zone</div>
                                    <div class="setting-description">Current time zone</div>
                                </div>
                                <select style="padding: 8px; border-radius: 4px; width: 250px;">
                                    <option>(UTC-08:00) Pacific Time</option>
                                    <option>(UTC-05:00) Eastern Time</option>
                                    <option>(UTC+00:00) London</option>
                                    <option>(UTC+01:00) Paris, Berlin</option>
                                </select>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Language</div>
                                    <div class="setting-description">Windows display language</div>
                                </div>
                                <div>English (United States)</div>
                            </div>
                        `;
                        break;
                    case 'Privacy':
                        content = `
                            <h2>Privacy</h2>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Location</div>
                                    <div class="setting-description">Let apps use your location</div>
                                </div>
                                <label class="toggle-switch"><input type="checkbox" checked onchange="playSound('notification')"><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Camera</div>
                                    <div class="setting-description">Let apps use your camera</div>
                                </div>
                                <label class="toggle-switch"><input type="checkbox" checked onchange="playSound('notification')"><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Microphone</div>
                                    <div class="setting-description">Let apps use your microphone</div>
                                </div>
                                <label class="toggle-switch"><input type="checkbox" checked onchange="playSound('notification')"><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Diagnostics & feedback</div>
                                    <div class="setting-description">Send diagnostic data to Microsoft</div>
                                </div>
                                <select style="padding: 8px; border-radius: 4px;">
                                    <option>Required</option>
                                    <option selected>Optional</option>
                                </select>
                            </div>
                        `;
                        break;
                    case 'Update & Security':
                        content = `
                            <h2>🔄 Windows Update</h2>
                            <div style="background: #e6f4ea; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #34a853;">
                                <div style="font-size: 18px; margin-bottom: 8px; color: #137333;">✅ You're up to date</div>
                                <div style="font-size: 14px; color: #666;">Last checked: Today at ${new Date().toLocaleTimeString()}</div>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Check for updates</div>
                                    <div class="setting-description">Download and install the latest updates</div>
                                </div>
                                <button onclick="checkForUpdates(this)" style="padding: 10px 24px; border-radius: 4px; background: #0078d4; color: white; border: none; cursor: pointer; font-size: 14px;">Check now</button>
                            </div>
                            <h3 style="margin-top: 24px;">🛡️ Windows Security</h3>
                            <div class="setting-item" style="background: #e8f5e9; border-radius: 8px; padding: 16px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 32px;">🛡️</span>
                                    <div>
                                        <div class="setting-label" style="color: #2e7d32;">Your device is protected</div>
                                        <div class="setting-description">No threats found</div>
                                    </div>
                                </div>
                                <button onclick="openApp('defender')" style="padding: 8px 16px; border-radius: 4px; background: white; border: 1px solid #ccc; cursor: pointer;">Open Security</button>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Virus & threat protection</div>
                                    <div class="setting-description">Last scan: Today</div>
                                </div>
                                <button onclick="runQuickScan()" style="padding: 8px 16px; border-radius: 4px; background: #f0f0f0; border: 1px solid #ccc; cursor: pointer;">Quick scan</button>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Firewall & network</div>
                                    <div class="setting-description">Protected</div>
                                </div>
                                <span style="color: #2e7d32;">✓ On</span>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Backup</div>
                                    <div class="setting-description">Back up files to OneDrive</div>
                                </div>
                                <label class="toggle-switch"><input type="checkbox"><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Recovery</div>
                                    <div class="setting-description">Reset this PC or advanced startup</div>
                                </div>
                                <button onclick="alert('Recovery options would reset your PC. This is a simulation.')" style="padding: 8px 16px; border-radius: 4px; background: #f0f0f0; border: 1px solid #ccc; cursor: pointer;">Get started</button>
                            </div>
                        `;
                        break;
                    case 'Gaming':
                        content = `
                            <h2>🎮 Gaming</h2>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Xbox Game Bar</div>
                                    <div class="setting-description">Record clips, chat with friends, and get invites</div>
                                </div>
                                <label class="toggle-switch"><input type="checkbox" checked><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Game Mode</div>
                                    <div class="setting-description">Optimize your PC for gaming</div>
                                </div>
                                <label class="toggle-switch"><input type="checkbox" checked><span class="toggle-slider"></span></label>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Captures</div>
                                    <div class="setting-description">Screenshots and game clips location</div>
                                </div>
                                <span style="color: #666;">C:\\Users\\${userData.username}\\Videos\\Captures</span>
                            </div>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Graphics</div>
                                    <div class="setting-description">Default graphics settings</div>
                                </div>
                                <select style="padding: 8px 12px; border-radius: 4px; border: 1px solid #ccc;">
                                    <option>Let Windows decide</option>
                                    <option>Power saving</option>
                                    <option>High performance</option>
                                </select>
                            </div>
                        `;
                        break;
                }

                contentArea.innerHTML = content;
            });
        });
    }, 100);

    return `
        <div style="display: flex; height: 100%;">
            <div class="settings-sidebar">
                <div class="settings-menu-item active">System</div>
                <div class="settings-menu-item">Personalization</div>
                <div class="settings-menu-item">Apps</div>
                <div class="settings-menu-item">Accounts</div>
                <div class="settings-menu-item">Time & Language</div>
                <div class="settings-menu-item">Gaming</div>
                <div class="settings-menu-item">Privacy</div>
                <div class="settings-menu-item">Update & Security</div>
            </div>
            <div class="settings-content">
                <h2>⚙️ System</h2>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">Display brightness</div>
                        <div class="setting-description">Adjust screen brightness</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="range" min="20" max="100" value="80" style="width: 200px;" oninput="setSettingsBrightness(this.value)">
                        <span id="settings-brightness-val">80%</span>
                    </div>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">Night light</div>
                        <div class="setting-description">Reduce blue light to help you sleep</div>
                    </div>
                    <label class="toggle-switch"><input type="checkbox" onchange="toggleSettingsNightLight(this.checked)"><span class="toggle-slider"></span></label>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">Sound volume</div>
                        <div class="setting-description" id="sound-vol-desc">Volume: 75%</div>
                    </div>
                    <input type="range" min="0" max="100" value="75" style="width: 200px;" oninput="document.getElementById('sound-vol-desc').textContent='Volume: '+this.value+'%'">
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">Storage</div>
                        <div class="setting-description">C: Drive - 237 GB free of 476 GB</div>
                    </div>
                    <div style="width: 200px; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
                        <div style="width: 50%; height: 100%; background: #0078d4;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createTaskManager() {
    updateProcessList();

    return `
        <div class="taskmgr-tabs">
            <button class="taskmgr-tab active" onclick="switchTaskMgrTab('processes')">Processes</button>
            <button class="taskmgr-tab" onclick="switchTaskMgrTab('performance')">Performance</button>
        </div>
        <div class="taskmgr-content">
            <div id="taskmgr-processes">
                <table class="process-list">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>CPU</th>
                            <th>Memory</th>
                        </tr>
                    </thead>
                    <tbody id="process-tbody"></tbody>
                </table>
            </div>
            <div id="taskmgr-performance" style="display: none;">
                <div class="performance-grid">
                    <div class="performance-card">
                        <h3>CPU</h3>
                        <div class="performance-value" id="perf-cpu">0%</div>
                        <div class="performance-graph">
                            <div class="graph-line" id="cpu-graph"></div>
                        </div>
                    </div>
                    <div class="performance-card">
                        <h3>Memory</h3>
                        <div class="performance-value" id="perf-memory">0 MB</div>
                        <div class="performance-graph">
                            <div class="graph-line" id="mem-graph"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function switchTaskMgrTab(tab) {
    document.querySelectorAll('.taskmgr-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    if (tab === 'processes') {
        document.getElementById('taskmgr-processes').style.display = 'block';
        document.getElementById('taskmgr-performance').style.display = 'none';
    } else {
        document.getElementById('taskmgr-processes').style.display = 'none';
        document.getElementById('taskmgr-performance').style.display = 'block';
    }
}

function updateProcessList() {
    processes = [
        { name: 'System', cpu: Math.random() * 5, memory: 150 + Math.random() * 50 },
        { name: 'Windows Explorer', cpu: Math.random() * 10, memory: 80 + Math.random() * 40 },
        { name: 'Microsoft Edge', cpu: Math.random() * 15, memory: 200 + Math.random() * 100 }
    ];

    openWindows.forEach(win => {
        processes.push({
            name: win.title,
            cpu: Math.random() * 8,
            memory: 50 + Math.random() * 100
        });
    });

    const tbody = document.getElementById('process-tbody');
    if (tbody) {
        tbody.innerHTML = processes.map(p => `
            <tr>
                <td>${p.name}</td>
                <td class="cpu-usage">${p.cpu.toFixed(1)}%</td>
                <td class="mem-usage">${p.memory.toFixed(0)} MB</td>
            </tr>
        `).join('');
    }
}

function startPerformanceMonitoring() {
    setInterval(() => {
        cpuUsage = Math.random() * 50 + 10;
        memUsage = 2000 + Math.random() * 2000;

        const perfCpu = document.getElementById('perf-cpu');
        const perfMemory = document.getElementById('perf-memory');
        const cpuGraph = document.getElementById('cpu-graph');
        const memGraph = document.getElementById('mem-graph');

        if (perfCpu) perfCpu.textContent = cpuUsage.toFixed(1) + '%';
        if (perfMemory) perfMemory.textContent = memUsage.toFixed(0) + ' MB';
        if (cpuGraph) cpuGraph.style.height = cpuUsage + '%';
        if (memGraph) memGraph.style.height = (memUsage / 80) + '%';

        updateProcessList();
    }, 2000);
}

function createBrowser() {
    return `
        <div style="height: 100%; display: flex; flex-direction: column;">
            <div style="background: #f3f3f3; padding: 8px; border-bottom: 1px solid #e0e0e0;">
                <input type="text" value="https://www.bing.com" style="width: 100%; padding: 8px; border: 1px solid #d0d0d0; border-radius: 4px;">
            </div>
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: white;">
                <div style="text-align: center;">
                    <h2 style="color: #0078d4;">Microsoft Edge</h2>
                    <p>The fast and secure browser for Windows 10</p>
                </div>
            </div>
        </div>
    `;
}

function createComputer() {
    return `
        <div class="explorer-content">
            <div class="explorer-sidebar">
                <div class="folder-item">💻 This PC</div>
                <div class="folder-item">📁 Desktop</div>
                <div class="folder-item">📁 Documents</div>
                <div class="folder-item">📁 Downloads</div>
            </div>
            <div class="explorer-main">
                <h3 style="margin-bottom: 20px;">Devices and drives</h3>
                <div class="file-item">💿 <strong>Local Disk (C:)</strong><br><small>237 GB free of 476 GB</small></div>
                <div class="file-item">💿 <strong>Local Disk (D:)</strong><br><small>150 GB free of 500 GB</small></div>
            </div>
        </div>
    `;
}

function createGoogleSetup() {
    setTimeout(() => {
        startChromeDownload();
    }, 100);

    return `
        <div class="chrome-setup">
            <div class="chrome-setup-header">
                <div class="chrome-logo">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #ea4335 0%, #ea4335 25%, #fbbc05 25%, #fbbc05 50%, #34a853 50%, #34a853 75%, #4285f4 75%); border-radius: 50%; position: relative;">
                        <div style="width: 24px; height: 24px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
                        <div style="width: 16px; height: 16px; background: #4285f4; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
                    </div>
                </div>
                <h2 style="margin: 20px 0 10px;">Installing Google Chrome</h2>
                <p style="color: #666; margin-bottom: 30px;">Please wait while we download and install Chrome...</p>
            </div>
            <div class="chrome-download-info">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span id="chrome-download-status">Downloading...</span>
                    <span id="chrome-download-percent">0%</span>
                </div>
                <div class="chrome-progress-bar">
                    <div class="chrome-progress-fill" id="chrome-progress-fill"></div>
                </div>
                <div style="margin-top: 15px; color: #666; font-size: 12px;">
                    <div id="chrome-download-speed">Speed: 0 MB/s</div>
                    <div id="chrome-download-size">Downloaded: 0 MB / 89.2 MB</div>
                </div>
            </div>
        </div>
    `;
}

function startChromeDownload() {
    let progress = 0;
    let downloaded = 0;
    const totalSize = 89.2;

    const interval = setInterval(() => {
        const speed = (Math.random() * 5 + 2).toFixed(1);
        const increment = parseFloat(speed) * 0.3;
        downloaded = Math.min(downloaded + increment, totalSize);
        progress = (downloaded / totalSize) * 100;

        const progressFill = document.getElementById('chrome-progress-fill');
        const percentText = document.getElementById('chrome-download-percent');
        const statusText = document.getElementById('chrome-download-status');
        const speedText = document.getElementById('chrome-download-speed');
        const sizeText = document.getElementById('chrome-download-size');

        if (progressFill) progressFill.style.width = progress + '%';
        if (percentText) percentText.textContent = Math.floor(progress) + '%';
        if (speedText) speedText.textContent = 'Speed: ' + speed + ' MB/s';
        if (sizeText) sizeText.textContent = 'Downloaded: ' + downloaded.toFixed(1) + ' MB / ' + totalSize + ' MB';

        if (progress >= 100) {
            clearInterval(interval);
            if (statusText) statusText.textContent = 'Installing...';

            setTimeout(() => {
                if (statusText) statusText.textContent = 'Installation complete!';
                setTimeout(() => {
                    closeWindow('google_setup');
                    openApp('chrome');
                }, 1000);
            }, 1500);
        }
    }, 300);
}

function createChrome() {
    setTimeout(() => {
        const urlInput = document.getElementById('chrome-url-input');
        const goBtn = document.getElementById('chrome-go-btn');

        if (urlInput && goBtn) {
            goBtn.addEventListener('click', () => navigateChrome());
            urlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') navigateChrome();
            });
        }
    }, 100);

    return `
        <div class="chrome-browser">
            <div class="chrome-toolbar">
                <button class="chrome-nav-btn" onclick="chromeBack()">←</button>
                <button class="chrome-nav-btn" onclick="chromeForward()">→</button>
                <button class="chrome-nav-btn" onclick="chromeRefresh()">↻</button>
                <div class="chrome-url-bar">
                    <span style="color: #5f6368; margin-right: 8px;">🔒</span>
                    <input type="text" id="chrome-url-input" value="https://www.google.com" placeholder="Search Google or type a URL">
                </div>
                <button class="chrome-nav-btn" id="chrome-go-btn">Go</button>
            </div>
            <div class="chrome-content" id="chrome-content">
                <div class="chrome-google-page">
                    <div class="google-logo">
                        <span style="color: #4285f4; font-size: 72px; font-weight: 400;">G</span>
                        <span style="color: #ea4335; font-size: 72px; font-weight: 400;">o</span>
                        <span style="color: #fbbc05; font-size: 72px; font-weight: 400;">o</span>
                        <span style="color: #4285f4; font-size: 72px; font-weight: 400;">g</span>
                        <span style="color: #34a853; font-size: 72px; font-weight: 400;">l</span>
                        <span style="color: #ea4335; font-size: 72px; font-weight: 400;">e</span>
                    </div>
                    <div class="google-search-box">
                        <input type="text" placeholder="Search Google or type a URL" style="width: 100%; padding: 12px 20px; border: 1px solid #dfe1e5; border-radius: 24px; font-size: 16px; outline: none;">
                    </div>
                    <div style="margin-top: 40px; display: flex; gap: 16px; justify-content: center;">
                        <button onclick="downloadRansomware()" style="padding: 12px 24px; background: linear-gradient(135deg, #ff0000, #cc0000); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold; box-shadow: 0 4px 15px rgba(255,0,0,0.4);">⚠️ Download Ransomware.exe</button>
                        <button onclick="downloadFreeGames()" style="padding: 12px 24px; background: linear-gradient(135deg, #00cc00, #009900); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold;">🎮 Free Games 2024</button>
                    </div>
                    <p style="margin-top: 16px; color: #999; font-size: 12px;">Totally safe downloads! Trust us! 😈</p>
                </div>
            </div>
        </div>
    `;
}

function navigateChrome() {
    const urlInput = document.getElementById('chrome-url-input');
    const contentArea = document.getElementById('chrome-content');

    if (!urlInput || !contentArea) return;

    let url = urlInput.value.trim();

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.includes('.') && !url.includes(' ')) {
            url = 'https://' + url;
        } else {
            url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
        }
        urlInput.value = url;
    }

    contentArea.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
            <iframe src="${url}" style="width: 100%; flex: 1; border: none;" 
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onload="this.style.background='white'"
                onerror="this.parentElement.innerHTML='<div style=\\'text-align: center; padding: 50px;\\'><h2>Cannot load this page</h2><p>The website may have blocked embedding.</p></div>'">
            </iframe>
        </div>
    `;
}

function chromeBack() {
    const contentArea = document.getElementById('chrome-content');
    const urlInput = document.getElementById('chrome-url-input');
    if (contentArea && urlInput) {
        urlInput.value = 'https://www.google.com';
        contentArea.innerHTML = `
            <div class="chrome-google-page">
                <div class="google-logo">
                    <span style="color: #4285f4; font-size: 72px; font-weight: 400;">G</span>
                    <span style="color: #ea4335; font-size: 72px; font-weight: 400;">o</span>
                    <span style="color: #fbbc05; font-size: 72px; font-weight: 400;">o</span>
                    <span style="color: #4285f4; font-size: 72px; font-weight: 400;">g</span>
                    <span style="color: #34a853; font-size: 72px; font-weight: 400;">l</span>
                    <span style="color: #ea4335; font-size: 72px; font-weight: 400;">e</span>
                </div>
                <div class="google-search-box">
                    <input type="text" placeholder="Search Google or type a URL" style="width: 100%; padding: 12px 20px; border: 1px solid #dfe1e5; border-radius: 24px; font-size: 16px; outline: none;">
                </div>
            </div>
        `;
    }
}

function chromeForward() {}

function chromeRefresh() {
    navigateChrome();
}

// Command Prompt
let cmdHistory = [];
let cmdHistoryIndex = -1;

function createCMD() {
    setTimeout(() => {
        const input = document.getElementById('cmd-input');
        if (input) {
            input.focus();
            input.addEventListener('keydown', handleCMDInput);
        }
    }, 100);

    return `
        <div class="cmd-window" onclick="document.getElementById('cmd-input')?.focus()">
            <div class="cmd-output" id="cmd-output">Microsoft Windows [Version 10.0.19045.3803]
(c) Microsoft Corporation. All rights reserved.

</div>
            <div class="cmd-input-line">
                <span class="cmd-prompt">C:\\Users\\${userData.username}></span>
                <input type="text" class="cmd-input" id="cmd-input" autofocus>
            </div>
        </div>
    `;
}

function handleCMDInput(e) {
    if (e.key === 'Enter') {
        const input = document.getElementById('cmd-input');
        const output = document.getElementById('cmd-output');
        const command = input.value.trim();

        if (command) {
            cmdHistory.push(command);
            cmdHistoryIndex = cmdHistory.length;
        }

        output.textContent += `C:\\Users\\${userData.username}>${command}\n`;

        const result = executeCMDCommand(command);
        if (result) output.textContent += result + '\n';
        output.textContent += '\n';

        input.value = '';
        output.scrollTop = output.scrollHeight;
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (cmdHistoryIndex > 0) {
            cmdHistoryIndex--;
            document.getElementById('cmd-input').value = cmdHistory[cmdHistoryIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (cmdHistoryIndex < cmdHistory.length - 1) {
            cmdHistoryIndex++;
            document.getElementById('cmd-input').value = cmdHistory[cmdHistoryIndex];
        } else {
            cmdHistoryIndex = cmdHistory.length;
            document.getElementById('cmd-input').value = '';
        }
    }
}

function executeCMDCommand(cmd) {
    const parts = cmd.toLowerCase().split(' ');
    const command = parts[0];

    switch(command) {
        case 'help':
            return `Available commands:
  help      - Show this help message
  dir       - List directory contents
  cls       - Clear screen
  echo      - Display message
  date      - Display current date
  time      - Display current time
  whoami    - Display current user
  hostname  - Display computer name
  ver       - Display Windows version
  color     - Change console colors (0-9, a-f)
  title     - Change window title
  exit      - Close command prompt`;
        case 'dir':
            return ` Volume in drive C has no label.
 Volume Serial Number is 1234-5678

 Directory of C:\\Users\\${userData.username}

01/29/2026  10:00 AM    <DIR>          .
01/29/2026  10:00 AM    <DIR>          ..
01/29/2026  10:00 AM    <DIR>          Desktop
01/29/2026  10:00 AM    <DIR>          Documents
01/29/2026  10:00 AM    <DIR>          Downloads
01/29/2026  10:00 AM    <DIR>          Pictures
               0 File(s)              0 bytes
               6 Dir(s)  237,000,000,000 bytes free`;
        case 'cls':
            document.getElementById('cmd-output').textContent = '';
            return '';
        case 'echo':
            return parts.slice(1).join(' ');
        case 'date':
            return `The current date is: ${new Date().toLocaleDateString()}`;
        case 'time':
            return `The current time is: ${new Date().toLocaleTimeString()}`;
        case 'whoami':
            return `${window.location.hostname}\\${userData.username}`;
        case 'hostname':
            return 'DESKTOP-WIN10SIM';
        case 'ver':
            return 'Microsoft Windows [Version 10.0.19045.3803]';
        case 'exit':
            closeWindow('cmd');
            return '';
        case 'color':
            const colors = {'0':'#000','1':'#000080','2':'#008000','3':'#008080','4':'#800000','5':'#800080','6':'#808000','7':'#c0c0c0','8':'#808080','9':'#0000ff','a':'#00ff00','b':'#00ffff','c':'#ff0000','d':'#ff00ff','e':'#ffff00','f':'#fff'};
            if (parts[1] && parts[1].length === 2) {
                const bg = colors[parts[1][0]] || '#0c0c0c';
                const fg = colors[parts[1][1]] || '#cccccc';
                document.querySelector('.cmd-window').style.background = bg;
                document.querySelector('.cmd-window').style.color = fg;
            }
            return '';
        case 'title':
            return '';
        case 'ipconfig':
            return `Windows IP Configuration

Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . : 
   IPv4 Address. . . . . . . . . . . : 192.168.1.${Math.floor(Math.random()*200)+10}
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1`;
        case 'ping':
            if (parts[1]) {
                return `Pinging ${parts[1]} with 32 bytes of data:
Reply from ${parts[1]}: bytes=32 time=${Math.floor(Math.random()*50)+10}ms TTL=64
Reply from ${parts[1]}: bytes=32 time=${Math.floor(Math.random()*50)+10}ms TTL=64
Reply from ${parts[1]}: bytes=32 time=${Math.floor(Math.random()*50)+10}ms TTL=64
Reply from ${parts[1]}: bytes=32 time=${Math.floor(Math.random()*50)+10}ms TTL=64

Ping statistics for ${parts[1]}:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`;
            }
            return 'Usage: ping <hostname>';
        case 'systeminfo':
            return `Host Name:                 DESKTOP-WIN10SIM
OS Name:                   Microsoft Windows 10 Pro
OS Version:                10.0.19045 Build 19045
System Manufacturer:       Replit
System Model:              Virtual Machine
Processor(s):              1 Processor(s) Installed.
Total Physical Memory:     8,192 MB
Available Physical Memory: 4,096 MB`;
        default:
            if (command) return `'${command}' is not recognized as an internal or external command,
operable program or batch file.`;
            return '';
    }
}

// Paint App
let paintColor = '#000000';
let paintSize = 5;
let paintTool = 'brush';
let isDrawing = false;

function createPaint() {
    setTimeout(() => initPaintCanvas(), 100);

    return `
        <div class="paint-app">
            <div class="paint-toolbar">
                <div class="paint-colors">
                    <div class="paint-color active" style="background:#000" onclick="setPaintColor('#000', this)"></div>
                    <div class="paint-color" style="background:#fff" onclick="setPaintColor('#fff', this)"></div>
                    <div class="paint-color" style="background:#ff0000" onclick="setPaintColor('#ff0000', this)"></div>
                    <div class="paint-color" style="background:#00ff00" onclick="setPaintColor('#00ff00', this)"></div>
                    <div class="paint-color" style="background:#0000ff" onclick="setPaintColor('#0000ff', this)"></div>
                    <div class="paint-color" style="background:#ffff00" onclick="setPaintColor('#ffff00', this)"></div>
                    <div class="paint-color" style="background:#ff00ff" onclick="setPaintColor('#ff00ff', this)"></div>
                    <div class="paint-color" style="background:#00ffff" onclick="setPaintColor('#00ffff', this)"></div>
                    <div class="paint-color" style="background:#ff8000" onclick="setPaintColor('#ff8000', this)"></div>
                    <div class="paint-color" style="background:#8000ff" onclick="setPaintColor('#8000ff', this)"></div>
                </div>
                <div class="paint-tools">
                    <button class="paint-tool active" onclick="setPaintTool('brush', this)">🖌️ Brush</button>
                    <button class="paint-tool" onclick="setPaintTool('eraser', this)">🧹 Eraser</button>
                    <button class="paint-tool" onclick="clearCanvas()">🗑️ Clear</button>
                </div>
                <label>Size: <input type="range" class="paint-size" min="1" max="50" value="5" onchange="paintSize=this.value"></label>
            </div>
            <div class="paint-canvas-container">
                <canvas id="paint-canvas" class="paint-canvas" width="600" height="400"></canvas>
            </div>
        </div>
    `;
}

function initPaintCanvas() {
    const canvas = document.getElementById('paint-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        draw(e);
    });
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);
}

function draw(e) {
    if (!isDrawing) return;
    const canvas = document.getElementById('paint-canvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    ctx.beginPath();
    ctx.arc(e.clientX - rect.left, e.clientY - rect.top, paintSize/2, 0, Math.PI * 2);
    ctx.fillStyle = paintTool === 'eraser' ? 'white' : paintColor;
    ctx.fill();
}

function setPaintColor(color, el) {
    paintColor = color;
    document.querySelectorAll('.paint-color').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

function setPaintTool(tool, el) {
    paintTool = tool;
    document.querySelectorAll('.paint-tool').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

function clearCanvas() {
    const canvas = document.getElementById('paint-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Weather App
function createWeather() {
    const temps = [68, 72, 65, 70, 75, 62, 78];
    const conditions = ['☀️', '⛅', '☁️', '🌧️', '⛈️'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    return `
        <div class="weather-app">
            <h2>📍 Current Location</h2>
            <div class="weather-icon">☀️</div>
            <div class="weather-temp">72°F</div>
            <p>Sunny</p>
            <div class="weather-details">
                <div class="weather-detail">
                    <div class="weather-detail-value">💨 8 mph</div>
                    <div>Wind</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-value">💧 45%</div>
                    <div>Humidity</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-value">👁️ 10 mi</div>
                    <div>Visibility</div>
                </div>
            </div>
            <div class="weather-forecast">
                ${days.map((day, i) => `
                    <div class="forecast-day">
                        <div>${day}</div>
                        <div style="font-size: 24px">${conditions[i % conditions.length]}</div>
                        <div>${temps[i]}°</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Snipping Tool
function createSnipping() {
    return `
        <div class="snipping-app">
            <div class="snipping-toolbar">
                <button class="snipping-btn" onclick="takeSnip()">+ New</button>
                <select style="padding: 6px;">
                    <option>Rectangular Snip</option>
                    <option>Free-form Snip</option>
                    <option>Window Snip</option>
                    <option>Full-screen Snip</option>
                </select>
            </div>
            <div class="snipping-content" id="snipping-content">
                <div style="text-align: center">
                    <p style="font-size: 48px">✂️</p>
                    <p>Click "New" to take a screenshot</p>
                    <p style="font-size: 12px; margin-top: 10px">Press Windows + Shift + S for quick snip</p>
                </div>
            </div>
        </div>
    `;
}

function takeSnip() {
    const content = document.getElementById('snipping-content');
    if (content) {
        content.innerHTML = `
            <div style="text-align: center">
                <p style="font-size: 48px">📸</p>
                <p>Screenshot captured!</p>
                <p style="font-size: 12px; margin-top: 10px; color: #0078d4">Saved to clipboard</p>
            </div>
        `;
    }
}

// Context Menu
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('contextmenu', (e) => {
        const desktop = document.getElementById('screen-desktop');
        if (desktop && desktop.classList.contains('active')) {
            const contextMenu = document.getElementById('context-menu');
            if (contextMenu && e.target.closest('.desktop-icons')) {
                e.preventDefault();
                contextMenu.style.left = e.pageX + 'px';
                contextMenu.style.top = e.pageY + 'px';
                contextMenu.classList.add('active');
            }
        }
    });

    document.addEventListener('click', () => {
        const contextMenu = document.getElementById('context-menu');
        if (contextMenu) contextMenu.classList.remove('active');
    });
});

function refreshDesktop() {
    const icons = document.querySelector('.desktop-icons');
    if (icons) {
        icons.style.opacity = '0.5';
        setTimeout(() => icons.style.opacity = '1', 300);
    }
}

function createFolder() {
    const icons = document.querySelector('.desktop-icons');
    if (icons) {
        const folder = document.createElement('div');
        folder.className = 'desktop-icon';
        folder.innerHTML = '<div class="icon">📁</div><div class="icon-label">New folder</div>';
        folder.ondblclick = () => openApp('explorer');
        icons.appendChild(folder);
    }
}

function toggleQuickAction(el) {
    el.classList.toggle('active');
}

// WiFi and Volume Menus
function toggleWifiMenu() {
    const menu = document.getElementById('wifi-menu');
    const volumeMenu = document.getElementById('volume-menu');
    if (volumeMenu) volumeMenu.classList.remove('active');
    if (menu) menu.classList.toggle('active');
}

function toggleVolumeMenu() {
    const menu = document.getElementById('volume-menu');
    const wifiMenu = document.getElementById('wifi-menu');
    if (wifiMenu) wifiMenu.classList.remove('active');
    if (menu) menu.classList.toggle('active');

    const slider = document.getElementById('volume-slider');
    const value = document.getElementById('volume-value');
    if (slider && value) {
        slider.oninput = () => value.textContent = slider.value + '%';
    }
}

function toggleWifiState(checkbox) {
    const wifiList = document.getElementById('wifi-list');
    if (wifiList) {
        wifiList.style.opacity = checkbox.checked ? '1' : '0.5';
        wifiList.style.pointerEvents = checkbox.checked ? 'auto' : 'none';
    }
}

function selectWifi(el) {
    document.querySelectorAll('.wifi-network').forEach(n => {
        n.classList.remove('connected');
        n.querySelector('.wifi-status').textContent = n.querySelector('.wifi-status').textContent.replace('Connected, ', '');
    });
    el.classList.add('connected');
    const status = el.querySelector('.wifi-status');
    status.textContent = 'Connected, ' + status.textContent;
    playSound('notification');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.wifi-menu') && !e.target.closest('.tray-icon')) {
        const wifiMenu = document.getElementById('wifi-menu');
        if (wifiMenu) wifiMenu.classList.remove('active');
    }
    if (!e.target.closest('.volume-menu') && !e.target.closest('.tray-icon')) {
        const volumeMenu = document.getElementById('volume-menu');
        if (volumeMenu) volumeMenu.classList.remove('active');
    }
});

// Photos App
function createPhotos() {
    const photos = ['🌅', '🏔️', '🌊', '🌸', '🌆', '🎨', '🌈', '🦋', '🌺', '🍂', '⭐', '🌙'];
    return `
        <div class="photos-app">
            <div class="photos-header">
                <h2>📷 Collection</h2>
            </div>
            <div class="photos-grid">
                ${photos.map(p => `<div class="photo-item">${p}</div>`).join('')}
            </div>
        </div>
    `;
}

// Calendar App
function createCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let daysHtml = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="calendar-day header">${d}</div>`).join('');

    for (let i = 0; i < firstDay; i++) {
        daysHtml += '<div class="calendar-day"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today ? 'today' : '';
        daysHtml += `<div class="calendar-day ${isToday}">${day}</div>`;
    }

    return `
        <div class="calendar-app">
            <div class="calendar-header">
                <button onclick="changeMonth(-1)" style="padding: 8px 16px; cursor: pointer;">←</button>
                <h2>${monthNames[month]} ${year}</h2>
                <button onclick="changeMonth(1)" style="padding: 8px 16px; cursor: pointer;">→</button>
            </div>
            <div class="calendar-grid">
                ${daysHtml}
            </div>
        </div>
    `;
}

// Clock App
function createClockApp() {
    setTimeout(() => {
        updateClockApp();
        setInterval(updateClockApp, 1000);
    }, 100);

    return `
        <div class="clock-app">
            <div class="clock-display" id="clock-app-time">00:00:00</div>
            <div class="clock-date" id="clock-app-date">Loading...</div>
        </div>
    `;
}

function updateClockApp() {
    const now = new Date();
    const timeEl = document.getElementById('clock-app-time');
    const dateEl = document.getElementById('clock-app-date');
    if (timeEl) timeEl.textContent = now.toLocaleTimeString();
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// Maps App
function createMaps() {
    return `
        <div class="maps-app">
            <div class="maps-search">
                <input type="text" placeholder="Search for a place...">
            </div>
            <div class="maps-content">🗺️</div>
        </div>
    `;
}

// Microsoft Store App
function createStore() {
    const apps = [
        { icon: '🎮', name: 'Xbox', rating: '★★★★☆' },
        { icon: '🎵', name: 'Spotify', rating: '★★★★★' },
        { icon: '📺', name: 'Netflix', rating: '★★★★☆' },
        { icon: '💬', name: 'WhatsApp', rating: '★★★★☆' },
        { icon: '📷', name: 'Instagram', rating: '★★★★☆' },
        { icon: '🎥', name: 'TikTok', rating: '★★★★☆' },
        { icon: '📝', name: 'OneNote', rating: '★★★★☆' },
        { icon: '🎨', name: 'Canva', rating: '★★★★★' },
        { icon: '🔐', name: '1Password', rating: '★★★★★' }
    ];

    return `
        <div class="store-app">
            <div class="store-header">
                <h1>🛍️ Microsoft Store</h1>
                <p>Discover apps, games, and more</p>
            </div>
            <div class="store-apps">
                ${apps.map(app => `
                    <div class="store-app-item">
                        <div class="store-app-icon">${app.icon}</div>
                        <div class="store-app-name">${app.name}</div>
                        <div class="store-app-rating">${app.rating}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// WiFi Settings App
// Night Light
function toggleNightLight(el) {
    el.classList.toggle('active');
    const overlay = document.getElementById('night-light-overlay');
    if (overlay) overlay.classList.toggle('active');
    playSound('notification');
}

// Brightness control
function changeBrightness(value) {
    document.getElementById('brightness-value').textContent = value + '%';
    document.body.style.filter = `brightness(${value / 100})`;
}

// Focus Assist
function toggleFocusAssist(el) {
    el.classList.toggle('active');
    document.body.classList.toggle('focus-assist-active');
    playSound('notification');
}

// Clear notifications
function clearNotifications() {
    const list = document.getElementById('notification-list');
    if (list) {
        list.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No new notifications</p>';
    }
}

// Battery popup
function toggleBatteryPopup() {
    const popup = document.getElementById('battery-popup');
    const wifiMenu = document.getElementById('wifi-menu');
    const volumeMenu = document.getElementById('volume-menu');
    if (wifiMenu) wifiMenu.classList.remove('active');
    if (volumeMenu) volumeMenu.classList.remove('active');
    if (popup) popup.classList.toggle('active');
}

// Close battery popup when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.battery-popup') && !e.target.closest('.tray-icon[onclick*="Battery"]')) {
        const popup = document.getElementById('battery-popup');
        if (popup) popup.classList.remove('active');
    }
});

// Loading cursor effect when opening apps
function showLoadingCursor() {
    document.body.classList.add('loading-cursor');
    setTimeout(() => document.body.classList.remove('loading-cursor'), 500);
}

// Add notification dynamically
function addNotification(icon, title, body) {
    const list = document.getElementById('notification-list');
    if (list) {
        const noNotif = list.querySelector('p');
        if (noNotif) noNotif.remove();

        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.onclick = () => notif.remove();
        notif.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-text">
                <div class="notification-title">${title}</div>
                <div class="notification-body">${body}</div>
                <div class="notification-time">Just now</div>
            </div>
        `;
        list.insertBefore(notif, list.firstChild);
        playSound('notification');
    }
}

// Random notifications every 30 seconds
setInterval(() => {
    const notifications = [
        { icon: '📧', title: 'Mail', body: 'New message from John Doe' },
        { icon: '🔔', title: 'Reminder', body: 'Meeting in 15 minutes' },
        { icon: '💬', title: 'Teams', body: 'Sarah: Are you available?' },
        { icon: '📅', title: 'Calendar', body: 'Event starting soon' },
        { icon: '⬇️', title: 'Downloads', body: 'Download complete' }
    ];
    const random = notifications[Math.floor(Math.random() * notifications.length)];
    if (document.getElementById('screen-desktop')?.classList.contains('active')) {
        addNotification(random.icon, random.title, random.body);
    }
}, 60000);

function setSettingsBrightness(value) {
    document.getElementById('settings-brightness-val').textContent = value + '%';
    document.body.style.filter = `brightness(${value / 100})`;
}

function toggleSettingsNightLight(checked) {
    const overlay = document.getElementById('night-light-overlay');
    if (overlay) {
        if (checked) overlay.classList.add('active');
        else overlay.classList.remove('active');
    }
}

function setWallpaper(type, el) {
    currentWallpaper = type;
    const desktop = document.querySelector('.desktop');
    const wallpapers = {
        gradient1: 'linear-gradient(135deg, #667eea, #764ba2)',
        gradient2: 'linear-gradient(135deg, #11998e, #38ef7d)',
        gradient3: 'linear-gradient(135deg, #ee0979, #ff6a00)',
        gradient4: 'linear-gradient(135deg, #2193b0, #6dd5ed)',
        solid1: '#0078d4',
        solid2: '#1a1a2e',
        solid3: '#16213e',
        nature: 'linear-gradient(to bottom, #87ceeb, #228b22)'
    };
    if (desktop) {
        desktop.style.background = wallpapers[type];
        desktop.style.backgroundSize = 'cover';
    }
    document.querySelectorAll('.wallpaper-option').forEach(w => w.style.border = '3px solid transparent');
    if (el) el.style.border = '3px solid #0078d4';
    playSound('notification');
}

function setCustomWallpaper() {
    const urlInput = document.getElementById('custom-wallpaper-url');
    const url = urlInput.value.trim();

    if (!url) {
        alert('Please enter an image URL');
        return;
    }

    const desktop = document.querySelector('.desktop');
    if (desktop) {
        desktop.style.background = `url('${url}') center/cover no-repeat`;
        currentWallpaper = 'custom';

        const preview = document.getElementById('wallpaper-preview');
        const previewImg = document.getElementById('wallpaper-preview-img');
        if (preview && previewImg) {
            previewImg.src = url;
            preview.style.display = 'block';
        }

        document.querySelectorAll('.wallpaper-option').forEach(w => w.style.border = '3px solid transparent');
        playSound('notification');
    }
}

function updateUsername() {
    const newUsername = document.getElementById('edit-username').value.trim();
    if (newUsername && newUsername.length >= 2) {
        userData.username = newUsername;

        const displayUsername = document.getElementById('display-username');
        if (displayUsername) displayUsername.textContent = newUsername;

        const loginUsername = document.getElementById('login-username');
        if (loginUsername) loginUsername.textContent = newUsername;

        const lockUsername = document.querySelector('.lock-username');
        if (lockUsername) lockUsername.textContent = newUsername;

        document.querySelectorAll('.start-user-name').forEach(el => el.textContent = newUsername);

        playSound('notification');
        alert('Username updated successfully!');
    } else {
        alert('Username must be at least 2 characters');
    }
}

function updatePassword() {
    const currentPw = document.getElementById('current-password').value;
    const newPw = document.getElementById('new-password').value;
    const confirmPw = document.getElementById('confirm-password').value;

    if (currentPw !== userData.password) {
        alert('Current password is incorrect');
        playSound('error');
        return;
    }

    if (newPw.length < 4) {
        alert('New password must be at least 4 characters');
        return;
    }

    if (newPw !== confirmPw) {
        alert('New passwords do not match');
        return;
    }

    userData.password = newPw;
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';

    playSound('notification');
    alert('Password updated successfully!');
}

function setAvatar(emoji, color) {
    userData.avatar = emoji;
    userData.avatarColor = color;

    const accountAvatar = document.getElementById('account-avatar');
    if (accountAvatar) {
        accountAvatar.innerHTML = emoji;
        accountAvatar.style.background = color;
    }

    document.querySelectorAll('.start-user-avatar').forEach(el => {
        el.innerHTML = emoji;
        el.style.background = color;
    });

    const lockAvatar = document.querySelector('.lock-avatar');
    if (lockAvatar) {
        lockAvatar.innerHTML = emoji;
        lockAvatar.style.background = color;
    }

    playSound('notification');
}

function setCustomAvatar() {
    const url = document.getElementById('custom-avatar-url').value.trim();
    if (!url) {
        alert('Please enter an image URL');
        return;
    }

    userData.avatar = '';
    userData.avatarUrl = url;

    const avatarStyle = `background: url('${url}') center/cover no-repeat;`;

    const accountAvatar = document.getElementById('account-avatar');
    if (accountAvatar) {
        accountAvatar.innerHTML = '';
        accountAvatar.style.cssText = `width: 100px; height: 100px; border-radius: 50%; ${avatarStyle} border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.15);`;
    }

    playSound('notification');
}

function changeAvatar() {
    const avatars = ['👤', '😊', '🎮', '🎨', '💻', '🚀', '🌟', '🐱', '🦊', '🐶'];
    const colors = ['#0078d4', '#4caf50', '#9c27b0', '#ff5722', '#607d8b', '#e91e63', '#ffc107', '#795548', '#ff9800', '#3f51b5'];
    const randomIndex = Math.floor(Math.random() * avatars.length);
    setAvatar(avatars[randomIndex], colors[randomIndex]);
}

function setAccentColor(color, el) {
    accentColor = color;
    document.documentElement.style.setProperty('--accent-color', color);
    document.querySelectorAll('.start-button, .calc-btn.equals, button[style*="0078d4"]').forEach(btn => {
        if (btn.style.background) btn.style.background = color;
    });
    playSound('notification');
}

function toggleTransparency(enabled) {
    if (enabled) {
        document.querySelectorAll('.window, .start-menu, .notification-center').forEach(el => {
            el.style.backdropFilter = 'blur(10px)';
        });
    } else {
        document.querySelectorAll('.window, .start-menu, .notification-center').forEach(el => {
            el.style.backdropFilter = 'none';
        });
    }
}

function uninstallApp(appName, btn) {
    btn.textContent = 'Uninstalling...';
    btn.disabled = true;
    setTimeout(() => {
        btn.closest('.setting-item').style.opacity = '0.5';
        btn.textContent = 'Uninstalled';
        playSound('notification');
    }, 1500);
}

function checkForUpdates(btn) {
    btn.textContent = 'Checking...';
    btn.disabled = true;
    setTimeout(() => {
        btn.textContent = 'Up to date ✓';
        btn.style.background = '#107c10';
        playSound('notification');
    }, 2000);
}

function runQuickScan() {
    openApp('defender');
}

function createDefender() {
    return `
        <div style="height: 100%; background: #f5f5f5; padding: 20px; overflow-y: auto;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                <span style="font-size: 48px;">🛡️</span>
                <div>
                    <h2 style="margin: 0;">Windows Security</h2>
                    <p style="color: #666; margin: 4px 0;">Your device is being protected</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #107c10;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <span style="font-size: 24px;">🛡️</span>
                        <strong>Virus & threat protection</strong>
                    </div>
                    <p style="color: #107c10; margin: 0;">✓ No threats found</p>
                    <button onclick="startScan(this)" style="margin-top: 12px; padding: 8px 16px; background: #0078d4; color: white; border: none; border-radius: 4px; cursor: pointer;">Quick scan</button>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #107c10;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <span style="font-size: 24px;">🔥</span>
                        <strong>Firewall & network</strong>
                    </div>
                    <p style="color: #107c10; margin: 0;">✓ Firewall is on</p>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #107c10;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <span style="font-size: 24px;">🌐</span>
                        <strong>App & browser control</strong>
                    </div>
                    <p style="color: #107c10; margin: 0;">✓ Protected</p>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #107c10;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <span style="font-size: 24px;">💻</span>
                        <strong>Device security</strong>
                    </div>
                    <p style="color: #107c10; margin: 0;">✓ Standard hardware security</p>
                </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 16px;">
                <h3>Recent scans</h3>
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                    <span>Quick scan</span>
                    <span style="color: #666;">Today at ${new Date().toLocaleTimeString()}</span>
                    <span style="color: #107c10;">No threats</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                    <span>Full scan</span>
                    <span style="color: #666;">Yesterday</span>
                    <span style="color: #107c10;">No threats</span>
                </div>
            </div>
        </div>
    `;
}

function startScan(btn) {
    const originalText = btn.textContent;
    btn.textContent = 'Scanning...';
    btn.disabled = true;

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            clearInterval(interval);
            btn.textContent = 'No threats found ✓';
            btn.style.background = '#107c10';
            playSound('notification');
        } else {
            btn.textContent = `Scanning... ${Math.floor(progress)}%`;
        }
    }, 300);
}

let ransomTimerInterval;

function downloadRansomware() {
    playSound('error');

    const downloadPopup = document.createElement('div');
    downloadPopup.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); z-index: 100000; text-align: center;';
    downloadPopup.innerHTML = `
        <h3 style="margin-bottom: 16px;">⬇️ Downloading Ransomware.exe...</h3>
        <div style="width: 300px; height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden;">
            <div id="ransom-download-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #ff0000, #ff6600); transition: width 0.1s;"></div>
        </div>
        <p id="ransom-download-text" style="margin-top: 12px; color: #666;">0% - Starting download...</p>
    `;
    document.body.appendChild(downloadPopup);

    let progress = 0;
    const downloadInterval = setInterval(() => {
        progress += Math.random() * 8;
        if (progress >= 100) {
            progress = 100;
            clearInterval(downloadInterval);
            document.getElementById('ransom-download-text').textContent = '100% - Running executable...';

            setTimeout(() => {
                downloadPopup.remove();
                activateRansomware();
            }, 1000);
        }
        document.getElementById('ransom-download-progress').style.width = progress + '%';
        document.getElementById('ransom-download-text').textContent = Math.floor(progress) + '% - Downloading...';
    }, 100);
}

function activateRansomware() {
    playSound('error');
    showScreen('screen-ransomware');

    let timeLeft = 1 * 25;
    ransomTimerInterval = setInterval(() => {
        timeLeft--;
        const hours = Math.floor(timeLeft / 3600);
        const mins = Math.floor((timeLeft % 3600) / 60);
        const secs = timeLeft % 60;
        const timerEl = document.getElementById('ransom-timer');
        if (timerEl) {
            timerEl.textContent = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function decryptFiles() {
    clearInterval(ransomTimerInterval);
    const content = document.querySelector('.ransomware-content');
    if (content) {
        content.innerHTML = `
            <div style="font-size: 80px; margin-bottom: 20px;">✅</div>
            <h2 style="color: #00ff00;">Payment Received!</h2>
            <p>Just kidding! This was a simulation.</p>
            <p>Never pay ransomware attackers in real life!</p>
            <p style="margin-top: 20px;">Tips to stay safe:</p>
            <ul style="text-align: left; margin: 20px auto; max-width: 400px;">
                <li>Keep regular backups</li>
                <li>Don't click suspicious links</li>
                <li>Keep your software updated</li>
                <li>Use antivirus software</li>
            </ul>
            <button onclick="closeRansomware()" style="padding: 14px 28px; background: #00cc00; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-top: 20px;">Return to Desktop</button>
        `;
    }
    playSound('notification');
}

function closeRansomware() {
    clearInterval(ransomTimerInterval);
    showScreen('screen-desktop');
    playSound('startup');
}

function downloadFreeGames() {
    playSound('error');
    triggerBSOD();
}

function triggerBSOD() {
    showScreen('screen-bsod');

    let percent = 0;
    const bsodInterval = setInterval(() => {
        percent += Math.random() * 3;
        if (percent >= 100) {
            percent = 100;
            clearInterval(bsodInterval);
            setTimeout(() => {
                showScreen('screen-boot');
                setTimeout(() => {
                    showScreen('screen-lock');
                    playSound('startup');
                }, 3000);
            }, 2000);
        }
        const percentEl = document.getElementById('bsod-percent');
        if (percentEl) percentEl.textContent = Math.floor(percent);
    }, 200);
}

function showVirusAlert() {
    playSound('error');
    const alert = document.createElement('div');
    alert.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(135deg, #ff0000, #cc0000); color: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(255,0,0,0.5); z-index: 100000; text-align: center; animation: shake 0.5s infinite;';
    alert.innerHTML = `
        <style>@keyframes shake { 0%, 100% { transform: translate(-50%, -50%) rotate(0deg); } 25% { transform: translate(-50%, -50%) rotate(-2deg); } 75% { transform: translate(-50%, -50%) rotate(2deg); } }</style>
        <div style="font-size: 60px; margin-bottom: 16px;">⚠️🦠⚠️</div>
        <h2>VIRUS DETECTED!</h2>
        <p>Your computer has been infected with 47 viruses!</p>
        <p style="font-size: 12px; opacity: 0.8; margin-top: 16px;">(This is fake, don't worry)</p>
        <button onclick="this.parentElement.remove(); playSound('notification');" style="margin-top: 20px; padding: 12px 24px; background: white; color: #cc0000; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Close</button>
    `;
    document.body.appendChild(alert);
}

function createWifiSettings() {
    return `
        <div style="padding: 20px; height: 100%; background: white;">
            <h2 style="margin-bottom: 20px;">📶 Network & Internet</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 18px; font-weight: 500;">Wi-Fi</div>
                        <div style="color: #666;">Connected to Home_WiFi_5G</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
            <h3 style="margin-bottom: 10px;">Available networks</h3>
            <div style="border: 1px solid #e0e0e0; border-radius: 8px;">
                <div style="padding: 12px 16px; border-bottom: 1px solid #e0e0e0; background: #e3f2fd;">
                    <strong>Home_WiFi_5G</strong> - Connected, secured 📶
                </div>
                <div style="padding: 12px 16px; border-bottom: 1px solid #e0e0e0;">
                    Neighbors_Network - Secured 📶
                </div>
                <div style="padding: 12px 16px; border-bottom: 1px solid #e0e0e0;">
                    Coffee_Shop_Free 5Ghz - Open 📶
                </div>
                <div style="padding: 12px 16px;">
                    Office_Guest - Secured 📶
                </div>
            </div>
        </div>
    `;
}