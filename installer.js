let selectedDevice = 'ios';

function selectDevice(device) {
    selectedDevice = device;
    document.getElementById('iosCard').classList.toggle('active', device === 'ios');
    document.getElementById('winCard').classList.toggle('active', device === 'windows');
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
        { progress: 30, text: `Fetching ${selectedDevice === 'ios' ? 'iOS 17' : 'Windows 10'} image...` },
        { progress: 50, text: "Extracting system files..." },
        { progress: 75, text: "Configuring virtual hardware..." },
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
                if (selectedDevice === 'ios') {
                    window.location.href = 'setup.html';
                } else {
                    window.location.href = 'setup_1.html';
                }
            }, 800);
        }
    }, 1200);
}