const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "AI Assistant is not configured on this server. Please set GEMINI_API_KEY." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { messages } = req.body;
    
    // Create the chat context
    let prompt = "You are an AI Virtual Assistant for the 'Skill Intel' platform, designed for Indian Government officials. Keep responses extremely concise (2-3 sentences), professional, and directly address the user's career or learning paths.\n\nConversation history:\n";
    
    messages.forEach(msg => {
      prompt += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
    });
    prompt += "Assistant:";

    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt
    });
    
    res.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ message: "Failed to connect to AI assistant.", error: error.message });
  }
});

module.exports = router;
