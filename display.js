// Display & Brightness Settings JavaScript
class DisplaySettings {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadDisplayState();
    }

    initializeElements() {
        this.brightnessSlider = document.getElementById('brightnessSlider');
        this.autoBrightnessToggle = document.getElementById('autoBrightnessToggle');
        this.trueToneToggle = document.getElementById('trueToneToggle');
        this.raiseToWakeToggle = document.getElementById('raiseToWakeToggle');
        this.boldTextToggle = document.getElementById('boldTextToggle');
        this.nightShiftModal = document.getElementById('nightShiftModal');
        this.autoLockModal = document.getElementById('autoLockModal');
        
        this.currentAppearance = 'dark';
        this.currentBrightness = 65;
        this.currentAutoLock = '5m';
    }

    setupEventListeners() {
        // Real-time brightness adjustment
        this.brightnessSlider.addEventListener('input', (e) => {
            this.adjustBrightness(e.target.value);
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal') && !e.target.closest('.modal-content')) {
                this.closeAllModals();
            }
        });
    }

    loadDisplayState() {
        // Load saved settings
        const appearance = localStorage.getItem('appearance') || 'dark';
        const brightness = localStorage.getItem('brightness') || '65';
        const autoBrightness = localStorage.getItem('autoBrightness') !== 'false';
        const trueTone = localStorage.getItem('trueTone') !== 'false';
        const raiseToWake = localStorage.getItem('raiseToWake') !== 'false';
        const boldText = localStorage.getItem('boldText') === 'true';
        const autoLock = localStorage.getItem('autoLock') || '5m';

        // Apply settings
        this.setAppearance(appearance, false);
        this.brightnessSlider.value = brightness;
        this.currentBrightness = brightness;
        this.adjustBrightness(brightness);

        if (!autoBrightness) this.autoBrightnessToggle.classList.remove('active');
        if (!trueTone) this.trueToneToggle.classList.remove('active');
        if (!raiseToWake) this.raiseToWakeToggle.classList.remove('active');
        if (boldText) this.boldTextToggle.classList.add('active');

        this.currentAutoLock = autoLock;
        this.updateAutoLockDisplay(autoLock);
    }

    setAppearance(mode, save = true) {
        // Update UI
        document.querySelectorAll('.appearance-option').forEach(option => {
            option.classList.remove('active');
        });

        const targetOption = document.getElementById(`${mode}Mode`);
        if (targetOption) {
            targetOption.classList.add('active');
        }

        this.currentAppearance = mode;

        // Apply theme changes
        if (mode === 'light') {
            this.applyLightTheme();
        } else if (mode === 'dark') {
            this.applyDarkTheme();
        } else if (mode === 'auto') {
            this.applyAutoTheme();
        }

        if (save) {
            localStorage.setItem('appearance', mode);
            this.showNotification(`${mode.charAt(0).toUpperCase() + mode.slice(1)} mode enabled`);
        }

        console.log(`Appearance set to ${mode}`);
    }

    applyLightTheme() {
        document.documentElement.style.setProperty('--bg-primary', '#ffffff');
        document.documentElement.style.setProperty('--bg-secondary', '#f2f2f7');
        document.documentElement.style.setProperty('--bg-tertiary', '#e5e5ea');
        document.documentElement.style.setProperty('--text-primary', '#000000');
        document.documentElement.style.setProperty('--text-secondary', '#6d6d70');
    }

    applyDarkTheme() {
        document.documentElement.style.setProperty('--bg-primary', '#000000');
        document.documentElement.style.setProperty('--bg-secondary', '#1c1c1e');
        document.documentElement.style.setProperty('--bg-tertiary', '#2c2c2e');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#8e8e93');
    }

    applyAutoTheme() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 18) {
            this.applyLightTheme();
        } else {
            this.applyDarkTheme();
        }
    }

    adjustBrightness(value) {
        this.currentBrightness = value;
        
        // Visual feedback
        const brightness = value / 100;
        document.body.style.filter = `brightness(${Math.max(0.3, brightness)})`;
        
        // Update slider appearance
        const percentage = (value / 100) * 100;
        this.brightnessSlider.style.background = 
            `linear-gradient(to right, var(--accent-blue) 0%, var(--accent-blue) ${percentage}%, var(--bg-tertiary) ${percentage}%, var(--bg-tertiary) 100%)`;
        
        localStorage.setItem('brightness', value);
        console.log(`Brightness adjusted to ${value}%`);
    }

    updateAutoLockDisplay(value) {
        const autoLockElement = document.getElementById('autoLockValue');
        const displayValues = {
            '30s': '30 Seconds',
            '1m': '1 Minute',
            '2m': '2 Minutes',
            '5m': '5 Minutes',
            '10m': '10 Minutes',
            '15m': '15 Minutes',
            'never': 'Never'
        };
        
        autoLockElement.textContent = displayValues[value] || '5 Minutes';
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 200);
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `<span>${message}</span>`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--bg-secondary);
            color: var(--text-primary);
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
}

// Global functions
function navigateBack() {
    const container = document.querySelector('.ios-container');
    container.style.opacity = '0.8';
    container.style.transform = 'translateX(20px)';
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 150);
}

function setAppearance(mode) {
    window.displaySettings.setAppearance(mode);
}

function adjustBrightness(value) {
    window.displaySettings.adjustBrightness(value);
}

function toggleAutoBrightness() {
    const toggle = document.getElementById('autoBrightnessToggle');
    const isActive = toggle.classList.contains('active');
    
    if (isActive) {
        toggle.classList.remove('active');
        localStorage.setItem('autoBrightness', 'false');
    } else {
        toggle.classList.add('active');
        localStorage.setItem('autoBrightness', 'true');
    }
    
    window.displaySettings.showNotification(`Auto-Brightness ${isActive ? 'disabled' : 'enabled'}`);
    console.log(`Auto-Brightness ${isActive ? 'disabled' : 'enabled'}`);
}

function toggleTrueTone() {
    const toggle = document.getElementById('trueToneToggle');
    const isActive = toggle.classList.contains('active');
    
    if (isActive) {
        toggle.classList.remove('active');
        localStorage.setItem('trueTone', 'false');
    } else {
        toggle.classList.add('active');
        localStorage.setItem('trueTone', 'true');
    }
    
    window.displaySettings.showNotification(`True Tone ${isActive ? 'disabled' : 'enabled'}`);
    console.log(`True Tone ${isActive ? 'disabled' : 'enabled'}`);
}

function toggleRaiseToWake() {
    const toggle = document.getElementById('raiseToWakeToggle');
    const isActive = toggle.classList.contains('active');
    
    if (isActive) {
        toggle.classList.remove('active');
        localStorage.setItem('raiseToWake', 'false');
    } else {
        toggle.classList.add('active');
        localStorage.setItem('raiseToWake', 'true');
    }
    
    window.displaySettings.showNotification(`Raise to Wake ${isActive ? 'disabled' : 'enabled'}`);
    console.log(`Raise to Wake ${isActive ? 'disabled' : 'enabled'}`);
}

function toggleBoldText() {
    const toggle = document.getElementById('boldTextToggle');
    const isActive = toggle.classList.contains('active');
    
    if (isActive) {
        toggle.classList.remove('active');
        localStorage.setItem('boldText', 'false');
        document.body.style.fontWeight = 'normal';
    } else {
        toggle.classList.add('active');
        localStorage.setItem('boldText', 'true');
        document.body.style.fontWeight = '600';
    }
    
    window.displaySettings.showNotification(`Bold Text ${isActive ? 'disabled' : 'enabled'}`);
    console.log(`Bold Text ${isActive ? 'disabled' : 'enabled'}`);
}

function showNightShiftSettings() {
    const modal = document.getElementById('nightShiftModal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function closeNightShiftModal() {
    const modal = document.getElementById('nightShiftModal');
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 200);
}

function toggleNightShiftSchedule() {
    const toggle = document.getElementById('nightShiftScheduleToggle');
    const scheduleOptions = document.getElementById('scheduleOptions');
    const isActive = toggle.classList.contains('active');
    
    if (isActive) {
        toggle.classList.remove('active');
        scheduleOptions.style.display = 'none';
        document.getElementById('nightShiftStatus').textContent = 'Off';
    } else {
        toggle.classList.add('active');
        scheduleOptions.style.display = 'block';
        document.getElementById('nightShiftStatus').textContent = 'Sunset to Sunrise';
    }
}

function setNightShiftSchedule(type) {
    const radioButtons = document.querySelectorAll('.night-shift-modal .radio-button');
    radioButtons.forEach(btn => btn.classList.remove('selected'));
    
    if (type === 'sunset') {
        radioButtons[0].classList.add('selected');
        document.getElementById('nightShiftStatus').textContent = 'Sunset to Sunrise';
    } else if (type === 'custom') {
        radioButtons[1].classList.add('selected');
        document.getElementById('nightShiftStatus').textContent = 'Custom Schedule';
    }
}

function showAutoLockSettings() {
    const modal = document.getElementById('autoLockModal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function closeAutoLockModal() {
    const modal = document.getElementById('autoLockModal');
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 200);
}

function setAutoLock(value) {
    const radioButtons = document.querySelectorAll('.auto-lock-options .radio-button');
    radioButtons.forEach(btn => btn.classList.remove('selected'));
    
    const values = ['30s', '1m', '2m', '5m', '10m', '15m', 'never'];
    const index = values.indexOf(value);
    if (index !== -1) {
        radioButtons[index].classList.add('selected');
    }
    
    window.displaySettings.currentAutoLock = value;
    window.displaySettings.updateAutoLockDisplay(value);
    localStorage.setItem('autoLock', value);
    
    closeAutoLockModal();
    window.displaySettings.showNotification(`Auto-Lock set to ${document.getElementById('autoLockValue').textContent}`);
}

function showTextSizeSettings() {
    window.displaySettings.showNotification('Text Size settings', 'info');
}

function showBoldTextSettings() {
    toggleBoldText();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.displaySettings = new DisplaySettings();
});