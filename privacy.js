// Privacy & Security Settings JavaScript
class PrivacySettings {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.settingRows = document.querySelectorAll('.setting-row');
    }

    setupEventListeners() {
        // Add touch feedback to setting rows
        this.settingRows.forEach(row => {
            row.addEventListener('touchstart', this.addTouchFeedback, {passive: true});
            row.addEventListener('touchend', this.removeTouchFeedback, {passive: true});
            row.addEventListener('click', (e) => this.handleRowClick(e));
        });
    }

    handleRowClick(event) {
        const row = event.target.closest('.setting-row');
        if (!row) return;

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

        // Show privacy alert for sensitive settings
        if (label.includes('Location') || label.includes('Tracking') || label.includes('Face ID')) {
            this.showPrivacyAlert(label);
        }
    }

    showPrivacyAlert(setting) {
        const alert = document.createElement('div');
        alert.className = 'privacy-alert';
        alert.innerHTML = `
            <div class="alert-content">
                <div class="alert-icon">🔒</div>
                <div class="alert-title">${setting}</div>
                <div class="alert-message">This setting helps protect your privacy by controlling access to your personal information.</div>
            </div>
        `;
        
        alert.style.cssText = `
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

        const alertContent = alert.querySelector('.alert-content');
        alertContent.style.cssText = `
            background: var(--bg-secondary);
            border-radius: 14px;
            padding: 20px;
            text-align: center;
            max-width: 300px;
            animation: alertSlideIn 0.3s ease-out;
        `;

        document.body.appendChild(alert);

        // Auto-remove after 2 seconds
        setTimeout(() => {
            alert.remove();
        }, 2000);

        // Remove on tap
        alert.addEventListener('click', () => {
            alert.remove();
        });
    }

    addTouchFeedback(event) {
        event.target.style.backgroundColor = 'var(--bg-tertiary)';
    }

    removeTouchFeedback(event) {
        event.target.style.backgroundColor = '';
    }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes alertSlideIn {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    .alert-icon {
        font-size: 40px;
        margin-bottom: 12px;
    }

    .alert-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 8px;
    }

    .alert-message {
        font-size: 14px;
        color: var(--text-secondary);
        line-height: 1.4;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PrivacySettings();
});