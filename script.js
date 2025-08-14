// VPN Configuration Interface JavaScript
class VPNConfig {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadSavedConfig();
    }

    initializeElements() {
        // Form elements
        this.vpnType = document.getElementById('vpnType');
        this.description = document.getElementById('description');
        this.server = document.getElementById('server');
        this.remoteId = document.getElementById('remoteId');
        this.localId = document.getElementById('localId');
        this.username = document.getElementById('username');
        this.password = document.getElementById('password');
        this.proxyUrl = document.getElementById('proxyUrl');

        // Buttons
        this.cancelBtn = document.getElementById('cancelBtn');
        this.doneBtn = document.getElementById('doneBtn');
        this.proxyBtns = document.querySelectorAll('.proxy-btn');

        // Other elements
        this.successMessage = document.getElementById('successMessage');
        this.proxyUrlRow = document.querySelector('.proxy-url-row');

        // Current state
        this.currentProxyMode = 'off';
        this.originalConfig = {};
    }

    setupEventListeners() {
        // Header buttons
        this.cancelBtn.addEventListener('click', () => this.handleCancel());
        this.doneBtn.addEventListener('click', () => this.handleDone());

        // Proxy toggle buttons
        this.proxyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleProxyToggle(e));
        });

        // Form validation on input
        const inputs = [this.description, this.server, this.remoteId, this.localId, this.username];
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateForm());
            input.addEventListener('blur', () => this.validateField(input));
        });

        // VPN type change
        this.vpnType.addEventListener('change', () => this.handleTypeChange());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleProxyToggle(event) {
        const clickedBtn = event.target;
        const proxyMode = clickedBtn.dataset.proxy;

        // Update active state
        this.proxyBtns.forEach(btn => btn.classList.remove('active'));
        clickedBtn.classList.add('active');

        // Update current mode
        this.currentProxyMode = proxyMode;

        // Show/hide proxy URL field with animation
        if (proxyMode === 'auto') {
            this.showProxyUrl();
        } else {
            this.hideProxyUrl();
        }

        // Add haptic feedback effect
        this.addHapticFeedback(clickedBtn);
    }

    showProxyUrl() {
        this.proxyUrlRow.style.display = 'flex';
        this.proxyUrl.value = 'free.luis.vpn/proxy/auto?code0/callback';
        
        // Trigger reflow for animation
        this.proxyUrlRow.offsetHeight;
        this.proxyUrlRow.style.animation = 'slideDown 0.3s ease-out';
    }

    hideProxyUrl() {
        this.proxyUrlRow.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => {
            this.proxyUrlRow.style.display = 'none';
            this.proxyUrl.value = '';
        }, 300);
    }

    addHapticFeedback(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 100);
    }

    handleTypeChange() {
        const selectedType = this.vpnType.value;
        console.log(`VPN type changed to: ${selectedType}`);
        
        // You can add type-specific logic here
        if (selectedType === 'L2TP') {
            // L2TP specific configuration
        } else if (selectedType === 'IPSec') {
            // IPSec specific configuration
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.id;

        // Remove any existing error styling
        field.classList.remove('error');

        // Validation rules
        switch (fieldName) {
            case 'server':
                if (value && !this.isValidServerAddress(value)) {
                    this.showFieldError(field, 'Invalid server address');
                    return false;
                }
                break;
            case 'remoteId':
            case 'localId':
                if (value && !this.isValidId(value)) {
                    this.showFieldError(field, 'Invalid ID format');
                    return false;
                }
                break;
            case 'username':
                if (value && !this.isValidUsername(value)) {
                    this.showFieldError(field, 'Invalid username format');
                    return false;
                }
                break;
            case 'proxyUrl':
                if (value && !this.isValidUrl(value)) {
                    this.showFieldError(field, 'Invalid URL format');
                    return false;
                }
                break;
        }

        return true;
    }

    validateForm() {
        const requiredFields = [this.description, this.server];
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
            }
        });

        // Update done button state
        this.doneBtn.style.opacity = isValid ? '1' : '0.5';
        this.doneBtn.style.pointerEvents = isValid ? 'auto' : 'none';

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        // You could add a tooltip or error message here
        console.warn(`Validation error for ${field.id}: ${message}`);
    }

    isValidServerAddress(address) {
        // Basic server address validation
        const serverRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        return serverRegex.test(address) || ipRegex.test(address);
    }

    isValidId(id) {
        // Basic ID validation (can be IP, domain, or identifier)
        return id.length > 0 && id.length < 100;
    }

    isValidUsername(username) {
        // Basic username validation
        return username.length > 0 && username.length < 100;
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            // Try with protocol prefix
            try {
                new URL('http://' + url);
                return true;
            } catch {
                return false;
            }
        }
    }

    handleCancel() {
        // Restore original configuration
        if (Object.keys(this.originalConfig).length > 0) {
            this.loadConfiguration(this.originalConfig);
        }

        // Add cancel animation
        this.addButtonAnimation(this.cancelBtn);
        
        // You could add navigation logic here
        console.log('Configuration cancelled');
    }

    handleDone() {
        if (!this.validateForm()) {
            this.showError('Please fill in all required fields');
            return;
        }

        // Validate all fields
        const allFieldsValid = [
            this.description,
            this.server,
            this.remoteId,
            this.localId,
            this.username
        ].every(field => this.validateField(field));

        if (!allFieldsValid) {
            this.showError('Please correct the validation errors');
            return;
        }

        // Save configuration
        const config = this.getConfiguration();
        this.saveConfiguration(config);

        // Add done animation
        this.addButtonAnimation(this.doneBtn);

        // Show success message
        this.showSuccess();
    }

    addButtonAnimation(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }

    getConfiguration() {
        return {
            type: this.vpnType.value,
            description: this.description.value.trim(),
            server: this.server.value.trim(),
            remoteId: this.remoteId.value.trim(),
            localId: this.localId.value.trim(),
            username: this.username.value.trim(),
            password: this.password.value, // Don't trim passwords
            proxyMode: this.currentProxyMode,
            proxyUrl: this.proxyUrl.value.trim(),
            timestamp: new Date().toISOString()
        };
    }

    saveConfiguration(config) {
        try {
            localStorage.setItem('vpnConfig', JSON.stringify(config));
            console.log('VPN configuration saved:', config);
        } catch (error) {
            console.error('Failed to save configuration:', error);
            this.showError('Failed to save configuration');
        }
    }

    loadSavedConfig() {
        try {
            const savedConfig = localStorage.getItem('vpnConfig');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                this.loadConfiguration(config);
                this.originalConfig = { ...config };
            }
        } catch (error) {
            console.error('Failed to load saved configuration:', error);
        }
    }

    loadConfiguration(config) {
        if (config.type) this.vpnType.value = config.type;
        if (config.description) this.description.value = config.description;
        if (config.server) this.server.value = config.server;
        if (config.remoteId) this.remoteId.value = config.remoteId;
        if (config.localId) this.localId.value = config.localId;
        if (config.username) this.username.value = config.username;
        if (config.password) this.password.value = config.password;
        if (config.proxyUrl) this.proxyUrl.value = config.proxyUrl;

        // Set proxy mode
        if (config.proxyMode) {
            this.setProxyMode(config.proxyMode);
        }

        // Validate form after loading
        this.validateForm();
    }

    setProxyMode(mode) {
        this.proxyBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.proxy === mode);
        });
        this.currentProxyMode = mode;

        if (mode === 'auto') {
            this.showProxyUrl();
        } else {
            this.hideProxyUrl();
        }
    }

    showSuccess() {
        this.successMessage.style.display = 'block';
        setTimeout(() => {
            this.successMessage.style.display = 'none';
        }, 2000);
    }

    showError(message) {
        // Create temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: var(--bg-secondary);
            color: #ff3b30;
            padding: 16px 20px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 500;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            animation: fadeInScale 0.3s ease-out;
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    handleKeyboard(event) {
        // Handle keyboard shortcuts
        if (event.metaKey || event.ctrlKey) {
            switch (event.key) {
                case 's':
                    event.preventDefault();
                    this.handleDone();
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.handleCancel();
                    break;
            }
        }
    }
}

// Initialize the VPN configuration interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VPNConfig();
});

// Add some additional utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add support for touch devices
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', function() {}, {passive: true});
}

// Add viewport height fix for mobile browsers
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', debounce(setViewportHeight, 100));
