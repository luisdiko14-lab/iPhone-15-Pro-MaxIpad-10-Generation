let selectedDevice = 'ios';

function selectDevice(device) {
    if (device === 'windows') return;
    selectedDevice = device;
}

function startInstallation() {
    const btn = document.getElementById('installBtn');
    const progressSection = document.getElementById('progressSection');
    const progressBar = document.getElementById('progressBar');
    const statusText = document.getElementById('statusText');

    btn.classList.add('hidden');
    progressSection.classList.remove('hidden');

    const steps = [
        { progress: 10, text: "Allocating storage space..." },
        { progress: 30, text: "Fetching system image from VMware cloud..." },
        { progress: 50, text: "Extracting iOS 17 kernel..." },
        { progress: 75, text: "Setting up virtual hardware profiles..." },
        { progress: 90, text: "Finalizing installation..." },
        { progress: 100, text: "Done!" }
    ];

    let currentStep = 0;

    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            progressBar.style.width = steps[currentStep].progress + '%';
            statusText.innerText = steps[currentStep].text;
            currentStep++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                window.location.href = 'homescreen.html';
            }, 800);
        }
    }, 1200);
}