const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { protect } = require('../middleware/authMiddleware');
const ChatSession = require('../models/ChatSession');

// GET /api/chat - Retrieve current user's chat session
router.get('/', protect, async (req, res) => {
  try {
    const session = await ChatSession.findOne({ user: req.user._id });
    if (!session) {
      return res.json({ messages: [] });
    }
    res.json({ messages: session.messages });
  } catch (error) {
    console.error("Fetch chat error:", error);
    res.status(500).json({ message: "Failed to fetch chat history." });
  }
});

// POST /api/chat - Send a message and get a reply
router.post('/', protect, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "AI Assistant is not configured on this server. Please set GEMINI_API_KEY." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { messages } = req.body;
    
    // Create the chat context
    let prompt = "You are an AI Virtual Assistant for the 'Skill Intel' platform, designed for Indian Government officials. Keep responses extremely concise (2-3 sentences), professional, and directly address the user's career or learning paths.\n\nIMPORTANT: Return PLAIN TEXT ONLY. DO NOT use any Markdown formatting, asterisks (**), hash symbols (#), or bullet points. Use standard plain text paragraphs only.\n\nConversation history:\n";
    
    messages.forEach(msg => {
      prompt += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
    });
    prompt += "Assistant:";

    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt
    });
    
    const replyText = response.text;

    // Save to DB
    const updatedMessages = [...messages, {
      id: Date.now().toString(),
      text: replyText,
      sender: 'bot',
      isError: false
    }];

    await ChatSession.findOneAndUpdate(
      { user: req.user._id },
      { messages: updatedMessages },
      { upsert: true, new: true }
    );

    res.json({ reply: replyText });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ message: "Failed to connect to AI assistant.", error: error.message });
  }
});

// DELETE /api/chat - Clear chat history
router.delete('/', protect, async (req, res) => {
  try {
    await ChatSession.findOneAndUpdate(
      { user: req.user._id },
      { messages: [] },
      { upsert: true }
    );
    res.json({ message: "Chat history cleared." });
  } catch (error) {
    console.error("Clear chat error:", error);
    res.status(500).json({ message: "Failed to clear chat history." });
  }
});

module.exports = router;
