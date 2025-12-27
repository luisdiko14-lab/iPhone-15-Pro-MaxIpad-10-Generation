document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('demo-login-btn');
    const overlay = document.getElementById('auth-overlay');
    const notification = document.getElementById('notification');

    loginBtn.addEventListener('click', () => {
        // 1. Fade out the overlay
        overlay.classList.add('hidden');

        // 2. Show success notification after a small delay
        setTimeout(() => {
            notification.classList.remove('hidden');
        }, 300);

        // 3. Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    });
});
