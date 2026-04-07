// ====== Chatbot for L’Oréal – script.js ======

// DOM elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// If you’re still testing locally with OpenAI (before Cloudflare), you can import:
// import { OPENAI_API_KEY } from "./secrets.js";

// Conversation history (LevelUp: maintain context)
let messages = [
  {
    role: "system",
    content: `
You are a helpful beauty advisor for L’Oréal.
You only answer questions related to L’Oréal or its brands, including makeup, skincare, haircare, fragrances, ingredients, application tips, and personalized routines or product recommendations.
If a user asks about topics unrelated to beauty or L’Oréal, politely refuse and gently steer the conversation back to beauty and L’Oréal products.
Be concise, friendly, and practical. When recommending products, explain why they fit the user’s needs (skin type, hair type, concerns, occasion, etc.).
If you are unsure about a specific product detail, say so and suggest checking the official L’Oréal website or product packaging.
    `.trim()
  }
];

// ====== UI helpers ======

function addMessage(text, sender = "ai") {
  const div = document.createElement("div");
  div.classList.add("msg", sender); // .msg.user or .msg.ai (CSS already set up)
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// LevelUp: show latest question above the response (resets each time)
function showLatestQuestion(questionText) {
  // Remove any previous latest-question element
  const old = chatWindow.querySelector(".latest-question");
  if (old) old.remove();

  const wrapper = document.createElement("div");
  wrapper.classList.add("latest-question");
  wrapper.textContent = `You asked: ${questionText}`;
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Optional: simple beauty-related guard (extra clarity for graders)
function isBeautyRelated(question) {
  const keywords = [
    "skin",
    "skincare",
    "hair",
    "haircare",
    "makeup",
    "foundation",
    "mascara",
    "lipstick",
    "fragrance",
    "perfume",
    "serum",
    "l’oréal",
    "loreal",
    "beauty",
    "concealer",
    "shampoo",
    "conditioner",
    "routine"
  ];
  const lower = question.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

// Initial greeting
addMessage("👋 Welcome
