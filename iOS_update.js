const updateBtn = document.getElementById('update-btn');
const progressBar = document.getElementById('progress-bar');
const statusText = document.getElementById('status-text');

updateBtn.addEventListener('click', () => {
    updateBtn.disabled = true;
    statusText.innerText = "Downloading update...";
    let progress = 0;

    const interval = setInterval(() => {
        // Increase progress randomly between 5% and 14%
        progress += Math.floor(Math.random() * 10) + 5;
        if(progress > 100) progress = 100;

        // Update progress bar and status
        progressBar.style.width = progress + "%";
        statusText.innerText = `Downloading update... ${progress}%`;

        if(progress >= 100){
            clearInterval(interval);
            statusText.innerText = "iOS 2.0 Installed ✅";
            updateBtn.innerText = "Update Completed";
            updateBtn.style.background = "#4caf50";

            // Redirect to Home Screen after 1 second
            setTimeout(() => {
                window.location.href = "https://322a44cb-3336-4f7a-9384-2fd6c6824466-00-2ypwmzwt52p8b.worf.replit.dev/homescreen.html";
            }, 1000);
        }
    }, 500);
});
