// Apple Account Profile JavaScript
class ProfileSettings {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadProfileData();
    }

    initializeElements() {
        this.storageUsed = 2.1; // GB
        this.storageTotal = 5.0; // GB
    }

    setupEventListeners() {
        // Monitor storage updates
        this.updateStorageDisplay();
    }

    loadProfileData() {
        // Load saved profile settings
        const profileData = this.getProfileData();
        this.displayProfileInfo(profileData);
    }

    getProfileData() {
        return {
            name: localStorage.getItem('profileName') || 'User',
            email: localStorage.getItem('profileEmail') || 'user@icloud.com',
            avatar: localStorage.getItem('profileAvatar') || 'U',
            devices: [
                {
                    name: "user's iPad",
                    model: "iPad (10th generation)",
                    status: "This device",
                    lastSeen: "Now"
                },
                {
                    name: "user's iPhone", 
                    model: "iPhone 15 Pro",
                    status: "Last seen 2 hours ago",
                    lastSeen: "2 hours ago"
                }
            ]
        };
    }

    displayProfileInfo(data) {
        const nameElement = document.querySelector('.profile-name-large');
        const emailElement = document.querySelector('.profile-email');
        const avatarElement = document.querySelector('.initials-large');
        
        if (nameElement) nameElement.textContent = data.name;
        if (emailElement) emailElement.textContent = data.email;
        if (avatarElement) avatarElement.textContent = data.avatar;
    }

    updateStorageDisplay() {
        const percentage = (this.storageUsed / this.storageTotal) * 100;
        const storageBar = document.querySelector('.storage-used');
        if (storageBar) {
            storageBar.style.width = `${percentage}%`;
        }
        
        const storageText = document.querySelector('[onclick="showiCloudStorage()"] .setting-value');
        if (storageText) {
            storageText.textContent = `${this.storageUsed} GB of ${this.storageTotal} GB Used`;
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

    showSignOutConfirmation() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Sign Out of iCloud?</h3>
                    <p>Your photos, documents, and other iCloud data will be removed from this iPad.</p>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn cancel" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="modal-btn danger" onclick="confirmSignOut()">Sign Out</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
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

function editProfile() {
    console.log('Opening profile editor');
    window.profileSettings.showNotification('Profile editor', 'info');
}

function showiCloud() {
    console.log('Opening iCloud settings');
    window.profileSettings.showNotification('iCloud settings', 'info');
}

function showAppStore() {
    console.log('Opening App Store settings');
    window.profileSettings.showNotification('App Store & iTunes Store settings', 'info');
}

function showWallet() {
    console.log('Opening Wallet & Apple Pay');
    window.profileSettings.showNotification('Wallet & Apple Pay settings', 'info');
}

function showSubscriptions() {
    console.log('Opening Subscriptions');
    window.profileSettings.showNotification('Subscriptions', 'info');
}

function showDeviceDetails(deviceName) {
    console.log(`Opening details for ${deviceName}`);
    window.profileSettings.showNotification(`${deviceName} details`, 'info');
}

function showSignInSecurity() {
    console.log('Opening Sign-In & Security');
    window.profileSettings.showNotification('Sign-In & Security settings', 'info');
}

function showPrivacy() {
    console.log('Opening Privacy & Security');
    window.profileSettings.showNotification('Privacy & Security settings', 'info');
}

function showiCloudStorage() {
    console.log('Opening iCloud Storage management');
    window.profileSettings.showNotification('Managing iCloud Storage...', 'info');
}

function showFamilySharing() {
    console.log('Opening Family Sharing setup');
    window.profileSettings.showNotification('Family Sharing setup', 'info');
}

function showAccountActions() {
    console.log('Opening Account Settings');
    window.profileSettings.showNotification('Account Settings', 'info');
}

function signOut() {
    window.profileSettings.showSignOutConfirmation();
}

function confirmSignOut() {
    document.querySelectorAll('.modal').forEach(modal => modal.remove());
    window.profileSettings.showNotification('Signing out...', 'warning');
    
    setTimeout(() => {
        localStorage.clear();
        window.location.href = 'home.html';
    }, 2000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileSettings = new ProfileSettings();
});