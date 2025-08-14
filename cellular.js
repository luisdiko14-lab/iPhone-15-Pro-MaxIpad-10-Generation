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
    window.cellularSettings.showNotification('Personal Hotspot settings', 'info');
}

function showSystemServices() {
    console.log('Opening System Services data usage');
    window.cellularSettings.showNotification('System Services: 124 MB', 'info');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cellularSettings = new CellularSettings();
});