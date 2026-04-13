const updateBtn = document.getElementById('update-btn');
const progressBar = document.getElementById('progress-bar');
const statusText = document.getElementById('status-text');
const progressSection = document.getElementById('progress-section');
const bootScreen = document.getElementById('boot-screen');
const bootBar = document.getElementById('boot-bar');

updateBtn.addEventListener('click', () => {
    updateBtn.style.display = 'none';
    progressSection.style.display = 'block';

    const totalDuration = 65000; // 65 sec total
    const stuckTime = 10000;     // 10 sec at 99%
    const realDuration = totalDuration - stuckTime;

    const startTime = Date.now();
    let stuckStarted = false;

    function updateProgress() {
        const elapsed = Date.now() - startTime;

        let progress;

        if (elapsed < realDuration) {
            // Slow Apple-style curve (fast start → slow end)
            let t = elapsed / realDuration;

            // easing (VERY slow near end)
            progress = easeOutExpo(t) * 99;
        } else {
            progress = 99;

            if (!stuckStarted) {
                stuckStarted = true;
                statusText.innerText = "Finalizing update...";

                // stay at 99% for 10 seconds
                setTimeout(() => {
                    finishUpdate();
                }, stuckTime);
            }
        }

        progressBar.style.width = progress + "%";

        // 🍎 Realistic descriptions
        if (progress < 15) {
            statusText.innerText = "Downloading update...";
        } 
        else if (progress < 35) {
            statusText.innerText = "Downloading system files...";
        } 
        else if (progress < 55) {
            statusText.innerText = "Preparing update...";
        } 
        else if (progress < 75) {
            statusText.innerText = "Installing update...";
        } 
        else if (progress < 95) {
            statusText.innerText = "Optimizing system...";
        }

        if (progress < 99) {
            requestAnimationFrame(updateProgress);
        }
    }

    function finishUpdate() {
        progressBar.style.width = "100%";
        statusText.innerText = "Restarting...";
        setTimeout(startBootSequence, 2000);
    }

    updateProgress();
});

// 🍎 Apple-like easing (slow at end)
function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

// Boot sequence
function startBootSequence() {
    bootScreen.style.display = 'flex';

    const duration = 5000;
    const startTime = Date.now();

    function bootLoop() {
        const elapsed = Date.now() - startTime;
        let progress = Math.min((elapsed / duration) * 100, 100);

        bootBar.style.width = progress + "%";

        if (progress < 100) {
            requestAnimationFrame(bootLoop);
        } else {
            setTimeout(() => {
                window.location.href = "homescreen.html";
            }, 800);
        }
    }

    bootLoop();
}
