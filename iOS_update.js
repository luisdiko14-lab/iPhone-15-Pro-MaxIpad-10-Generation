const updateBtn = document.getElementById('update-btn');
const progressBar = document.getElementById('progress-bar');
const statusText = document.getElementById('status-text');
const progressSection = document.getElementById('progress-section');
const bootScreen = document.getElementById('boot-screen');
const bootBar = document.getElementById('boot-bar');

updateBtn.addEventListener('click', () => {
    updateBtn.style.display = 'none';
    progressSection.style.display = 'block';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 2) + 2;
        if (progress > 100) progress = 100;

        progressBar.style.width = progress + "%";
        
        if (progress < 40) {
            statusText.innerText = "Downloading... " + progress + "%";
        } else if (progress < 80) {
            statusText.innerText = "Preparing Update... " + (progress - 40) * 2.5 + "%";
        } else if (progress < 100) {
            statusText.innerText = "Verifying Update...";
        }

        if (progress >= 100) {
            clearInterval(interval);
            statusText.innerText = "Restarting...";
            
            setTimeout(() => {
                startBootSequence();
            }, 2500);
        }
    }, 2500);
});

function startBootSequence() {
    bootScreen.style.display = 'flex';
    let bootProgress = 0;
    
    const bootInterval = setInterval(() => {
        bootProgress += Math.floor(Math.random() * 3) + 1;
        if (bootProgress > 100) bootProgress = 100;
        
        bootBar.style.width = bootProgress + "%";
        
        if (bootProgress >= 100) {
            clearInterval(bootInterval);
            setTimeout(() => {
                window.location.href = "homescreen.html";
            }, 1000);
        }
    }, 100);
}
