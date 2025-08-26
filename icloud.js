// iCloud Settings JavaScript
class iCloudSettings {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
        this.updateStorageDisplay();
    }

    initializeElements() {
        this.toggles = document.querySelectorAll('.toggle-switch');
        this.settingRows = document.querySelectorAll('.setting-row');
        this.storageFill = document.querySelector('.storage-fill');
        this.storageUsed = document.querySelector('.storage-used');
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

        // Add click handler to storage info
        const storageInfo = document.querySelector('.icloud-storage');
        if (storageInfo) {
            storageInfo.addEventListener('click', () => this.showStorageDetails());
        }
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

        // Show sync notification for certain services
        if (['Photos', 'Contacts', 'Calendars', 'Reminders'].includes(label)) {
            this.showSyncNotification(label, toggle.classList.contains('active'));
        }

        this.showNotification(`iCloud ${label} ${toggle.classList.contains('active') ? 'enabled' : 'disabled'}`);
    }

    showStorageDetails() {
        const modal = document.createElement('div');
        modal.className = 'icloud-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>iCloud Storage</h3>
                    <div class="storage-summary">
                        <div class="storage-visual">
                            <div class="storage-circle">
                                <div class="circle-progress" style="--progress: 46;"></div>
                                <div class="circle-center">
                                    <div class="usage-text">2.3 GB</div>
                                    <div class="total-text">of 5 GB</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="storage-breakdown">
                    <div class="breakdown-item">
                        <div class="breakdown-color photos"></div>
                        <span class="breakdown-label">Photos</span>
                        <span class="breakdown-size">1.2 GB</span>
                    </div>
                    <div class="breakdown-item">
                        <div class="breakdown-color mail"></div>
                        <span class="breakdown-label">Mail</span>
                        <span class="breakdown-size">0.8 GB</span>
                    </div>
                    <div class="breakdown-item">
                        <div class="breakdown-color backup"></div>
                        <span class="breakdown-label">Backup</span>
                        <span class="breakdown-size">0.2 GB</span>
                    </div>
                    <div class="breakdown-item">
                        <div class="breakdown-color other"></div>
                        <span class="breakdown-label">Other</span>
                        <span class="breakdown-size">0.1 GB</span>
                    </div>
                </div>
                <div class="storage-actions">
                    <button class="storage-btn">Manage Storage</button>
                    <button class="storage-btn upgrade">Upgrade to iCloud+</button>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="this.closest('.icloud-modal').remove()">Done</button>
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

        // Add event listeners for buttons
        modal.querySelector('.storage-btn').addEventListener('click', () => {
            this.showNotification('Opening storage management...');
            modal.remove();
        });

        modal.querySelector('.upgrade').addEventListener('click', () => {
            this.showUpgradeOptions();
            modal.remove();
        });

        // Remove on tap outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showUpgradeOptions() {
        const modal = document.createElement('div');
        modal.className = 'upgrade-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>iCloud+ Plans</h3>
                    <p>Get more storage and premium features</p>
                </div>
                <div class="plans-container">
                    <div class="plan-item">
                        <div class="plan-storage">50 GB</div>
                        <div class="plan-price">$0.99/month</div>
                        <div class="plan-features">
                            <div>✓ 50 GB storage</div>
                            <div>✓ Private Relay</div>
                            <div>✓ Hide My Email</div>
                        </div>
                    </div>
                    <div class="plan-item popular">
                        <div class="plan-badge">Most Popular</div>
                        <div class="plan-storage">200 GB</div>
                        <div class="plan-price">$2.99/month</div>
                        <div class="plan-features">
                            <div>✓ 200 GB storage</div>
                            <div>✓ Private Relay</div>
                            <div>✓ Hide My Email</div>
                            <div>✓ Custom email domains</div>
                        </div>
                    </div>
                    <div class="plan-item">
                        <div class="plan-storage">2 TB</div>
                        <div class="plan-price">$9.99/month</div>
                        <div class="plan-features">
                            <div>✓ 2 TB storage</div>
                            <div>✓ All features</div>
                            <div>✓ HomeKit Secure Video</div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn cancel" onclick="this.closest('.upgrade-modal').remove()">Not Now</button>
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

        // Add click handlers for plans
        modal.querySelectorAll('.plan-item').forEach(plan => {
            plan.addEventListener('click', () => {
                const storage = plan.querySelector('.plan-storage').textContent;
                this.showNotification(`Selected ${storage} plan`);
                modal.remove();
            });
        });

        // Remove on tap outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showSyncNotification(service, isEnabled) {
        if (isEnabled) {
            const notification = document.createElement('div');
            notification.className = 'sync-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <div class="sync-icon">☁️</div>
                    <div class="notification-text">
                        <div class="notification-title">Syncing ${service}</div>
                        <div class="notification-subtitle">Your ${service.toLowerCase()} are being synced to iCloud</div>
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

    updateStorageDisplay() {
        // Simulate storage usage update
        const usedGB = 2.3 + (Math.random() * 0.2 - 0.1); // Slight variation
        const totalGB = 5.0;
        const percentage = (usedGB / totalGB) * 100;

        if (this.storageUsed) {
            this.storageUsed.textContent = `${usedGB.toFixed(1)} GB of ${totalGB} GB Used`;
        }

        if (this.storageFill) {
            this.storageFill.style.width = `${percentage}%`;
        }
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
        
        localStorage.setItem(`icloud_${label.replace(/\s+/g, '_').toLowerCase()}`, isActive);
        console.log(`iCloud ${label}: ${isActive ? 'enabled' : 'disabled'}`);
    }

    loadSettings() {
        this.settingRows.forEach(row => {
            const toggle = row.querySelector('.toggle-switch');
            if (toggle) {
                const label = row.querySelector('.setting-label').textContent;
                const saved = localStorage.getItem(`icloud_${label.replace(/\s+/g, '_').toLowerCase()}`);
                
                if (saved === 'true' || (saved === null && toggle.classList.contains('active'))) {
                    toggle.classList.add('active');
                }
            }
        });
    }
}

// Add CSS styles
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
        max-width: 350px;
        width: 100%;
        animation: modalSlideIn 0.3s ease-out;
    }

    .storage-visual {
        display: flex;
        justify-content: center;
        margin: 20px 0;
    }

    .storage-circle {
        position: relative;
        width: 120px;
        height: 120px;
    }

    .circle-progress {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: conic-gradient(var(--accent-blue) 0deg, var(--accent-blue) calc(var(--progress) * 3.6deg), var(--bg-tertiary) calc(var(--progress) * 3.6deg), var(--bg-tertiary) 360deg);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .circle-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
    }

    .usage-text {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .total-text {
        font-size: 12px;
        color: var(--text-secondary);
    }

    .storage-breakdown {
        margin-bottom: 20px;
    }

    .breakdown-item {
        display: flex;
        align-items: center;
        padding: 8px 0;
        gap: 12px;
    }

    .breakdown-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
    }

    .breakdown-color.photos { background: #007aff; }
    .breakdown-color.mail { background: #ff9500; }
    .breakdown-color.backup { background: #30d158; }
    .breakdown-color.other { background: #8e8e93; }

    .breakdown-label {
        flex: 1;
        font-size: 16px;
        color: var(--text-primary);
    }

    .breakdown-size {
        font-size: 16px;
        color: var(--text-secondary);
    }

    .storage-actions {
        margin-bottom: 20px;
    }

    .storage-btn {
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

    .storage-btn.upgrade {
        background: var(--success-green);
    }

    .plans-container {
        margin-bottom: 20px;
    }

    .plan-item {
        border: 2px solid var(--border-color);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
    }

    .plan-item:hover {
        border-color: var(--accent-blue);
    }

    .plan-item.popular {
        border-color: var(--accent-blue);
        background: rgba(0, 122, 255, 0.1);
    }

    .plan-badge {
        position: absolute;
        top: -8px;
        left: 16px;
        background: var(--accent-blue);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
    }

    .plan-storage {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
    }

    .plan-price {
        font-size: 16px;
        color: var(--text-secondary);
        margin-bottom: 12px;
    }

    .plan-features div {
        font-size: 14px;
        color: var(--text-primary);
        margin-bottom: 4px;
    }

    .sync-notification .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .sync-icon {
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
    new iCloudSettings();
});