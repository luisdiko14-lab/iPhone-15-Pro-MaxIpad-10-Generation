// Focus Settings JavaScript
class FocusSettings {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
    }

    initializeElements() {
        this.toggles = document.querySelectorAll('.toggle-switch');
        this.settingRows = document.querySelectorAll('.setting-row');
        this.focusItems = document.querySelectorAll('.focus-item');
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
        });

        // Add click handlers for focus items
        this.focusItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleFocusClick(e));
        });
    }

    handleToggle(event) {
        const toggle = event.target.closest('.toggle-switch');
        if (!toggle) return;

        const isActive = toggle.classList.contains('active');
        const settingRow = toggle.closest('.setting-row');
        const label = settingRow.querySelector('.setting-label').textContent;
        
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

        // Handle focus mode activation
        if (settingRow.classList.contains('focus-item')) {
            this.handleFocusActivation(settingRow, toggle.classList.contains('active'));
        }

        this.showNotification(`${label} ${toggle.classList.contains('active') ? 'enabled' : 'disabled'}`);
    }

    handleFocusClick(event) {
        const focusItem = event.target.closest('.focus-item');
        if (!focusItem || event.target.closest('.toggle-switch')) return;

        const focusType = focusItem.dataset.focus;
        const label = focusItem.querySelector('.setting-label').textContent;
        
        // Add click animation
        focusItem.style.transform = 'scale(0.98)';
        setTimeout(() => {
            focusItem.style.transform = 'scale(1)';
        }, 100);

        console.log(`Opening focus settings for: ${label}`);
        
        // Add haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }

        this.showFocusOptions(focusType, label);
    }

    handleFocusActivation(focusItem, isActive) {
        const focusType = focusItem.dataset.focus;
        
        if (isActive) {
            // Deactivate other focus modes
            this.focusItems.forEach(item => {
                if (item !== focusItem) {
                    const otherToggle = item.querySelector('.toggle-switch');
                    if (otherToggle && otherToggle.classList.contains('active')) {
                        otherToggle.classList.remove('active');
                        this.saveSetting(otherToggle);
                    }
                }
            });

            this.showFocusActivatedNotification(focusType);
        }
    }

    showFocusOptions(focusType, label) {
        const modal = document.createElement('div');
        modal.className = 'focus-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${label} Settings</h3>
                </div>
                <div class="focus-options">
                    <div class="focus-option">
                        <span>Allow Notifications</span>
                        <div class="toggle-switch">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    <div class="focus-option">
                        <span>Dim Lock Screen</span>
                        <div class="toggle-switch active">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    <div class="focus-option">
                        <span>Hide Notification Badges</span>
                        <div class="toggle-switch">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>
                <div class="focus-schedule">
                    <div class="schedule-title">Schedule</div>
                    <div class="schedule-option">
                        <span>Time</span>
                        <span class="schedule-value">Off</span>
                    </div>
                    <div class="schedule-option">
                        <span>Location</span>
                        <span class="schedule-value">Off</span>
                    </div>
                    <div class="schedule-option">
                        <span>App</span>
                        <span class="schedule-value">Off</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="this.closest('.focus-modal').remove()">Done</button>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
        `;

        document.body.appendChild(modal);

        // Add event listeners for modal toggles
        modal.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                if (navigator.vibrate) {
                    navigator.vibrate(30);
                }
            });
        });

        // Remove on tap outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showFocusActivatedNotification(focusType) {
        const focusNames = {
            'dnd': 'Do Not Disturb',
            'work': 'Work Focus',
            'personal': 'Personal Time',
            'sleep': 'Sleep Focus'
        };

        const notification = document.createElement('div');
        notification.className = 'focus-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="focus-indicator">🌙</div>
                <div class="notification-text">
                    <div class="notification-title">${focusNames[focusType] || 'Focus'} is On</div>
                    <div class="notification-subtitle">You'll only receive allowed notifications</div>
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--bg-secondary);
            color: var(--text-primary);
            padding: 16px 20px;
            border-radius: 12px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            min-width: 280px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
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
        
        localStorage.setItem(`focus_${label.replace(/\s+/g, '_').toLowerCase()}`, isActive);
        console.log(`Focus ${label}: ${isActive ? 'enabled' : 'disabled'}`);
    }

    loadSettings() {
        this.settingRows.forEach(row => {
            const toggle = row.querySelector('.toggle-switch');
            if (toggle) {
                const label = row.querySelector('.setting-label').textContent;
                const saved = localStorage.getItem(`focus_${label.replace(/\s+/g, '_').toLowerCase()}`);
                
                if (saved === 'true') {
                    toggle.classList.add('active');
                } else if (saved === null && toggle.classList.contains('active')) {
                    // Keep default active state
                }
            }
        });
    }
}

// Add CSS animations and styles
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

    .modal-content {
        background: var(--bg-secondary);
        border-radius: 14px;
        padding: 20px;
        max-width: 320px;
        width: 100%;
        animation: modalSlideIn 0.3s ease-out;
    }

    .focus-options {
        margin-bottom: 20px;
    }

    .focus-option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 0.5px solid var(--border-color);
        font-size: 17px;
        color: var(--text-primary);
    }

    .focus-option:last-child {
        border-bottom: none;
    }

    .focus-schedule {
        border-top: 0.5px solid var(--border-color);
        padding-top: 16px;
        margin-bottom: 20px;
    }

    .schedule-title {
        font-size: 15px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
    }

    .schedule-option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        font-size: 17px;
        color: var(--text-primary);
    }

    .schedule-value {
        color: var(--text-secondary);
    }

    .focus-notification .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .focus-indicator {
        font-size: 24px;
    }

    .notification-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .notification-subtitle {
        font-size: 14px;
        color: var(--text-secondary);
    }

    .modal-actions {
        text-align: center;
    }

    .modal-btn {
        background: var(--accent-blue);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 17px;
        font-weight: 600;
        cursor: pointer;
    }

    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FocusSettings();
});