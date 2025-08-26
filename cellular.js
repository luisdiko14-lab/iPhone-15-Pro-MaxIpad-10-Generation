// Cellular Data Settings JavaScript
class CellularSettings {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadCellularState();
    }

    initializeElements() {
        this.cellularDataToggle = document.getElementById('cellularDataToggle');
        this.dataRoamingToggle = document.getElementById('dataRoamingToggle');
        this.currentDataUsage = 2.3; // GB
    }

    setupEventListeners() {
        // Monitor data usage updates
        this.startDataMonitoring();
    }

    loadCellularState() {
        const cellularEnabled = localStorage.getItem('cellularData') !== 'false';
        const dataRoamingEnabled = localStorage.getItem('dataRoaming') === 'true';

        if (!cellularEnabled) {
            this.cellularDataToggle.classList.remove('active');
            this.disableCellularFeatures();
        }

        if (dataRoamingEnabled) {
            this.dataRoamingToggle.classList.add('active');
        }
    }

    disableCellularFeatures() {
        const appRows = document.querySelectorAll('.app-data-row');
        appRows.forEach(row => {
            row.style.opacity = '0.5';
            row.style.pointerEvents = 'none';
        });
    }

    enableCellularFeatures() {
        const appRows = document.querySelectorAll('.app-data-row');
        appRows.forEach(row => {
            row.style.opacity = '1';
            row.style.pointerEvents = 'auto';
        });
    }

    startDataMonitoring() {
        // Simulate data usage updates
        setInterval(() => {
            this.updateDataUsage();
        }, 30000); // Update every 30 seconds
    }

    updateDataUsage() {
        // Simulate small data usage increments
        const increment = Math.random() * 0.01; // 0-10 MB
        this.currentDataUsage += increment;
        
        const dataElement = document.querySelector('[onclick="showDataUsage()"] .setting-value');
        if (dataElement) {
            dataElement.textContent = `${this.currentDataUsage.toFixed(1)} GB`;
        }
    }

    showPersonalHotspotModal() {
        const currentHotspotName = localStorage.getItem('hotspotName') || 'iPhone';
        const currentPassword = localStorage.getItem('hotspotPassword') || 'IPhone';
        const isHotspotEnabled = localStorage.getItem('hotspotEnabled') === 'true';

        const modal = document.createElement('div');
        modal.className = 'hotspot-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Personal Hotspot</h3>
                    <p>Share your cellular connection with other devices</p>
                </div>
                <div class="hotspot-toggle-section">
                    <div class="hotspot-main-toggle">
                        <span>Personal Hotspot</span>
                        <div class="toggle-switch ${isHotspotEnabled ? 'active' : ''}" id="hotspotMainToggle">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>
                <div class="hotspot-settings" id="hotspotSettings" style="display: ${isHotspotEnabled ? 'block' : 'none'};">
                    <div class="hotspot-info">
                        <div class="info-text">To connect using Wi-Fi</div>
                        <div class="network-info">
                            <div class="network-item">
                                <span class="network-label">Network Name:</span>
                                <span class="network-value" id="displayHotspotName">${currentHotspotName}</span>
                            </div>
                            <div class="network-item">
                                <span class="network-label">Password:</span>
                                <span class="network-value" id="displayPassword">${currentPassword}</span>
                            </div>
                        </div>
                    </div>
                    <div class="hotspot-options">
                        <div class="hotspot-setting" onclick="editHotspotName()">
                            <span>Wi-Fi Password</span>
                            <span class="setting-value">${currentPassword}</span>
                            <span class="chevron">›</span>
                        </div>
                        <div class="hotspot-setting" onclick="editNetworkName()">
                            <span>Network Name</span>
                            <span class="setting-value">${currentHotspotName}</span>
                            <span class="chevron">›</span>
                        </div>
                    </div>
                    <div class="connected-devices">
                        <div class="devices-header">Connected Devices</div>
                        <div class="devices-list" id="connectedDevices">
                            <div class="no-devices">No devices connected</div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="this.closest('.hotspot-modal').remove()">Done</button>
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

        // Add toggle functionality
        const hotspotToggle = modal.querySelector('#hotspotMainToggle');
        const hotspotSettings = modal.querySelector('#hotspotSettings');

        hotspotToggle.addEventListener('click', () => {
            const isActive = hotspotToggle.classList.contains('active');
            
            if (isActive) {
                hotspotToggle.classList.remove('active');
                hotspotSettings.style.display = 'none';
                localStorage.setItem('hotspotEnabled', 'false');
                this.updatePersonalHotspotStatus('Off');
                this.removeFromWiFiNetworks();
                this.showNotification('Personal Hotspot disabled', 'warning');
            } else {
                hotspotToggle.classList.add('active');
                hotspotSettings.style.display = 'block';
                localStorage.setItem('hotspotEnabled', 'true');
                this.updatePersonalHotspotStatus('On');
                this.addToWiFiNetworks();
                this.showNotification('Personal Hotspot enabled', 'success');
            }
            
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        });

        // Remove on tap outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    updatePersonalHotspotStatus(status) {
        const hotspotRow = document.querySelector('[onclick="showPersonalHotspot()"] .setting-value');
        if (hotspotRow) {
            hotspotRow.textContent = status;
        }
    }

    addToWiFiNetworks() {
        const hotspotName = localStorage.getItem('hotspotName') || 'iPhone';
        const hotspotData = {
            name: hotspotName,
            type: 'hotspot',
            password: localStorage.getItem('hotspotPassword') || 'IPhone',
            connected: false,
            strength: '📶📶📶',
            isPersonalHotspot: true
        };
        
        // Store in localStorage so Wi-Fi page can access it
        let wifiNetworks = JSON.parse(localStorage.getItem('availableWiFiNetworks') || '[]');
        
        // Remove any existing hotspot entry
        wifiNetworks = wifiNetworks.filter(network => !network.isPersonalHotspot);
        
        // Add the new hotspot
        wifiNetworks.unshift(hotspotData);
        
        localStorage.setItem('availableWiFiNetworks', JSON.stringify(wifiNetworks));
        console.log(`Added "${hotspotName}" to available Wi-Fi networks`);
    }

    removeFromWiFiNetworks() {
        let wifiNetworks = JSON.parse(localStorage.getItem('availableWiFiNetworks') || '[]');
        wifiNetworks = wifiNetworks.filter(network => !network.isPersonalHotspot);
        localStorage.setItem('availableWiFiNetworks', JSON.stringify(wifiNetworks));
        console.log('Removed Personal Hotspot from available Wi-Fi networks');
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

function toggleCellularData() {
    const toggle = document.getElementById('cellularDataToggle');
    const isActive = toggle.classList.contains('active');
    
    if (isActive) {
        toggle.classList.remove('active');
        localStorage.setItem('cellularData', 'false');
        window.cellularSettings.disableCellularFeatures();
        window.cellularSettings.showNotification('Cellular Data disabled', 'warning');
    } else {
        toggle.classList.add('active');
        localStorage.setItem('cellularData', 'true');
        window.cellularSettings.enableCellularFeatures();
        window.cellularSettings.showNotification('Cellular Data enabled', 'success');
    }
    
    console.log(`Cellular Data ${isActive ? 'disabled' : 'enabled'}`);
}

function toggleDataRoaming() {
    const toggle = document.getElementById('dataRoamingToggle');
    const isActive = toggle.classList.contains('active');
    
    if (isActive) {
        toggle.classList.remove('active');
        localStorage.setItem('dataRoaming', 'false');
        window.cellularSettings.showNotification('Data Roaming disabled', 'warning');
    } else {
        toggle.classList.add('active');
        localStorage.setItem('dataRoaming', 'true');
        window.cellularSettings.showNotification('Data Roaming enabled - charges may apply', 'warning');
    }
    
    console.log(`Data Roaming ${isActive ? 'disabled' : 'enabled'}`);
}

function showCellularOptions() {
    console.log('Opening Cellular Data Options');
    window.cellularSettings.showNotification('Cellular Data Options', 'info');
}

function showDataUsage() {
    console.log('Opening Data Usage details');
    window.cellularSettings.showNotification(`Current usage: ${window.cellularSettings.currentDataUsage.toFixed(1)} GB`, 'info');
}

function showDataRoaming() {
    toggleDataRoaming();
}

function showPersonalHotspot() {
    console.log('Opening Personal Hotspot settings');
    
    // Directly call the modal function
    if (window.cellularSettings && window.cellularSettings.showPersonalHotspotModal) {
        window.cellularSettings.showPersonalHotspotModal();
    } else {
        // Fallback: create the modal directly
        showPersonalHotspotDirectly();
    }
}

function showPersonalHotspotDirectly() {
    const currentHotspotName = localStorage.getItem('hotspotName') || 'iPhone';
    const currentPassword = localStorage.getItem('hotspotPassword') || 'IPhone';
    const isHotspotEnabled = localStorage.getItem('hotspotEnabled') === 'true';

    const modal = document.createElement('div');
    modal.className = 'hotspot-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Personal Hotspot</h3>
                <p>Share your cellular connection with other devices</p>
            </div>
            <div class="hotspot-toggle-section">
                <div class="hotspot-main-toggle">
                    <span>Personal Hotspot</span>
                    <div class="toggle-switch ${isHotspotEnabled ? 'active' : ''}" id="hotspotMainToggle">
                        <div class="toggle-slider"></div>
                    </div>
                </div>
            </div>
            <div class="hotspot-settings" id="hotspotSettings" style="display: ${isHotspotEnabled ? 'block' : 'none'};">
                <div class="hotspot-info">
                    <div class="info-text">To connect using Wi-Fi</div>
                    <div class="network-info">
                        <div class="network-item">
                            <span class="network-label">Network Name:</span>
                            <span class="network-value" id="displayHotspotName">${currentHotspotName}</span>
                        </div>
                        <div class="network-item">
                            <span class="network-label">Password:</span>
                            <span class="network-value" id="displayPassword">${currentPassword}</span>
                        </div>
                    </div>
                </div>
                <div class="hotspot-options">
                    <div class="hotspot-setting" onclick="editHotspotName()">
                        <span>Wi-Fi Password</span>
                        <span class="setting-value">${currentPassword}</span>
                        <span class="chevron">›</span>
                    </div>
                    <div class="hotspot-setting" onclick="editNetworkName()">
                        <span>Network Name</span>
                        <span class="setting-value">${currentHotspotName}</span>
                        <span class="chevron">›</span>
                    </div>
                </div>
                <div class="connected-devices">
                    <div class="devices-header">Connected Devices</div>
                    <div class="devices-list" id="connectedDevices">
                        <div class="no-devices">No devices connected</div>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn" onclick="this.closest('.hotspot-modal').remove()">Done</button>
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

    // Add toggle functionality
    const hotspotToggle = modal.querySelector('#hotspotMainToggle');
    const hotspotSettings = modal.querySelector('#hotspotSettings');

    hotspotToggle.addEventListener('click', () => {
        const isActive = hotspotToggle.classList.contains('active');
        
        if (isActive) {
            hotspotToggle.classList.remove('active');
            hotspotSettings.style.display = 'none';
            localStorage.setItem('hotspotEnabled', 'false');
            updatePersonalHotspotStatus('Off');
            removeFromWiFiNetworks();
            showNotificationDirect('Personal Hotspot disabled', 'warning');
        } else {
            hotspotToggle.classList.add('active');
            hotspotSettings.style.display = 'block';
            localStorage.setItem('hotspotEnabled', 'true');
            updatePersonalHotspotStatus('On');
            addToWiFiNetworks();
            showNotificationDirect('Personal Hotspot enabled', 'success');
        }
        
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    });

    // Remove on tap outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function updatePersonalHotspotStatus(status) {
    const hotspotRow = document.querySelector('[onclick="showPersonalHotspot()"] .setting-value');
    if (hotspotRow) {
        hotspotRow.textContent = status;
    }
}

function addToWiFiNetworks() {
    const hotspotName = localStorage.getItem('hotspotName') || 'iPhone';
    const hotspotData = {
        name: hotspotName,
        type: 'hotspot',
        password: localStorage.getItem('hotspotPassword') || 'IPhone',
        connected: false,
        strength: '📶📶📶',
        isPersonalHotspot: true
    };
    
    let wifiNetworks = JSON.parse(localStorage.getItem('availableWiFiNetworks') || '[]');
    wifiNetworks = wifiNetworks.filter(network => !network.isPersonalHotspot);
    wifiNetworks.unshift(hotspotData);
    localStorage.setItem('availableWiFiNetworks', JSON.stringify(wifiNetworks));
    console.log(`Added "${hotspotName}" to available Wi-Fi networks`);
}

function removeFromWiFiNetworks() {
    let wifiNetworks = JSON.parse(localStorage.getItem('availableWiFiNetworks') || '[]');
    wifiNetworks = wifiNetworks.filter(network => !network.isPersonalHotspot);
    localStorage.setItem('availableWiFiNetworks', JSON.stringify(wifiNetworks));
    console.log('Removed Personal Hotspot from available Wi-Fi networks');
}

function showNotificationDirect(message, type = 'info') {
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

function showSystemServices() {
    console.log('Opening System Services data usage');
    window.cellularSettings.showNotification('System Services: 124 MB', 'info');
}

// Global functions for hotspot editing
function editHotspotName() {
    const currentPassword = localStorage.getItem('hotspotPassword') || 'IPhone';
    showPasswordEditor(currentPassword);
}

function editNetworkName() {
    const currentName = localStorage.getItem('hotspotName') || 'iPhone';
    showNameEditor(currentName);
}

function showPasswordEditor(currentPassword) {
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Wi-Fi Password</h3>
                <p>Enter a password with at least 8 characters</p>
            </div>
            <div class="input-section">
                <input type="text" id="passwordInput" value="${currentPassword}" placeholder="Enter password" maxlength="63">
                <div class="input-info">Password must be at least 8 characters long</div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn cancel" onclick="this.closest('.edit-modal').remove()">Cancel</button>
                <button class="modal-btn save" onclick="savePassword()">Save</button>
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
    
    const input = modal.querySelector('#passwordInput');
    input.focus();
    input.select();
}

function showNameEditor(currentName) {
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Network Name</h3>
                <p>Choose a name for your Personal Hotspot</p>
            </div>
            <div class="input-section">
                <input type="text" id="nameInput" value="${currentName}" placeholder="Enter network name" maxlength="32">
                <div class="input-info">This name will be visible to other devices</div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn cancel" onclick="this.closest('.edit-modal').remove()">Cancel</button>
                <button class="modal-btn save" onclick="saveName()">Save</button>
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
    
    const input = modal.querySelector('#nameInput');
    input.focus();
    input.select();
}

function savePassword() {
    const input = document.getElementById('passwordInput');
    const newPassword = input.value.trim();
    
    if (newPassword.length < 8) {
        window.cellularSettings.showNotification('Password must be at least 8 characters', 'warning');
        return;
    }
    
    localStorage.setItem('hotspotPassword', newPassword);
    
    // Update all displays
    const displayElements = document.querySelectorAll('#displayPassword, [onclick="editHotspotName()"] .setting-value');
    displayElements.forEach(el => {
        if (el) el.textContent = newPassword;
    });
    
    // Update Wi-Fi networks if hotspot is enabled
    if (localStorage.getItem('hotspotEnabled') === 'true') {
        window.cellularSettings.addToWiFiNetworks();
    }
    
    document.querySelector('.edit-modal').remove();
    window.cellularSettings.showNotification('Wi-Fi password updated', 'success');
}

function saveName() {
    const input = document.getElementById('nameInput');
    const newName = input.value.trim();
    
    if (newName.length === 0) {
        window.cellularSettings.showNotification('Network name cannot be empty', 'warning');
        return;
    }
    
    localStorage.setItem('hotspotName', newName);
    
    // Update all displays
    const displayElements = document.querySelectorAll('#displayHotspotName, [onclick="editNetworkName()"] .setting-value');
    displayElements.forEach(el => {
        if (el) el.textContent = newName;
    });
    
    // Update Wi-Fi networks if hotspot is enabled
    if (localStorage.getItem('hotspotEnabled') === 'true') {
        window.cellularSettings.addToWiFiNetworks();
    }
    
    document.querySelector('.edit-modal').remove();
    window.cellularSettings.showNotification('Network name updated', 'success');
}

// Add CSS styles for the modals
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

    .hotspot-main-toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        font-size: 17px;
        color: var(--text-primary);
        border-bottom: 0.5px solid var(--border-color);
        margin-bottom: 16px;
    }

    .hotspot-info {
        margin-bottom: 20px;
    }

    .info-text {
        font-size: 15px;
        color: var(--text-secondary);
        margin-bottom: 12px;
    }

    .network-info {
        background: var(--bg-tertiary);
        border-radius: 8px;
        padding: 12px;
    }

    .network-item {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        font-size: 15px;
    }

    .network-label {
        color: var(--text-secondary);
    }

    .network-value {
        color: var(--text-primary);
        font-weight: 500;
    }

    .hotspot-options {
        margin-bottom: 20px;
    }

    .hotspot-setting {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 0.5px solid var(--border-color);
        cursor: pointer;
        font-size: 17px;
        color: var(--text-primary);
    }

    .hotspot-setting span:first-child {
        flex: 1;
    }

    .hotspot-setting .setting-value {
        color: var(--text-secondary);
        margin-right: 8px;
    }

    .chevron {
        color: var(--text-secondary);
    }

    .connected-devices {
        border-top: 0.5px solid var(--border-color);
        padding-top: 16px;
    }

    .devices-header {
        font-size: 15px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
    }

    .no-devices {
        font-size: 15px;
        color: var(--text-secondary);
        text-align: center;
        padding: 20px 0;
    }

    .input-section {
        margin-bottom: 20px;
    }

    .input-section input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-tertiary);
        color: var(--text-primary);
        font-size: 17px;
        box-sizing: border-box;
    }

    .input-section input:focus {
        outline: none;
        border-color: var(--accent-blue);
    }

    .input-info {
        font-size: 13px;
        color: var(--text-secondary);
        margin-top: 8px;
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
    window.cellularSettings = new CellularSettings();
});