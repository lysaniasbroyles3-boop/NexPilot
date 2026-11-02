
const chat = document.getElementById("chat");
const promptInput = document.getElementById("prompt");
const sendButton = document.getElementById("sendButton");

let busy = false;
let conversationHistory = [];

function addMessage(text, type) {
  const message = document.createElement("div");

  message.className = "message " + type;
  message.textContent = text;

  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;

  return message;
}

function suggest(text) {
  promptInput.value = text;
  sendMessage();
}

function newChat() {
  conversationHistory = [];
  chat.innerHTML = `
    <div class="welcome">
      <div class="logo">✦</div>
      <h1>Welcome to NexPilot.</h1>
      <p>Your ideas. Your projects. Your AI.</p>
    </div>
  `;
}

async function sendMessage() {
  if (busy) return;

  const text = promptInput.value.trim();

  if (!text) return;

  busy = true;

  addMessage(text, "user");
  promptInput.value = "";

  sendButton.disabled = true;
  sendButton.textContent = "...";

  const responseElement = addMessage(
    "NexPilot is thinking...",
    "director"
  );

  try {
    conversationHistory.push({
      role: "user",
      content: text
    });

    const response = await fetch(
      "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: conversationHistory
        })
      }
    );

    if (!response.ok) {
      throw new Error("AI server returned " + response.status);
    }

    const data = await response.json();

    if (!data.answer) {
      throw new Error("No answer received");
    }

    responseElement.textContent = data.answer;

    conversationHistory.push({
      role: "assistant",
      content: data.answer
    });

    if (conversationHistory.length > 30) {
      conversationHistory = conversationHistory.slice(-30);
    }

  } catch (error) {
    console.error("NexPilot error:", error);

    responseElement.textContent =
      "I couldn't connect to my AI brain. Please check that the backend is deployed and try again.";
  } finally {
    busy = false;
    sendButton.disabled = false;
    sendButton.textContent = "↑";
    promptInput.focus();
  }
}

promptInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});
