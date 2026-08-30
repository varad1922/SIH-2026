const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/', async (req, res) => {
  try {
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
