// Battery Settings JavaScript
class BatterySettings {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadBatteryState();
        this.updateBatteryChart();
    }

    initializeElements() {
        this.batteryPercentageToggle = document.getElementById('batteryPercentageToggle');
        this.lowPowerToggle = document.getElementById('lowPowerToggle');
        this.batteryChart = document.getElementById('batteryChart');
        this.currentView = '24h';
    }

    setupEventListeners() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button));
        });
    }

    loadBatteryState() {
        const batteryPercentage = localStorage.getItem('batteryPercentage') !== 'false';
        const lowPowerMode = localStorage.getItem('lowPowerMode') === 'true';
        
        if (!batteryPercentage) {
            this.batteryPercentageToggle.classList.remove('active');
        }
        
        if (lowPowerMode) {
            this.lowPowerToggle.classList.add('active');
            this.enableLowPowerEffects();
        }
    }

    enableLowPowerEffects() {
        // Change battery color to yellow/orange
        const batteryIndicators = document.querySelectorAll('.battery');
        batteryIndicators.forEach(indicator => {
            indicator.style.color = 'var(--warning-orange)';
        });
        
        // Update chart colors
        this.updateBatteryChart(true);
    }

    disableLowPowerEffects() {
        const batteryIndicators = document.querySelectorAll('.battery');
        batteryIndicators.forEach(indicator => {
            indicator.style.color = '';
        });
        
        this.updateBatteryChart(false);
    }

    switchTab(clickedButton) {
        // Update active tab
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        clickedButton.classList.add('active');
        
        // Update view
        this.currentView = clickedButton.textContent.includes('24') ? '24h' : '10d';
        this.updateBatteryChart();
        
        console.log(`Switched to ${this.currentView} view`);
    }

    updateBatteryChart(lowPowerMode = false) {
        const chartBars = document.querySelectorAll('.chart-bar');
        const activityBars = document.querySelectorAll('.activity-bar');
        
        if (this.currentView === '10d') {
            // Show 10-day data with different pattern
            chartBars.forEach((bar, index) => {
                const heights = [70, 85, 60, 75, 50, 80, 65, 45, 90, 55, 40, 75];
                bar.style.height = `${heights[index] || 50}%`;
                
                if (lowPowerMode) {
                    bar.style.background = 'var(--warning-orange)';
                } else {
                    bar.style.background = heights[index] > 60 ? '#30d158' : '#ffcc00';
                }
            });
            
            // Update timeline for 10 days
            const timeline = document.querySelector('.chart-timeline');
            timeline.innerHTML = `
                <span>Aug 4</span>
                <span>Aug 6</span>
                <span>Aug 8</span>
                <span>Aug 10</span>
                <span>Aug 12</span>
                <span>Aug 14</span>
            `;
        } else {
            // Show 24-hour data (default)
            chartBars.forEach((bar, index) => {
                const heights = [60, 45, 70, 55, 40, 65, 50, 35, 25, 30, 45, 40];
                bar.style.height = `${heights[index] || 50}%`;
                
                if (lowPowerMode) {
                    bar.style.background = 'var(--warning-orange)';
                } else {
                    if (heights[index] > 50) bar.style.background = '#30d158';
                    else if (heights[index] > 30) bar.style.background = '#ffcc00';
                    else bar.style.background = '#ff3b30';
                }
            });
            
            // Reset timeline for 24 hours
            const timeline = document.querySelector('.chart-timeline');
            timeline.innerHTML = `
                <span>15</span>
                <span>18</span>
                <span>21</span>
                <span>00</span>
                <span>03</span>
                <span>06</span>
                <span>09</span>
                <span>12</span>
            `;
        }
        
        // Update activity bars
        activityBars.forEach((bar, index) => {
            const activities = [30, 45, 25, 50, 35, 60, 40, 30, 45, 70, 55, 40];
            bar.style.height = `${activities[index] || 30}%`;
        });
    }

    generateBatteryData() {
        // Simulate realistic battery usage patterns
        const data = [];
        let currentLevel = 100;
        
        for (let hour = 0; hour < 24; hour++) {
            // Simulate different usage patterns
            let drain = Math.random() * 8 + 2; // 2-10% per hour
            
            // Higher drain during active hours (8AM-11PM)
            if (hour >= 8 && hour <= 23) {
                drain *= 1.5;
            }
            
            // Lower drain during sleep (12AM-7AM)
            if (hour >= 0 && hour <= 7) {
                drain *= 0.3;
            }
            
            currentLevel = Math.max(0, currentLevel - drain);
            data.push({
                hour,
                level: Math.round(currentLevel),
                activity: Math.round(drain * 5) // Convert to activity metric
            });
        }
        
        return data;
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

function toggleBatteryPercentage() {
    const toggle = document.getElementById('batteryPercentageToggle');
    const isActive = toggle.classList.contains('active');
    
    if (isActive) {
        toggle.classList.remove('active');
        localStorage.setItem('batteryPercentage', 'false');
    } else {
        toggle.classList.add('active');
        localStorage.setItem('batteryPercentage', 'true');
    }
    
    console.log(`Battery percentage ${isActive ? 'hidden' : 'shown'}`);
}

function toggleLowPowerMode() {
    const toggle = document.getElementById('lowPowerToggle');
    const isActive = toggle.classList.contains('active');
    
    if (isActive) {
        toggle.classList.remove('active');
        localStorage.setItem('lowPowerMode', 'false');
        window.batterySettings.disableLowPowerEffects();
    } else {
        toggle.classList.add('active');
        localStorage.setItem('lowPowerMode', 'true');
        window.batterySettings.enableLowPowerEffects();
    }
    
    console.log(`Low Power Mode ${isActive ? 'disabled' : 'enabled'}`);
}

function showBatteryUsage(period) {
    window.batterySettings.currentView = period;
    window.batterySettings.updateBatteryChart();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.batterySettings = new BatterySettings();
});