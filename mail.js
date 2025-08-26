// Mock emails
const emails = [
    { subject: "Welcome to iOS Mail!", sender: "Apple", content: "Thanks for trying our Mail app." },
    { subject: "Your VPN is active", sender: "VPN Service", content: "You are now connected securely." },
    { subject: "Update Available", sender: "System", content: "iOS 2.0 update is ready to install." },
    { subject: "Discount on Robux", sender: "Gaming Store", content: "Get 10% off your next purchase!" },
    { subject: "Meeting Reminder", sender: "Calendar", content: "Don't forget your meeting at 3 PM." },
];

// Reference to the mail list container
const mailList = document.getElementById("mail-list");

// Populate the mail list
emails.forEach((email) => {
    const mailItem = document.createElement("div");
    mailItem.className = "mail-item";
    mailItem.innerHTML = `
        <div class="mail-subject">${email.subject}</div>
        <div class="mail-sender">From: ${email.sender}</div>
    `;

    // Click to show email content
    mailItem.addEventListener("click", () => {
        alert(`Subject: ${email.subject}\nFrom: ${email.sender}\n\n${email.content}`);
    });

    mailList.appendChild(mailItem);
});

// Back button functionality
document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "https://322a44cb-3336-4f7a-9384-2fd6c6824466-00-2ypwmzwt52p8b.worf.replit.dev/homescreen.html";
});
