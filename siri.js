import dotenv from "dotenv";

dotenv.config();



// Basic CORS for development. In production, lock this down to your frontend origin.
app.use(cors({
  origin: true // or replace with "https://yourdomain.com"
}));
app.use(express.json({ limit: "1mb" }));

const GROQ_SECRET = process.env.GROQ_SECRET;
const GEMINI_SECRET = process.env.GEMINI_SECRET;

if (!GROQ_SECRET || !GEMINI_SECRET) {
  console.warn("Warning: GROQ_SECRET or GEMINI_SECRET not set in .env");
}

// POST /api/gemini
app.post("/api/gemini", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: "question is required" });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_SECRET}`;

    const body = {
      // This follows the format you used; adjust fields if your Google API expects different shape.
      // You can tweak temperature, max output tokens etc here.
      textFormat: "TEXT_FORMAT_UNSPECIFIED",
      safetySettings: [],
      prompt: {
        text: question
      }
    };

    // Some Google GenAI endpoints accept different payload shapes; if you previously used `contents.parts`,
    // you can replace the body.prompt block accordingly:
    // body = { input: { text: question } }  // adjust if needed

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Gemini error:", response.status, text);
      return res.status(502).json({ error: "Gemini API error", details: text });
    }

    const data = await response.json();

    // Attempt to extract text: several shapes possible based on endpoint version
    // Try common locations:
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output ||
      data?.result?.output?.[0]?.content?.[0]?.text ||
      data?.output?.[0]?.content?.text ||
      data?.outputText ||
      data?.response?.output;

    const reply = candidateText || JSON.stringify(data).slice(0, 1000);

    res.json({ reply });
  } catch (err) {
    console.error("Gemini route error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// POST /api/groq
app.post("/api/groq", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: "question is required" });
    }

    const url = "https://api.groq.com/openai/v1/chat/completions";

    const payload = {
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: question }
      ],
      max_tokens: 200
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_SECRET}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Groq error:", response.status, text);
      return res.status(502).json({ error: "Groq API error", details: text });
    }

    const data = await response.json();

    const reply = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || JSON.stringify(data).slice(0, 1000);

    res.json({ reply });
  } catch (err) {
    console.error("Groq route error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

