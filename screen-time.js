// Screen Time Settings JavaScript
class ScreenTimeSettings {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.animateChart();
    }

    initializeElements() {
        this.settingRows = document.querySelectorAll('.setting-row');
        this.chartBar = document.querySelector('.bar-fill');
        this.timeDisplay = document.querySelector('.time-display');
    }

    setupEventListeners() {
        // Add touch feedback to setting rows
        this.settingRows.forEach(row => {
            row.addEventListener('touchstart', this.addTouchFeedback, {passive: true});
            row.addEventListener('touchend', this.removeTouchFeedback, {passive: true});
            row.addEventListener('click', (e) => this.handleRowClick(e));
        });

        // Update chart periodically
        setInterval(() => {
            this.updateScreenTimeData();
        }, 30000); // Update every 30 seconds
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

        console.log(`Opening: ${label}`);
        
        // Add haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }

        this.showScreenTimeOption(label);
    }

    showScreenTimeOption(option) {
        switch(option) {
            case 'App Limits':
                this.showAppLimits();
                break;
            case 'Downtime':
                this.showDowntime();
                break;
            case 'Always Allowed':
                this.showAlwaysAllowed();
                break;
            case 'Screen Time Passcode':
                this.showPasscodeOption();
                break;
        }
    }

    showAppLimits() {
        const modal = document.createElement('div');
        modal.className = 'screentime-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>App Limits</h3>
                    <p>Set daily time limits for app categories</p>
                </div>
                <div class="app-categories">
                    <div class="category-item">
                        <div class="category-info">
                            <span class="category-name">Social Networking</span>
                            <span class="category-time">1h 30m</span>
                        </div>
                        <div class="category-chart">
                            <div class="usage-bar" style="width: 75%;"></div>
                        </div>
                    </div>
                    <div class="category-item">
                        <div class="category-info">
                            <span class="category-name">Entertainment</span>
                            <span class="category-time">45m</span>
                        </div>
                        <div class="category-chart">
                            <div class="usage-bar" style="width: 40%;"></div>
                        </div>
                    </div>
                    <div class="category-item">
                        <div class="category-info">
                            <span class="category-name">Games</span>
                            <span class="category-time">30m</span>
                        </div>
                        <div class="category-chart">
                            <div class="usage-bar" style="width: 90%;"></div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="this.closest('.screentime-modal').remove()">Done</button>
                </div>
            </div>
        `;
        
        this.showModal(modal);
    }

    showDowntime() {
        const modal = document.createElement('div');
        modal.className = 'screentime-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Downtime</h3>
                    <p>Schedule time away from the screen</p>
                </div>
                <div class="downtime-options">
                    <div class="downtime-toggle">
                        <span>Scheduled</span>
                        <div class="toggle-switch">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    <div class="time-picker">
                        <div class="time-option">
                            <span>From</span>
                            <span class="time-value">10:00 PM</span>
                        </div>
                        <div class="time-option">
                            <span>To</span>
                            <span class="time-value">7:00 AM</span>
                        </div>
                    </div>
                    <div class="days-selector">
                        <div class="days-title">Every Day</div>
                        <div class="days-grid">
                            <div class="day-btn active">Sun</div>
                            <div class="day-btn active">Mon</div>
                            <div class="day-btn active">Tue</div>
                            <div class="day-btn active">Wed</div>
                            <div class="day-btn active">Thu</div>
                            <div class="day-btn active">Fri</div>
                            <div class="day-btn active">Sat</div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="this.closest('.screentime-modal').remove()">Done</button>
                </div>
            </div>
        `;
        
        this.showModal(modal);

        // Add toggle functionality
        const toggle = modal.querySelector('.toggle-switch');
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        });

        // Add day selector functionality
        modal.querySelectorAll('.day-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
            });
        });
    }

    showAlwaysAllowed() {
        const modal = document.createElement('div');
        modal.className = 'screentime-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Always Allowed</h3>
                    <p>Apps that are always available</p>
                </div>
                <div class="allowed-apps">
                    <div class="app-item">
                        <div class="app-icon">📞</div>
                        <span>Phone</span>
                        <div class="remove-btn">−</div>
                    </div>
                    <div class="app-item">
                        <div class="app-icon">💬</div>
                        <span>Messages</span>
                        <div class="remove-btn">−</div>
                    </div>
                    <div class="app-item">
                        <div class="app-icon">⚙️</div>
                        <span>Settings</span>
                        <div class="remove-btn">−</div>
                    </div>
                    <div class="add-app-btn">
                        <span>+ Add App</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="this.closest('.screentime-modal').remove()">Done</button>
                </div>
            </div>
        `;
        
        this.showModal(modal);
    }

    showPasscodeOption() {
        const modal = document.createElement('div');
        modal.className = 'screentime-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Screen Time Passcode</h3>
                    <p>Set a passcode to secure Screen Time settings</p>
                </div>
                <div class="passcode-options">
                    <button class="passcode-btn">Change Screen Time Passcode</button>
                    <button class="passcode-btn">Turn Off Screen Time Passcode</button>
                </div>
                <div class="passcode-info">
                    <p>This passcode is only for Screen Time settings and is separate from the passcode used to unlock your iPad.</p>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn cancel" onclick="this.closest('.screentime-modal').remove()">Cancel</button>
                </div>
            </div>
        `;
        
        this.showModal(modal);
    }

    showModal(modal) {
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

        // Remove on tap outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    animateChart() {
        if (this.chartBar) {
            // Start with 0 height and animate to current value
            const targetHeight = this.chartBar.style.height || '60%';
            this.chartBar.style.height = '0%';
            
            setTimeout(() => {
                this.chartBar.style.height = targetHeight;
            }, 500);
        }
    }

    updateScreenTimeData() {
        // Simulate screen time data updates
        const hours = Math.floor(Math.random() * 2) + 2; // 2-4 hours
        const minutes = Math.floor(Math.random() * 60);
        const percentage = Math.min((hours * 60 + minutes) / 300 * 100, 100); // Max 5 hours = 100%

        if (this.timeDisplay) {
            this.timeDisplay.textContent = `${hours}h ${minutes}m`;
        }

        if (this.chartBar) {
            this.chartBar.style.height = `${percentage}%`;
        }
    }

    addTouchFeedback(event) {
        event.target.style.backgroundColor = 'var(--bg-tertiary)';
    }

    removeTouchFeedback(event) {
        event.target.style.backgroundColor = '';
    }
}

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
    .modal-content {
        background: var(--bg-secondary);
        border-radius: 14px;
        padding: 20px;
        max-width: 350px;
        width: 100%;
        animation: modalSlideIn 0.3s ease-out;
        max-height: 80vh;
        overflow-y: auto;
    }

    .modal-header h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
    }

    .modal-header p {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 20px;
    }

    .app-categories {
        margin-bottom: 20px;
    }

    .category-item {
        padding: 12px 0;
        border-bottom: 0.5px solid var(--border-color);
    }

    .category-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .category-name {
        font-size: 16px;
        color: var(--text-primary);
    }

    .category-time {
        font-size: 16px;
        color: var(--text-secondary);
    }

    .category-chart {
        height: 4px;
        background: var(--bg-tertiary);
        border-radius: 2px;
        overflow: hidden;
    }

    .usage-bar {
        height: 100%;
        background: linear-gradient(90deg, #ff6b6b, #ff8e8e);
        border-radius: 2px;
        transition: width 0.3s ease;
    }

    .downtime-toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        margin-bottom: 16px;
        font-size: 17px;
        color: var(--text-primary);
    }

    .time-picker {
        margin-bottom: 20px;
    }

    .time-option {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-size: 17px;
        color: var(--text-primary);
    }

    .time-value {
        color: var(--accent-blue);
    }

    .days-selector {
        margin-bottom: 20px;
    }

    .days-title {
        font-size: 16px;
        color: var(--text-primary);
        margin-bottom: 12px;
    }

    .days-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
    }

    .day-btn {
        padding: 8px 4px;
        text-align: center;
        background: var(--bg-tertiary);
        border-radius: 6px;
        font-size: 14px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .day-btn.active {
        background: var(--accent-blue);
        color: white;
    }

    .allowed-apps {
        margin-bottom: 20px;
    }

    .app-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 0.5px solid var(--border-color);
    }

    .app-icon {
        font-size: 24px;
        margin-right: 12px;
        width: 32px;
        text-align: center;
    }

    .remove-btn {
        margin-left: auto;
        color: var(--text-secondary);
        font-size: 20px;
        cursor: pointer;
    }

    .add-app-btn {
        padding: 12px 0;
        color: var(--accent-blue);
        font-size: 17px;
        cursor: pointer;
    }

    .passcode-options {
        margin-bottom: 20px;
    }

    .passcode-btn {
        display: block;
        width: 100%;
        background: var(--accent-blue);
        color: white;
        border: none;
        padding: 14px;
        border-radius: 8px;
        font-size: 17px;
        font-weight: 500;
        margin-bottom: 10px;
        cursor: pointer;
    }

    .passcode-info p {
        font-size: 13px;
        color: var(--text-secondary);
        line-height: 1.4;
        margin-bottom: 20px;
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

    .modal-btn.cancel {
        background: var(--bg-tertiary);
        color: var(--text-primary);
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
    new ScreenTimeSettings();
});