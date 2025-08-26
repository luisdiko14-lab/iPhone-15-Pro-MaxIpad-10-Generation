document.addEventListener("DOMContentLoaded", () => {
    const askBtn = document.getElementById("askBtn");
    const userQuestion = document.getElementById("userQuestion");
    const siriStatus = document.getElementById("siri-status");

    const GROQ_API_KEY = "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";
    const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    askBtn.addEventListener("click", async () => {
        let question = userQuestion.value.trim();
        if (question.length === 0) {
            siriStatus.innerText = "Please say or type something.";
            siriStatus.style.color = "#ff4d4d";
            return;
        }

        siriStatus.innerText = "Listening...";
        siriStatus.style.color = "#ccc";

        try {
            const response = await fetch(GROQ_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [{ role: "user", content: question }],
                    max_tokens: 100
                })
            });

            const data = await response.json();
            const aiReply = data.choices?.[0]?.message?.content || "Sorry, I couldn't understand.";
            siriStatus.innerText = aiReply;
            siriStatus.style.color = "white";
        } catch (err) {
            console.error(err);
            siriStatus.innerText = "Error connecting to Siri.";
            siriStatus.style.color = "#ff4d4d";
        }
    });
});
