// Sounds Settings JavaScript
class SoundsSettings {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
    }

    initializeElements() {
        this.toggles = document.querySelectorAll('.toggle-switch');
        this.settingRows = document.querySelectorAll('.setting-row');
    }

    setupEventListeners() {
        // Add click handlers for toggle switches
        this.toggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => this.handleToggle(e));
        });

        // Add touch feedback to setting rows
        this.settingRows.forEach(row => {
            row.addEventListener('touchstart', this.addTouchFeedback, {passive: true});
            row.addEventListener('touchend', this.removeTouchFeedback, {passive: true});
            row.addEventListener('click', (e) => this.handleRowClick(e));
        });
    }

    handleToggle(event) {
        const toggle = event.target.closest('.toggle-switch');
        if (!toggle) return;

        const isActive = toggle.classList.contains('active');
        const settingLabel = toggle.closest('.setting-row').querySelector('.setting-label').textContent;
        
        if (isActive) {
            toggle.classList.remove('active');
        } else {
            toggle.classList.add('active');
        }

        // Add haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        // Save setting
        this.saveSetting(toggle);

        // Play a preview sound for some settings
        if (toggle.classList.contains('active')) {
            this.playPreviewSound(settingLabel);
        }

        this.showNotification(`${settingLabel} ${toggle.classList.contains('active') ? 'enabled' : 'disabled'}`);
    }

    handleRowClick(event) {
        const row = event.target.closest('.setting-row');
        if (!row || row.querySelector('.toggle-switch')) return;

        const label = row.querySelector('.setting-label').textContent;
        
        // Add click animation
        row.style.transform = 'scale(0.98)';
        setTimeout(() => {
            row.style.transform = 'scale(1)';
        }, 100);

        console.log(`Opening sound picker for: ${label}`);
        
        // Add haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }

        this.showSoundPicker(label);
    }

    showSoundPicker(soundType) {
        const sounds = {
            'Ringtone': ['Reflection', 'Opening', 'Apex', 'Beacon', 'Bulletin', 'Classic'],
            'Text Tone': ['Note', 'Aurora', 'Bamboo', 'Chord', 'Circles', 'Complete'],
            'New Mail': ['Ding', 'Chime', 'Glass', 'Horn', 'Bell', 'Electronic'],
            'Sent Mail': ['Swoosh', 'Pop', 'Swish', 'Whoosh'],
            'Calendar Alerts': ['Chord', 'Note', 'Ding', 'Chime']
        };

        const currentValue = event.target.closest('.setting-row').querySelector('.setting-value').textContent;
        const availableSounds = sounds[soundType] || ['Default'];

        const modal = document.createElement('div');
        modal.className = 'sound-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${soundType}</h3>
                </div>
                <div class="sound-list">
                    ${availableSounds.map(sound => `
                        <div class="sound-item ${sound === currentValue ? 'selected' : ''}" data-sound="${sound}">
                            <span>${sound}</span>
                            <span class="checkmark">${sound === currentValue ? '✓' : ''}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="modal-actions">
                    <button class="modal-btn cancel" onclick="this.closest('.sound-modal').remove()">Cancel</button>
                    <button class="modal-btn" onclick="this.closest('.sound-modal').querySelector('.selected')?.click(); this.closest('.sound-modal').remove()">Done</button>
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

        // Add click handlers for sound items
        modal.querySelectorAll('.sound-item').forEach(item => {
            item.addEventListener('click', () => {
                // Update selection
                modal.querySelectorAll('.sound-item').forEach(i => {
                    i.classList.remove('selected');
                    i.querySelector('.checkmark').textContent = '';
                });
                item.classList.add('selected');
                item.querySelector('.checkmark').textContent = '✓';

                // Update the main page
                const soundName = item.dataset.sound;
                const valueElement = document.querySelector(`.setting-row:has(.setting-label:contains("${soundType}")) .setting-value`);
                if (valueElement) {
                    valueElement.textContent = soundName;
                }

                // Play preview
                this.playPreviewSound(soundType, soundName);

                // Save setting
                localStorage.setItem(`sound_${soundType.replace(/\s+/g, '_').toLowerCase()}`, soundName);
            });
        });

        // Remove on tap outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    playPreviewSound(settingType, soundName = null) {
        // Create a simple audio context for preview sounds
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different frequencies for different sound types
            const frequencies = {
                'Lock Sound': 800,
                'Keyboard Clicks': 1200,
                'System Haptics': 400,
                'Ringtone': 523, // C5
                'Text Tone': 659, // E5
                'New Mail': 440, // A4
                'Sent Mail': 349, // F4
                'Calendar Alerts': 523 // C5
            };

            oscillator.frequency.setValueAtTime(frequencies[settingType] || 500, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);

            console.log(`Playing preview sound for: ${settingType}${soundName ? ` - ${soundName}` : ''}`);
        } catch (error) {
            console.log('Audio preview not available');
        }
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
        if (!event.target.closest('.toggle-switch')) {
            event.target.style.backgroundColor = 'var(--bg-tertiary)';
        }
    }

    removeTouchFeedback(event) {
        if (!event.target.closest('.toggle-switch')) {
            event.target.style.backgroundColor = '';
        }
    }

    saveSetting(toggle) {
        const settingRow = toggle.closest('.setting-row');
        const label = settingRow.querySelector('.setting-label').textContent;
        const isActive = toggle.classList.contains('active');
        
        localStorage.setItem(`sound_${label.replace(/\s+/g, '_').toLowerCase()}`, isActive);
        console.log(`${label}: ${isActive ? 'enabled' : 'disabled'}`);
    }

    loadSettings() {
        this.settingRows.forEach(row => {
            const toggle = row.querySelector('.toggle-switch');
            if (toggle) {
                const label = row.querySelector('.setting-label').textContent;
                const saved = localStorage.getItem(`sound_${label.replace(/\s+/g, '_').toLowerCase()}`);
                
                if (saved === 'true' || (saved === null && toggle.classList.contains('active'))) {
                    toggle.classList.add('active');
                }
            }
        });
    }
}

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

    .sound-list {
        max-height: 300px;
        overflow-y: auto;
        margin-bottom: 20px;
    }

    .sound-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 0.5px solid var(--border-color);
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .sound-item:hover {
        background-color: var(--bg-tertiary);
    }

    .sound-item.selected {
        background-color: var(--bg-tertiary);
        color: var(--accent-blue);
    }

    .sound-item:last-child {
        border-bottom: none;
    }

    .checkmark {
        font-weight: 600;
        color: var(--accent-blue);
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
    new SoundsSettings();
});