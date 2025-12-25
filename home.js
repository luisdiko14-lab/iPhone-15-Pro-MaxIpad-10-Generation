// iOS Settings Home Page JavaScript
class SettingsHome {
constructor() {
this.initializeElements();
this.setupEventListeners();
this.loadUserData();
}

initializeElements() {
this.airplaneToggle = document.getElementById('airplaneToggle');
this.searchInput = document.querySelector('.search-input');
}

setupEventListeners() {
// Search functionality
this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

// Add touch feedback to all clickable elements
const clickableElements = document.querySelectorAll('.setting-row, .profile-card');
clickableElements.forEach(element => {
element.addEventListener('touchstart', this.addTouchFeedback, {passive: true});
element.addEventListener('touchend', this.removeTouchFeedback, {passive: true});
});
}

handleSearch(query) {
const settingRows = document.querySelectorAll('.setting-row');
const groups = document.querySelectorAll('.settings-group, .quick-settings');

if (!query.trim()) {
// Show all settings
settingRows.forEach(row => {
row.style.display = 'flex';
});
groups.forEach(group => {
group.style.display = 'block';
});
return;
}

const searchTerm = query.toLowerCase();
let hasVisibleResults = false;

settingRows.forEach(row => {
const label = row.querySelector('.setting-label');
if (label && label.textContent.toLowerCase().includes(searchTerm)) {
row.style.display = 'flex';
hasVisibleResults = true;
} else {
row.style.display = 'none';
}
});

// Hide empty groups
groups.forEach(group => {
const visibleRows = group.querySelectorAll('.setting-row[style*="flex"]');
group.style.display = visibleRows.length > 0 ? 'block' : 'none';
});
}

addTouchFeedback(event) {
event.target.style.transform = 'scale(0.98)';
event.target.style.opacity = '0.8';
}

removeTouchFeedback(event) {
event.target.style.transform = 'scale(1)';
event.target.style.opacity = '1';
}

loadUserData() {
// Load any saved user preferences or settings state
const savedAirplaneMode = localStorage.getItem('airplaneMode');
if (savedAirplaneMode === 'true') {
this.airplaneToggle.classList.add('active');
}
}
}

// Navigation functions
function navigateTo(page, identifier) {
  // Add navigation animation
  const container = document.querySelector('.ios-container');
  container.style.opacity = '0.8';
  container.style.transform = 'scale(0.95)';
  
  const targetUrl = identifier ? `${page}?settings=${identifier}` : page;

  setTimeout(() => {
    window.location.href = targetUrl;
  }, 150);
}

function toggleAirplane() {
const toggle = document.getElementById('airplaneToggle');
const isActive = toggle.classList.contains('active');

if (isActive) {
toggle.classList.remove('active');
localStorage.setItem('airplaneMode', 'false');
} else {
toggle.classList.add('active');
localStorage.setItem('airplaneMode', 'true');
}

// Add haptic feedback
if (navigator.vibrate) {
navigator.vibrate(50);
}

// Log the action
console.log(`Airplane mode ${isActive ? 'disabled' : 'enabled'}`);
}

// Utility functions
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

// Initialize the settings home interface
document.addEventListener('DOMContentLoaded', () => {
new SettingsHome();

// Add iOS-style momentum scrolling
if (CSS.supports('-webkit-overflow-scrolling', 'touch')) {
document.body.style.webkitOverflowScrolling = 'touch';
}
});

// Handle back navigation
window.addEventListener('pageshow', function(event) {
if (event.persisted) {
// Reset any transition states when navigating back
const container = document.querySelector('.ios-container');
if (container) {
container.style.opacity = '1';
container.style.transform = 'scale(1)';
}
}
});

// Add support for keyboard navigation
document.addEventListener('keydown', (event) => {
if (event.key === 'Enter' || event.key === ' ') {
const focused = document.activeElement;
if (focused && focused.classList.contains('setting-row')) {
event.preventDefault();
focused.click();
}
}

if (event.key === 'Escape') {
// Clear search
const searchInput = document.querySelector('.search-input');
if (searchInput && searchInput.value) {
searchInput.value = '';
searchInput.dispatchEvent(new Event('input'));
}
}
});

// Handle viewport changes for mobile devices
function handleViewportChange() {
const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
}

handleViewportChange();
window.addEventListener('resize', debounce(handleViewportChange, 100));
window.addEventListener('orientationchange', handleViewportChange);