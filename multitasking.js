// Multitasking & Gestures Settings JavaScript
class MultitaskingSettings {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
    }

    initializeElements() {
        this.toggles = document.querySelectorAll('.toggle-switch');
        this.settingRows = document.querySelectorAll('.setting-row');
    }

    setupEventListeners() {
        // Add click handlers for toggle switches
        this.toggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => this.handleToggle(e));
        });

        // Add touch feedback to setting rows
        this.settingRows.forEach(row => {
            row.addEventListener('touchstart', this.addTouchFeedback, {passive: true});
            row.addEventListener('touchend', this.removeTouchFeedback, {passive: true});
            row.addEventListener('click', (e) => this.handleRowClick(e));
        });
    }

    handleToggle(event) {
        const toggle = event.target.closest('.toggle-switch');
        if (!toggle) return;

        const isActive = toggle.classList.contains('active');
        const settingLabel = toggle.closest('.setting-row').querySelector('.setting-label').textContent;
        
        if (isActive) {
            toggle.classList.remove('active');
        } else {
            toggle.classList.add('active');
        }

        // Add haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        // Save setting
        this.saveSetting(toggle);

        // Show notification about the change
        this.showNotification(`${settingLabel} ${toggle.classList.contains('active') ? 'enabled' : 'disabled'}`);
    }

    handleRowClick(event) {
        const row = event.target.closest('.setting-row');
        if (!row || row.querySelector('.toggle-switch')) return;

        const label = row.querySelector('.setting-label').textContent;
        
        // Add click animation
        row.style.transform = 'scale(0.98)';
        setTimeout(() => {
            row.style.transform = 'scale(1)';
        }, 100);

        console.log(`Navigating to: ${label}`);
        
        // Add haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }

        this.showNotification(`Opening ${label} settings`);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
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

    addTouchFeedback(event) {
        if (!event.target.closest('.toggle-switch')) {
            event.target.style.backgroundColor = 'var(--bg-tertiary)';
        }
    }

    removeTouchFeedback(event) {
        if (!event.target.closest('.toggle-switch')) {
            event.target.style.backgroundColor = '';
        }
    }

    saveSetting(toggle) {
        const settingRow = toggle.closest('.setting-row');
        const label = settingRow.querySelector('.setting-label').textContent;
        const isActive = toggle.classList.contains('active');
        
        localStorage.setItem(`multitasking_${label.replace(/\s+/g, '_').toLowerCase()}`, isActive);
        console.log(`${label}: ${isActive ? 'enabled' : 'disabled'}`);
    }

    loadSettings() {
        this.settingRows.forEach(row => {
            const toggle = row.querySelector('.toggle-switch');
            if (toggle) {
                const label = row.querySelector('.setting-label').textContent;
                const saved = localStorage.getItem(`multitasking_${label.replace(/\s+/g, '_').toLowerCase()}`);
                
                if (saved === 'true' || (saved === null && toggle.classList.contains('active'))) {
                    toggle.classList.add('active');
                }
            }
        });
    }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MultitaskingSettings();
});