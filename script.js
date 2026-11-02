
 // =====================================
 // NEXPILOT 2.0 — CONNECTED AI CORE
 // =====================================

let nexpilotEngine = null;
let nexpilotLoading = false;
let nexpilotBusy = false;
let conversationHistory = [];

const MODEL_NAME = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

// =====================================
// LOAD AI MODEL
// =====================================

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

        console.log("NEXPILOT AI CORE CONNECTED!");

        return nexpilotEngine;

    } finally {
        nexpilotLoading = false;
    }
}

// =====================================
// DISPLAY CHAT MESSAGES
// =====================================

function addMessage(text, sender) {
    const chat = document.getElementById("chat");

    if (!chat) {
        throw new Error("Chat interface not found.");
    }

    const welcome = chat.querySelector(".welcome");

    if (welcome) welcome.remove();

    const message = document.createElement("div");

    message.className = "message " + sender;
    message.textContent = text;

    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;

    return message;
}

// =====================================
// AI RESPONSE ENGINE
// =====================================

async function directorResponse(text) {
    const engine = await loadNexpilot();

    const messages = [
        {
            role: "system",
            content: `
You are NexPilot, the AI core of NexPilot 2.0.

You help with:
- Programming and coding
- Business management
- Website creation
- Project planning
- Learning
- Creative ideas

PERSONALITY:
Be friendly, intelligent, enthusiastic, and helpful.

Remember the conversation history supplied to you.
Answer the user's actual question.
Avoid repeating the same answer unnecessarily.
Explain complicated ideas clearly.
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

    const answer =
        response.choices?.[0]?.message?.content?.trim();

    if (!answer) {
        throw new Error("The AI returned an empty response.");
    }

    return answer;
}

// =====================================
// SEND MESSAGE
// =====================================

async function sendMessage() {
    if (nexpilotBusy) return;

    const input = document.getElementById("prompt");
    const button = document.getElementById("sendButton");

    const text = input.value.trim();

    if (!text) return;

    nexpilotBusy = true;

    addMessage(text, "user");
    input.value = "";

    if (button) button.disabled = true;

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
        console.error("NexPilot AI Error:", error);

        thinking.textContent =
            "I couldn't connect to my AI engine. Please check your browser's WebGPU support and try again.";
    } finally {
        nexpilotBusy = false;

        if (button) button.disabled = false;

        input.focus();
    }
}

// =====================================
// NEW CHAT
// =====================================

function newChat() {
    if (nexpilotBusy) return;

    conversationHistory = [];

    const chat = document.getElementById("chat");

    chat.innerHTML = `
        <div class="welcome">
            <div class="logo">✦</div>
            <h1>Welcome to NexPilot.</h1>
            <p>Your ideas. Your projects. Your AI.</p>
            <div class="suggestions">
                <button onclick="suggest('Help me build a website')">
                    Build a website
                </button>
                <button onclick="suggest('Help me learn programming')">
                    Learn programming
                </button>
                <button onclick="suggest('Help me start a business')">
                    Start a business
                </button>
            </div>
        </div>
    `;
}

// =====================================
// SUGGESTED PROMPTS
// =====================================

function suggest(text) {
    const input = document.getElementById("prompt");

    input.value = text;
    input.focus();

    sendMessage();
}

// =====================================
// KEYBOARD SUPPORT
// =====================================

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("prompt");

    if (!input) return;

    input.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
});

console.log("NexPilot 2.0 interface connected to its AI loader.");

