// General Settings JavaScript
class GeneralSettings {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadGeneralState();
    }

    initializeElements() {
        this.aboutModal = document.getElementById('aboutModal');
    }

    setupEventListeners() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal') && !e.target.closest('.modal-content')) {
                this.closeAllModals();
            }
        });
    }

    loadGeneralState() {
        // Load any saved general settings
        const backgroundRefresh = localStorage.getItem('backgroundRefresh') !== 'false';
        this.updateBackgroundRefreshStatus(backgroundRefresh);
    }

    updateBackgroundRefreshStatus(enabled) {
        const bgRefreshRow = document.querySelector('[onclick="showBackgroundRefresh()"]');
        if (bgRefreshRow) {
            const valueElement = bgRefreshRow.querySelector('.setting-value');
            valueElement.textContent = enabled ? 'On' : 'Off';
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
            </div>
        `;
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
        }, 3000);
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

function showAbout() {
    const modal = document.getElementById('aboutModal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function closeAboutModal() {
    const modal = document.getElementById('aboutModal');
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 200);
}

function showSoftwareUpdate() {
    console.log('Checking for software updates...');
    window.generalSettings.showNotification('Checking for updates...', 'info');
    
    setTimeout(() => {
        window.generalSettings.showNotification('iPadOS 18.6 - Your software is up to date', 'success');
    }, 2000);
}

function showAirDropHandoff() {
    console.log('Opening AirDrop & Handoff settings');
    window.generalSettings.showNotification('AirDrop & Handoff settings', 'info');
}

function showPictureInPicture() {
    console.log('Opening Picture in Picture settings');
    window.generalSettings.showNotification('Picture in Picture settings', 'info');
}

function showCarPlay() {
    console.log('Opening CarPlay settings');
    window.generalSettings.showNotification('CarPlay settings', 'info');
}

function showAirPlay() {
    console.log('Opening AirPlay settings');
    window.generalSettings.showNotification('AirPlay settings', 'info');
}

function showKeyboard() {
    console.log('Opening Keyboard settings');
    window.generalSettings.showNotification('Keyboard settings', 'info');
}

function showFonts() {
    console.log('Opening Fonts settings');
    window.generalSettings.showNotification('Fonts settings', 'info');
}

function showLanguageRegion() {
    console.log('Opening Language & Region settings');
    window.generalSettings.showNotification('Language & Region settings', 'info');
}

function showDictionary() {
    console.log('Opening Dictionary settings');
    window.generalSettings.showNotification('Dictionary settings', 'info');
}

function showIPadStorage() {
    console.log('Analyzing iPad storage...');
    window.generalSettings.showNotification('Analyzing storage usage...', 'info');
    
    setTimeout(() => {
        window.generalSettings.showNotification('31.51 GB Available of 64 GB', 'info');
    }, 1500);
}

function showBackgroundRefresh() {
    const currentState = localStorage.getItem('backgroundRefresh') !== 'false';
    const newState = !currentState;
    
    localStorage.setItem('backgroundRefresh', newState.toString());
    window.generalSettings.updateBackgroundRefreshStatus(newState);
    
    window.generalSettings.showNotification(
        `Background App Refresh ${newState ? 'enabled' : 'disabled'}`, 
        newState ? 'success' : 'warning'
    );
}

function showDateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    window.generalSettings.showNotification(`${dateString}, ${timeString}`, 'info');
}

function showTransferReset() {
    console.log('Opening Transfer or Reset options');
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Transfer or Reset iPad</h3>
                <p>Prepare your iPad for a new owner or erase all content</p>
            </div>
            <div class="reset-options">
                <button class="reset-option" onclick="prepareForNewOwner()">
                    <div class="reset-title">Get Started</div>
                    <div class="reset-desc">Prepare this iPad for a new owner</div>
                </button>
                <button class="reset-option warning" onclick="eraseAllContent()">
                    <div class="reset-title">Erase All Content and Settings</div>
                    <div class="reset-desc">This will permanently delete all data</div>
                </button>
            </div>
            <div class="modal-actions">
                <button class="modal-btn cancel" onclick="this.closest('.modal').remove()">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showVPNManagement() {
    console.log('Opening VPN & Device Management');
    window.location.href = 'index.html';
}

function prepareForNewOwner() {
    document.querySelectorAll('.modal').forEach(modal => modal.remove());
    window.generalSettings.showNotification('Preparing iPad for new owner...', 'info');
}

function eraseAllContent() {
    document.querySelectorAll('.modal').forEach(modal => modal.remove());
    window.generalSettings.showNotification('This action requires authentication', 'warning');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.generalSettings = new GeneralSettings();
});