// Bluetooth Settings JavaScript
class BluetoothSettings {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadBluetoothState();
        this.startScanning();
    }

    initializeElements() {
        this.bluetoothToggle = document.getElementById('bluetoothToggle');
        this.scanningSection = document.querySelector('.scanning');
        this.devices = [
            { name: 'DUALSHOCK 4 Wireless Controller', status: 'Not Connected', type: 'controller' },
            { name: 'JBL Flip 3 SE', status: 'Not Connected', type: 'speaker' },
            { name: 'MB Bluetooth', status: 'Not Connected', type: 'generic' }
        ];
    }

    setupEventListeners() {
        // Device discovery simulation
        this.scanningInterval = null;
    }

    loadBluetoothState() {
        const bluetoothEnabled = localStorage.getItem('bluetoothEnabled') !== 'false';
        if (!bluetoothEnabled) {
            this.bluetoothToggle.classList.remove('active');
            this.disableBluetoothFeatures();
        }
    }

    disableBluetoothFeatures() {
        const deviceRows = document.querySelectorAll('.device-row');
        deviceRows.forEach(row => {
            row.style.opacity = '0.5';
            row.style.pointerEvents = 'none';
        });
        this.stopScanning();
    }

    enableBluetoothFeatures() {
        const deviceRows = document.querySelectorAll('.device-row');
        deviceRows.forEach(row => {
            row.style.opacity = '1';
            row.style.pointerEvents = 'auto';
        });
        this.startScanning();
    }

    startScanning() {
        if (!this.bluetoothToggle.classList.contains('active')) return;
        
        // Simulate discovering devices
        setTimeout(() => {
            this.addDiscoveredDevice('AirPods Pro', 'Available');
        }, 3000);
        
        setTimeout(() => {
            this.addDiscoveredDevice('Samsung Galaxy Buds', 'Available');
        }, 6000);
    }

    stopScanning() {
        const scanningText = document.querySelector('.scanning-text');
        if (scanningText) {
            scanningText.textContent = 'Bluetooth is off';
        }
    }

    addDiscoveredDevice(name, status) {
        const otherDevicesSection = document.querySelector('.scanning');
        
        // Remove "Looking for devices..." text
        const scanningText = document.querySelector('.scanning-text');
        if (scanningText && scanningText.textContent === 'Looking for devices...') {
            scanningText.remove();
        }
        
        // Add new device
        const deviceRow = document.createElement('div');
        deviceRow.className = 'device-row';
        deviceRow.onclick = () => connectToDevice(name);
        deviceRow.innerHTML = `
            <div class="device-info">
                <div class="device-name">${name}</div>
                <div class="device-status">${status}</div>
            </div>
            <div class="device-icons">
                <span class="info-icon">🛈</span>
            </div>
        `;
        
        otherDevicesSection.appendChild(deviceRow);
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

function toggleBluetooth() {
    const toggle = document.getElementById('bluetoothToggle');
    const isActive = toggle.classList.contains('active');
    
    if (isActive) {
        toggle.classList.remove('active');
        localStorage.setItem('bluetoothEnabled', 'false');
        window.bluetoothSettings.disableBluetoothFeatures();
    } else {
        toggle.classList.add('active');
        localStorage.setItem('bluetoothEnabled', 'true');
        window.bluetoothSettings.enableBluetoothFeatures();
    }
    
    console.log(`Bluetooth ${isActive ? 'disabled' : 'enabled'}`);
}

function showDeviceDetails(deviceName) {
    console.log(`Showing details for ${deviceName}`);
    
    // Create device options modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${deviceName}</h3>
                <p>Device options</p>
            </div>
            <div class="modal-actions">
                <button class="modal-btn cancel" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="modal-btn connect" onclick="connectToDevice('${deviceName}')">Connect</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function connectToDevice(deviceName) {
    // Remove any existing modals
    document.querySelectorAll('.modal').forEach(modal => modal.remove());
    
    console.log(`Connecting to ${deviceName}`);
    
    // Show connecting animation
    const connectingDiv = document.createElement('div');
    connectingDiv.className = 'connecting-message';
    connectingDiv.innerHTML = `
        <div class="connecting-content">
            <div class="spinner"></div>
            <span>Connecting to ${deviceName}...</span>
        </div>
    `;
    connectingDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--bg-secondary);
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--text-primary);
    `;
    
    document.body.appendChild(connectingDiv);
    
    setTimeout(() => {
        connectingDiv.remove();
        updateDeviceStatus(deviceName, 'Connected');
        console.log(`Connected to ${deviceName}`);
    }, 2000);
}

function updateDeviceStatus(deviceName, status) {
    const deviceRows = document.querySelectorAll('.device-row');
    deviceRows.forEach(row => {
        const nameElement = row.querySelector('.device-name');
        if (nameElement && nameElement.textContent === deviceName) {
            const statusElement = row.querySelector('.device-status');
            statusElement.textContent = status;
            if (status === 'Connected') {
                statusElement.style.color = 'var(--success-green)';
            }
        }
    });
    
    // Update home page Bluetooth status
    if (status === 'Connected') {
        localStorage.setItem('bluetoothConnected', deviceName);
    }
}

function showControlCentreInfo() {
    console.log('Showing Control Centre Bluetooth info');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bluetoothSettings = new BluetoothSettings();
});