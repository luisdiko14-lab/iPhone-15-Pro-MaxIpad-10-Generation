// Search Settings JavaScript
class SearchSettings {
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

        // Show feedback for Siri Suggestions toggle
        const settingLabel = toggle.closest('.setting-row').querySelector('.setting-label').textContent;
        if (settingLabel === 'Siri Suggestions') {
            this.showNotification(`Siri Suggestions ${toggle.classList.contains('active') ? 'enabled' : 'disabled'}`);
        }
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

        console.log(`Opening search settings for: ${label}`);
        
        // Add haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }

        this.showSearchAppModal(label);
    }

    showSearchAppModal(appName) {
        const modal = document.createElement('div');
        modal.className = 'search-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${appName} Search Settings</h3>
                </div>
                <div class="search-options">
                    <div class="search-option">
                        <span>Search ${appName}</span>
                        <div class="toggle-switch active">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    <div class="search-option">
                        <span>Show in Search</span>
                        <div class="toggle-switch active">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    <div class="search-option">
                        <span>Show in Look Up</span>
                        <div class="toggle-switch">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="this.closest('.search-modal').remove()">Done</button>
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
        
        localStorage.setItem(`search_${label.replace(/\s+/g, '_').toLowerCase()}`, isActive);
        console.log(`Search ${label}: ${isActive ? 'enabled' : 'disabled'}`);
    }

    loadSettings() {
        this.settingRows.forEach(row => {
            const toggle = row.querySelector('.toggle-switch');
            if (toggle) {
                const label = row.querySelector('.setting-label').textContent;
                const saved = localStorage.getItem(`search_${label.replace(/\s+/g, '_').toLowerCase()}`);
                
                if (saved === 'true' || (saved === null && toggle.classList.contains('active'))) {
                    toggle.classList.add('active');
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
        max-width: 300px;
        width: 100%;
        animation: modalSlideIn 0.3s ease-out;
    }

    .modal-header h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 16px;
        text-align: center;
    }

    .search-options {
        margin-bottom: 20px;
    }

    .search-option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 0.5px solid var(--border-color);
        font-size: 17px;
        color: var(--text-primary);
    }

    .search-option:last-child {
        border-bottom: none;
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
    new SearchSettings();
});