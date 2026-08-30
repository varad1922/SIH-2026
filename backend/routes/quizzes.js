const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/generate', async (req, res) => {
  try {
    const { topic } = req.body;
    
    const prompt = `Generate a 5-question multiple choice quiz on the topic: "${topic}". 
    Format the output STRICTLY as a JSON array of objects. Do not include markdown codeblocks or any other text.
    Each object must have the following keys:
    - text (the question string)
    - options (an array of exactly 4 string options)
    - correctAnswer (the string matching one of the options)
    - explanation (a brief 1 sentence explanation)
    - difficultyLevel (either "Easy", "Medium", or "Hard")
    
    Example:
    [
      {
        "text": "What is Python?",
        "options": ["A snake", "A programming language", "A car", "A fruit"],
        "correctAnswer": "A programming language",
        "explanation": "Python is a high-level programming language.",
        "difficultyLevel": "Easy"
      }
    ]`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt
    });
    
    // Clean up potential markdown formatting in response
    let jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let questions;
    try {
      questions = JSON.parse(jsonStr);
    } catch (parseErr) {
        console.error("Failed to parse Gemini JSON:", jsonStr);
        return res.status(500).json({ message: "AI returned invalid format." });
    }
    
    res.json({ questions });
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    res.status(500).json({ message: "Failed to generate quiz.", error: error.message });
  }
});

module.exports = router;
