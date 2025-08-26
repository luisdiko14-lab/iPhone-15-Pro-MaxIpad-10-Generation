// Apps Settings JavaScript
class AppsSettings {
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

        console.log(`Opening app settings for: ${label}`);
        
        // Add haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }

        this.showAppSettings(label);
    }

    showAppSettings(appName) {
        const appSettings = this.getAppSettingsData(appName);
        
        const modal = document.createElement('div');
        modal.className = 'app-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="app-header">
                        <div class="app-icon">${appSettings.icon}</div>
                        <div class="app-info">
                            <h3>${appName}</h3>
                            <p>Version ${appSettings.version}</p>
                        </div>
                    </div>
                </div>
                <div class="app-settings">
                    ${appSettings.settings.map(setting => `
                        <div class="app-setting">
                            <span class="setting-name">${setting.name}</span>
                            ${setting.type === 'toggle' ? `
                                <div class="toggle-switch ${setting.value ? 'active' : ''}">
                                    <div class="toggle-slider"></div>
                                </div>
                            ` : `
                                <span class="setting-value">${setting.value}</span>
                            `}
                        </div>
                    `).join('')}
                </div>
                <div class="app-storage">
                    <div class="storage-title">Storage</div>
                    <div class="storage-info">
                        <span>App Size</span>
                        <span>${appSettings.size}</span>
                    </div>
                    <div class="storage-info">
                        <span>Documents & Data</span>
                        <span>${appSettings.documents}</span>
                    </div>
                </div>
                <div class="app-actions">
                    <button class="app-btn offload">Offload App</button>
                    <button class="app-btn delete">Delete App</button>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="this.closest('.app-modal').remove()">Done</button>
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

        // Add event listeners for toggles
        modal.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                if (navigator.vibrate) {
                    navigator.vibrate(30);
                }
                
                const settingName = toggle.closest('.app-setting').querySelector('.setting-name').textContent;
                this.showNotification(`${appName} ${settingName} ${toggle.classList.contains('active') ? 'enabled' : 'disabled'}`);
            });
        });

        // Add event listeners for action buttons
        modal.querySelector('.offload').addEventListener('click', () => {
            this.showOffloadConfirmation(appName);
        });

        modal.querySelector('.delete').addEventListener('click', () => {
            this.showDeleteConfirmation(appName);
        });

        // Remove on tap outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    getAppSettingsData(appName) {
        const appData = {
            'App Store': {
                icon: '📱',
                version: '6.7.0',
                size: '25.4 MB',
                documents: '12.3 MB',
                settings: [
                    { name: 'Cellular Data', type: 'toggle', value: true },
                    { name: 'Background App Refresh', type: 'toggle', value: true },
                    { name: 'Notifications', type: 'value', value: 'Allow' },
                    { name: 'Location Services', type: 'value', value: 'While Using App' }
                ]
            },
            'Camera': {
                icon: '📷',
                version: '15.0.1',
                size: '8.2 MB',
                documents: '1.4 GB',
                settings: [
                    { name: 'Cellular Data', type: 'toggle', value: true },
                    { name: 'Background App Refresh', type: 'toggle', value: false },
                    { name: 'Camera Access', type: 'value', value: 'Allow' },
                    { name: 'Microphone', type: 'value', value: 'Allow' },
                    { name: 'Location Services', type: 'value', value: 'While Using App' }
                ]
            },
            'Mail': {
                icon: '✉️',
                version: '16.0.0',
                size: '15.6 MB',
                documents: '234 MB',
                settings: [
                    { name: 'Cellular Data', type: 'toggle', value: true },
                    { name: 'Background App Refresh', type: 'toggle', value: true },
                    { name: 'Notifications', type: 'value', value: 'Allow' },
                    { name: 'Contacts', type: 'value', value: 'Allow' }
                ]
            },
            'Settings': {
                icon: '⚙️',
                version: '1.0',
                size: '12.1 MB',
                documents: '5.2 MB',
                settings: [
                    { name: 'Cellular Data', type: 'toggle', value: true },
                    { name: 'Background App Refresh', type: 'toggle', value: false },
                    { name: 'Notifications', type: 'value', value: 'Allow' }
                ]
            }
        };

        // Default data for apps not specifically defined
        return appData[appName] || {
            icon: '📱',
            version: '1.0.0',
            size: '10.0 MB',
            documents: '5.0 MB',
            settings: [
                { name: 'Cellular Data', type: 'toggle', value: true },
                { name: 'Background App Refresh', type: 'toggle', value: true },
                { name: 'Notifications', type: 'value', value: 'Allow' }
            ]
        };
    }

    showOffloadConfirmation(appName) {
        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.innerHTML = `
            <div class="modal-content small">
                <div class="modal-header">
                    <h3>Offload "${appName}"?</h3>
                    <p>This will free up storage used by the app but keep its documents and data. The app will be reinstalled when you tap it.</p>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn cancel" onclick="this.closest('.confirmation-modal').remove()">Cancel</button>
                    <button class="modal-btn confirm" onclick="this.closest('.confirmation-modal').remove(); document.querySelector('.app-modal').remove();">Offload App</button>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1001;
            padding: 20px;
        `;

        document.body.appendChild(modal);

        modal.querySelector('.confirm').addEventListener('click', () => {
            this.showNotification(`${appName} has been offloaded`);
        });

        // Remove on tap outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showDeleteConfirmation(appName) {
        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.innerHTML = `
            <div class="modal-content small">
                <div class="modal-header">
                    <h3>Delete "${appName}"?</h3>
                    <p>This will also delete all of its data. This action cannot be undone.</p>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn cancel" onclick="this.closest('.confirmation-modal').remove()">Cancel</button>
                    <button class="modal-btn delete" onclick="this.closest('.confirmation-modal').remove(); document.querySelector('.app-modal').remove();">Delete App</button>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1001;
            padding: 20px;
        `;

        document.body.appendChild(modal);

        modal.querySelector('.delete').addEventListener('click', () => {
            this.showNotification(`${appName} has been deleted`);
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
        event.target.style.backgroundColor = 'var(--bg-tertiary)';
    }

    removeTouchFeedback(event) {
        event.target.style.backgroundColor = '';
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
        max-height: 80vh;
        overflow-y: auto;
    }

    .modal-content.small {
        max-width: 300px;
    }

    .app-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
    }

    .app-icon {
        font-size: 48px;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: var(--bg-tertiary);
    }

    .app-info h3 {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
    }

    .app-info p {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
    }

    .app-settings {
        margin-bottom: 20px;
    }

    .app-setting {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 0.5px solid var(--border-color);
    }

    .app-setting:last-child {
        border-bottom: none;
    }

    .setting-name {
        font-size: 17px;
        color: var(--text-primary);
    }

    .setting-value {
        font-size: 17px;
        color: var(--text-secondary);
    }

    .app-storage {
        margin-bottom: 20px;
        padding-top: 16px;
        border-top: 0.5px solid var(--border-color);
    }

    .storage-title {
        font-size: 15px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
    }

    .storage-info {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-size: 17px;
        color: var(--text-primary);
    }

    .storage-info span:last-child {
        color: var(--text-secondary);
    }

    .app-actions {
        margin-bottom: 20px;
    }

    .app-btn {
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

    .app-btn.delete {
        background: #ff3b30;
    }

    .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
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
        flex: 1;
    }

    .modal-btn.cancel {
        background: var(--bg-tertiary);
        color: var(--text-primary);
    }

    .modal-btn.confirm {
        background: var(--accent-blue);
    }

    .modal-btn.delete {
        background: #ff3b30;
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
    new AppsSettings();
});