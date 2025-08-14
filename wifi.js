// Wi-Fi Settings JavaScript
class WiFiSettings {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadWiFiState();
    }

    initializeElements() {
        this.wifiToggle = document.getElementById('wifiToggle');
        this.editBtn = document.getElementById('editBtn');
        this.passwordModal = document.getElementById('passwordModal');
        this.passwordInput = document.getElementById('networkPassword');
        this.modalNetworkName = document.getElementById('modalNetworkName');
        this.currentNetwork = 'Free WiFi';
        this.selectedNetwork = '';
    }

    setupEventListeners() {
        // Add click handlers for all interactive elements
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal') && !e.target.closest('.modal-content')) {
                this.closeModal();
            }
        });

        // Password input enter key
        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.connectWithPassword();
            }
        });
    }

    loadWiFiState() {
        const wifiEnabled = localStorage.getItem('wifiEnabled') !== 'false';
        if (!wifiEnabled) {
            this.wifiToggle.classList.remove('active');
            this.disableWiFiFeatures();
        }
    }

    disableWiFiFeatures() {
        const networkRows = document.querySelectorAll('.network-row');
        networkRows.forEach(row => {
            row.style.opacity = '0.5';
            row.style.pointerEvents = 'none';
        });
    }

    enableWiFiFeatures() {
        const networkRows = document.querySelectorAll('.network-row');
        networkRows.forEach(row => {
            row.style.opacity = '1';
            row.style.pointerEvents = 'auto';
        });
    }
}

// Global functions for onclick handlers
function navigateBack() {
    const container = document.querySelector('.ios-container');
    container.style.opacity = '0.8';
    container.style.transform = 'translateX(20px)';
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 150);
}

function toggleWiFi() {
    const toggle = document.getElementById('wifiToggle');
    const isActive = toggle.classList.contains('active');
    
    if (isActive) {
        toggle.classList.remove('active');
        localStorage.setItem('wifiEnabled', 'false');
        document.querySelector('.wifi-settings').disableWiFiFeatures();
    } else {
        toggle.classList.add('active');
        localStorage.setItem('wifiEnabled', 'true');
        document.querySelector('.wifi-settings').enableWiFiFeatures();
    }
    
    console.log(`Wi-Fi ${isActive ? 'disabled' : 'enabled'}`);
}

function connectToNetwork(networkName) {
    const wifiEnabled = document.getElementById('wifiToggle').classList.contains('active');
    if (!wifiEnabled) return;
    
    document.getElementById('selectedNetwork').textContent = networkName;
    document.getElementById('modalNetworkName').textContent = networkName;
    document.getElementById('passwordModal').style.display = 'flex';
    document.getElementById('networkPassword').focus();
    
    setTimeout(() => {
        document.getElementById('passwordModal').style.opacity = '1';
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('passwordModal');
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
        document.getElementById('networkPassword').value = '';
    }, 200);
}

function connectWithPassword() {
    const password = document.getElementById('networkPassword').value;
    const networkName = document.getElementById('modalNetworkName').textContent;
    
    if (!password.trim()) {
        alert('Please enter a password');
        return;
    }
    
    // Simulate connection
    closeModal();
    
    // Show connecting animation
    const connectingDiv = document.createElement('div');
    connectingDiv.className = 'connecting-message';
    connectingDiv.innerHTML = `
        <div class="connecting-content">
            <div class="spinner"></div>
            <span>Connecting to ${networkName}...</span>
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
    `;
    
    document.body.appendChild(connectingDiv);
    
    setTimeout(() => {
        connectingDiv.remove();
        updateCurrentNetwork(networkName);
        console.log(`Connected to ${networkName}`);
    }, 2000);
}

function updateCurrentNetwork(networkName) {
    // Update the connected network display
    const currentNetworkRow = document.querySelector('.current-network .network-row');
    if (currentNetworkRow) {
        currentNetworkRow.querySelector('.network-name').textContent = `✓ ${networkName}`;
    }
    
    // Update home page WiFi status
    localStorage.setItem('currentWiFi', networkName);
}

function togglePasswordVisibility() {
    const input = document.getElementById('networkPassword');
    const toggle = document.querySelector('.password-toggle');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = 'Hide';
    } else {
        input.type = 'password';
        toggle.textContent = 'Show';
    }
}

function showNetworkDetails(networkName) {
    console.log(`Showing details for ${networkName}`);
    // Would show network details page
}

function showOtherNetworks() {
    console.log('Showing other networks');
    // Would show manual network entry
}

function showNetworkNotifications() {
    console.log('Showing network notifications settings');
    // Would navigate to notifications settings
}

function showHotspotSettings() {
    console.log('Showing hotspot settings');
    // Would navigate to hotspot settings
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.wifiSettings = new WiFiSettings();
});