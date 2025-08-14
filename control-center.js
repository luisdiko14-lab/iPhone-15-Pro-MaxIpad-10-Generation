// Control Centre Settings JavaScript
class ControlCentreSettings {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadControlCentreState();
        this.draggedElement = null;
    }

    initializeElements() {
        this.accessWithinApps = document.getElementById('accessWithinApps');
        this.accessOnLockScreen = document.getElementById('accessOnLockScreen');
        this.includedControls = document.querySelector('.settings-group:nth-child(2)');
        this.moreControls = document.querySelector('.settings-group:nth-child(3)');
        this.ccPreview = document.getElementById('ccPreview');
    }

    setupEventListeners() {
        // Long press to preview Control Centre
        let longPressTimer;
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.control-item')) {
                longPressTimer = setTimeout(() => {
                    this.showControlCentrePreview();
                }, 800);
            }
        });

        document.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });

        // Keyboard shortcut to preview
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                this.showControlCentrePreview();
            }
        });
    }

    loadControlCentreState() {
        const accessWithinApps = localStorage.getItem('ccAccessWithinApps') !== 'false';
        const accessOnLockScreen = localStorage.getItem('ccAccessOnLockScreen') !== 'false';

        if (!accessWithinApps) {
            this.accessWithinApps.classList.remove('active');
        }

        if (!accessOnLockScreen) {
            this.accessOnLockScreen.classList.remove('active');
        }

        // Load custom control order
        this.loadControlOrder();
    }

    loadControlOrder() {
        const savedOrder = localStorage.getItem('ccControlOrder');
        if (savedOrder) {
            const order = JSON.parse(savedOrder);
            this.reorderControls(order);
        }
    }

    saveControlOrder() {
        const controlItems = document.querySelectorAll('.control-item:not(.available)');
        const order = Array.from(controlItems).map(item => {
            return item.querySelector('.control-name').textContent;
        });
        localStorage.setItem('ccControlOrder', JSON.stringify(order));
    }

    reorderControls(order) {
        const includedSection = document.querySelector('.settings-group:nth-child(2)');
        const controlItems = Array.from(document.querySelectorAll('.control-item:not(.available)'));
        
        // Clear current order
        controlItems.forEach(item => item.remove());
        
        // Add in new order
        order.forEach(controlName => {
            const control = controlItems.find(item => 
                item.querySelector('.control-name').textContent === controlName
            );
            if (control) {
                includedSection.appendChild(control);
            }
        });
    }

    showControlCentrePreview() {
        this.ccPreview.style.display = 'flex';
        setTimeout(() => {
            this.ccPreview.style.opacity = '1';
        }, 10);
    }

    addHapticFeedback() {
        if (navigator.vibrate) {
            navigator.vibrate(50);
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

function toggleAccessWithinApps() {
    const toggle = document.getElementById('accessWithinApps');
    const isActive = toggle.classList.contains('active');
    
    if (isActive) {
        toggle.classList.remove('active');
        localStorage.setItem('ccAccessWithinApps', 'false');
    } else {
        toggle.classList.add('active');
        localStorage.setItem('ccAccessWithinApps', 'true');
    }
    
    window.controlCentreSettings.addHapticFeedback();
    console.log(`Control Centre access within apps ${isActive ? 'disabled' : 'enabled'}`);
}

function toggleAccessOnLockScreen() {
    const toggle = document.getElementById('accessOnLockScreen');
    const isActive = toggle.classList.contains('active');
    
    if (isActive) {
        toggle.classList.remove('active');
        localStorage.setItem('ccAccessOnLockScreen', 'false');
    } else {
        toggle.classList.add('active');
        localStorage.setItem('ccAccessOnLockScreen', 'true');
    }
    
    window.controlCentreSettings.addHapticFeedback();
    console.log(`Control Centre access on lock screen ${isActive ? 'disabled' : 'enabled'}`);
}

function addControl(element) {
    const controlName = element.querySelector('.control-name').textContent;
    const controlIcon = element.querySelector('.control-icon').textContent;
    const controlDesc = element.querySelector('.control-desc').textContent;
    
    // Create new control in included section
    const newControl = document.createElement('div');
    newControl.className = 'control-item';
    newControl.draggable = true;
    newControl.ondragstart = dragStart;
    newControl.ondrop = drop;
    newControl.ondragover = allowDrop;
    newControl.innerHTML = `
        <div class="control-info">
            <div class="control-icon ${controlName.toLowerCase().replace(/\s+/g, '-')}">${controlIcon}</div>
            <div class="control-details">
                <div class="control-name">${controlName}</div>
                <div class="control-desc">${controlDesc}</div>
            </div>
        </div>
        <div class="drag-handle">≡</div>
    `;
    
    // Add to included controls
    const includedSection = document.querySelector('.settings-group:nth-child(2)');
    includedSection.appendChild(newControl);
    
    // Remove from available controls
    element.remove();
    
    // Save new order
    window.controlCentreSettings.saveControlOrder();
    window.controlCentreSettings.showNotification(`${controlName} added to Control Centre`, 'success');
    
    console.log(`Added ${controlName} to Control Centre`);
}

function removeControl(element) {
    const controlName = element.querySelector('.control-name').textContent;
    const controlIcon = element.querySelector('.control-icon').textContent;
    const controlDesc = element.querySelector('.control-desc').textContent;
    
    // Create new control in more controls section
    const newControl = document.createElement('div');
    newControl.className = 'control-item available';
    newControl.onclick = () => addControl(newControl);
    newControl.innerHTML = `
        <div class="control-info">
            <div class="control-icon ${controlName.toLowerCase().replace(/\s+/g, '-')}">${controlIcon}</div>
            <div class="control-details">
                <div class="control-name">${controlName}</div>
                <div class="control-desc">${controlDesc}</div>
            </div>
        </div>
        <div class="add-button">+</div>
    `;
    
    // Add to more controls
    const moreSection = document.querySelector('.settings-group:nth-child(3)');
    moreSection.appendChild(newControl);
    
    // Remove from included controls
    element.remove();
    
    // Save new order
    window.controlCentreSettings.saveControlOrder();
    window.controlCentreSettings.showNotification(`${controlName} removed from Control Centre`, 'warning');
    
    console.log(`Removed ${controlName} from Control Centre`);
}

// Drag and drop functions
function allowDrop(ev) {
    ev.preventDefault();
}

function dragStart(ev) {
    window.controlCentreSettings.draggedElement = ev.target.closest('.control-item');
    ev.dataTransfer.effectAllowed = 'move';
    ev.target.style.opacity = '0.5';
}

function drop(ev) {
    ev.preventDefault();
    
    const draggedElement = window.controlCentreSettings.draggedElement;
    const targetElement = ev.target.closest('.control-item');
    
    if (draggedElement && targetElement && draggedElement !== targetElement) {
        const parent = targetElement.parentNode;
        const nextSibling = targetElement.nextSibling;
        
        if (nextSibling) {
            parent.insertBefore(draggedElement, nextSibling);
        } else {
            parent.appendChild(draggedElement);
        }
        
        window.controlCentreSettings.saveControlOrder();
        window.controlCentreSettings.showNotification('Control Centre order updated', 'success');
    }
    
    // Reset opacity
    if (draggedElement) {
        draggedElement.style.opacity = '1';
    }
}

function closePreview() {
    const preview = document.getElementById('ccPreview');
    preview.style.opacity = '0';
    setTimeout(() => {
        preview.style.display = 'none';
    }, 200);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.controlCentreSettings = new ControlCentreSettings();
});