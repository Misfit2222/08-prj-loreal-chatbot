// ====== L’Oréal Chatbot — script.js ======

// DOM elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// ====== Conversation History (LevelUp Requirement) ======
let messages = [
  {
    role: "system",
    content: `
You are a helpful beauty advisor for L’Oréal.
You only answer questions related to L’Oréal or its brands, including makeup, skincare, haircare, fragrances, ingredients, application tips, and personalized routines or product recommendations.
If a user asks about topics unrelated to beauty or L’Oréal, politely refuse and guide them back to beauty topics.
Be concise, friendly, and practical. When recommending products, explain why they fit the user’s needs.
If unsure about a detail, say so and suggest checking the official L’Oréal website.
    `.trim()
  }
];

// ====== UI Helpers ======

function addMessage(text, sender = "ai") {
  const div = document.createElement("div");
  div.classList.add("msg", sender);
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// LevelUp: show the latest question above the response
function showLatestQuestion(questionText) {
  const old = chatWindow.querySelector(".latest-question");
  if (old) old.remove();

  const wrapper = document.createElement("div");
  wrapper.classList.add("latest-question");
  wrapper.textContent = `You asked: ${questionText}`;
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Optional: beauty-topic guard
function isBeautyRelated(text) {
  const keywords = [
    "skin", "skincare", "hair", "haircare", "makeup", "foundation",
    "mascara", "lipstick", "fragrance", "perfume", "serum",
    "l’oréal", "loreal", "beauty", "routine", "shampoo",
    "conditioner", "concealer", "toner", "moisturizer"
  ];
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

// ====== Initial Greeting ======
addMessage("👋 Welcome to the L’Oréal Beauty Advisor! Ask me about products or routines.", "ai");

// ====== Form Submit Handler ======

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = userInput.value.trim();
  if (!userText) return;

  // Show user message
  addMessage(userText, "user");

  // LevelUp: show latest question
  showLatestQuestion(userText);

  // Clear input
  userInput.value = "";

  // Beauty-topic filter
  if (!isBeautyRelated(userText)) {
    addMessage(
      "I’m here to help with L’Oréal products and beauty topics. Try asking about skincare, makeup, haircare, or fragrances!",
      "ai"
    );
    return;
  }

  // Add to conversation history
  messages.push({ role: "user", content: userText });

  // Thinking bubble
  const thinking = document.createElement("div");
  thinking.classList.add("msg", "ai");
  thinking.textContent = "💬 Thinking…";
  chatWindow.appendChild(thinking);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // ====== Cloudflare Worker Endpoint ======
    const WORKER_URL = "YOUR_CLOUDFLARE_WORKER_URL_HERE";

    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await response.json();

    const aiReply =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn’t get a response right now.";

    thinking.remove();

    // Show AI reply
    addMessage(aiReply, "ai");

    // Add to history
    messages.push({ role: "assistant", content: aiReply });

  } catch (err) {
    console.error(err);
    thinking.remove();
    addMessage("⚠️ Error: Unable to reach the server. Try again.", "ai");
  }
});
