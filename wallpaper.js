// Wallpaper Settings JavaScript
class WallpaperSettings {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.settingRows = document.querySelectorAll('.setting-row');
        this.wallpaperScreens = document.querySelectorAll('.wallpaper-screen');
    }

    setupEventListeners() {
        // Add touch feedback to setting rows
        this.settingRows.forEach(row => {
            row.addEventListener('touchstart', this.addTouchFeedback, {passive: true});
            row.addEventListener('touchend', this.removeTouchFeedback, {passive: true});
            row.addEventListener('click', (e) => this.handleRowClick(e));
        });

        // Add click handlers to wallpaper previews
        this.wallpaperScreens.forEach(screen => {
            screen.addEventListener('click', () => this.showWallpaperOptions());
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

        console.log(`Opening: ${label}`);
        
        // Add haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }

        if (label === 'Add New Wallpaper') {
            this.showWallpaperPicker();
        }
    }

    showWallpaperOptions() {
        const modal = document.createElement('div');
        modal.className = 'wallpaper-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Wallpaper Options</h3>
                </div>
                <div class="wallpaper-actions">
                    <button class="wallpaper-btn" onclick="this.closest('.wallpaper-modal').remove(); document.querySelector('body').dispatchEvent(new CustomEvent('changeWallpaper'))">
                        Change Wallpaper
                    </button>
                    <button class="wallpaper-btn" onclick="this.closest('.wallpaper-modal').remove(); document.querySelector('body').dispatchEvent(new CustomEvent('customizeWallpaper'))">
                        Customize
                    </button>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn cancel" onclick="this.closest('.wallpaper-modal').remove()">Cancel</button>
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

        // Remove on tap outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showWallpaperPicker() {
        const categories = [
            { name: 'Dynamic', icon: '🌊', count: 12 },
            { name: 'Stills', icon: '🖼️', count: 24 },
            { name: 'Live', icon: '✨', count: 8 },
            { name: 'Photos', icon: '📷', count: 156 }
        ];

        const modal = document.createElement('div');
        modal.className = 'picker-modal';
        modal.innerHTML = `
            <div class="modal-content wide">
                <div class="modal-header">
                    <h3>Choose Wallpaper</h3>
                </div>
                <div class="wallpaper-categories">
                    ${categories.map(category => `
                        <div class="category-item" data-category="${category.name.toLowerCase()}">
                            <div class="category-icon">${category.icon}</div>
                            <div class="category-info">
                                <div class="category-name">${category.name}</div>
                                <div class="category-count">${category.count} wallpapers</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="modal-actions">
                    <button class="modal-btn cancel" onclick="this.closest('.picker-modal').remove()">Cancel</button>
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

        // Add click handlers for categories
        modal.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                this.showNotification(`Opening ${category} wallpapers`);
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

// Listen for custom events
document.body.addEventListener('changeWallpaper', () => {
    // Simulate wallpaper change
    const screens = document.querySelectorAll('.wallpaper-screen');
    const colors = [
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #43e97b, #38f9d7)'
    ];
    
    screens.forEach(screen => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        screen.style.background = randomColor;
    });
    
    const notification = document.createElement('div');
    notification.textContent = 'Wallpaper changed';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--success-green);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
});

document.body.addEventListener('customizeWallpaper', () => {
    const notification = document.createElement('div');
    notification.textContent = 'Opening wallpaper customization';
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
    setTimeout(() => notification.remove(), 2000);
});

// Add CSS animations and styles
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
        max-width: 300px;
        width: 100%;
        animation: modalSlideIn 0.3s ease-out;
    }

    .modal-content.wide {
        max-width: 350px;
    }

    .wallpaper-actions {
        margin-bottom: 20px;
    }

    .wallpaper-btn {
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

    .wallpaper-categories {
        margin-bottom: 20px;
    }

    .category-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 0.5px solid var(--border-color);
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .category-item:hover {
        background-color: var(--bg-tertiary);
    }

    .category-item:last-child {
        border-bottom: none;
    }

    .category-icon {
        font-size: 24px;
        margin-right: 12px;
        width: 32px;
        text-align: center;
    }

    .category-name {
        font-size: 17px;
        color: var(--text-primary);
        font-weight: 500;
    }

    .category-count {
        font-size: 13px;
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
    new WallpaperSettings();
});