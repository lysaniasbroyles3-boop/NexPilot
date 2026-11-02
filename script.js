// =====================================
// NEXPILOT 2.0 — AI CONNECTION
// =====================================

let nexpilotEngine = null;
let nexpilotLoading = false;
let conversationHistory = [];

const MODEL_NAME = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

// Load the existing NexPilot AI engine
async function loadNexpilot() {
    if (nexpilotEngine) return nexpilotEngine;

    if (nexpilotLoading) {
        throw new Error("NexPilot is already loading.");
    }

    nexpilotLoading = true;

    try {
        const { CreateMLCEngine } =
            await import("https://esm.run/@mlc-ai/web-llm");

        nexpilotEngine = await CreateMLCEngine(MODEL_NAME);

        console.log("NexPilot Core connected!");

        return nexpilotEngine;

    } finally {
        nexpilotLoading = false;
    }
}

// Generate an AI response
async function directorResponse(text) {
    const engine = await loadNexpilot();

    const messages = [
        {
            role: "system",
            content: `
You are NexPilot, the intelligent AI core of NexPilot 2.0.

You help users with:
- Coding
- Business
- Projects
- Learning
- Planning
- Creative ideas

Be friendly, intelligent, clear, and helpful.
Remember the conversation context provided to you.
`
        },
        ...conversationHistory.slice(-12),
        {
            role: "user",
            content: text
        }
    ];

    const response = await engine.chat.completions.create({
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
    });

    return response.choices[0].message.content.trim();
}

// Send a message
async function sendMessage() {
    const input = document.getElementById("prompt");
    const text = input.value.trim();

    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    const thinking = addMessage(
        "NexPilot is thinking...",
        "director"
    );

    try {
        const answer = await directorResponse(text);

        thinking.textContent = answer;

        conversationHistory.push(
            { role: "user", content: text },
            { role: "assistant", content: answer }
        );

    } catch (error) {
        console.error(error);

        thinking.textContent =
            "NexPilot couldn't connect. Check the browser console for details.";
    }
}

console.log("NexPilot 2.0 connection system loaded.");
