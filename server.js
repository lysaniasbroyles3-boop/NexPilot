```javascript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || "*"
}));

app.use(express.json({ limit: "20kb" }));

app.get("/", (req, res) => {
    res.json({
        name: "NexPilot Cloud",
        status: "online",
        version: "1.0.0"
    });
});

app.get("/health", (req, res) => {
    res.json({ status: "healthy" });
});

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "A message is required."
            });
        }

        if (!process.env.AI_API_KEY ||
            !process.env.AI_BASE_URL ||
            !process.env.AI_MODEL) {
            return res.status(503).json({
                error: "Cloud AI has not been configured yet."
            });
        }

        const response = await fetch(
            `${process.env.AI_BASE_URL.replace(/\/$/, "")}/chat/completions`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.AI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: process.env.AI_MODEL,
                    messages: [
                        {
                            role: "system",
                            content: "You are NexPilot, a helpful AI assistant."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],
                    max_tokens: 400
                }),
                signal: AbortSignal.timeout(45000)
            }
        );

        if (!response.ok) {
            console.error("AI provider error:", response.status);
            return res.status(502).json({
                error: "The cloud AI provider returned an error."
            });
        }

        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content;

        if (!answer) {
            return res.status(502).json({
                error: "The AI returned an empty response."
            });
        }

        res.json({ answer });

    } catch (error) {
        console.error("Cloud AI error:", error);
        res.status(500).json({
            error: "NexPilot Cloud encountered an error."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`NexPilot Cloud running on port ${PORT}`);
});
```
