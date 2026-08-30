const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

router.post('/generate', async (req, res) => {
  try {
    const { topic } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message:
          'GEMINI_API_KEY is not configured on the server.',
      });
    }

    if (
      !topic ||
      typeof topic !== 'string' ||
      !topic.trim()
    ) {
      return res.status(400).json({
        message: 'Please provide a valid quiz topic.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
Generate exactly 5 multiple-choice questions about:

"${topic.trim()}"

Return ONLY valid JSON.

Do not include:
- Markdown
- Code blocks
- Extra text before the JSON
- Extra text after the JSON

The result must be a JSON array.

Each question must have exactly these properties:

{
  "text": "Question text",
  "options": [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4"
  ],
  "correctAnswer": "Correct option",
  "explanation": "Brief explanation",
  "difficultyLevel": "Easy"
}

Rules:
1. Generate exactly 5 questions.
2. Every question must have exactly 4 options.
3. correctAnswer must exactly match one item from options.
4. difficultyLevel must be either Easy, Medium, or Hard.
5. Keep all questions relevant to "${topic.trim()}".
6. Make the questions suitable for learning and skill assessment.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    if (!response || !response.text) {
      return res.status(500).json({
        message: 'AI did not generate any quiz questions.',
      });
    }

    const jsonString = response.text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let questions;

    try {
      questions = JSON.parse(jsonString);
    } catch (parseError) {
      console.error(
        'Failed to parse generated quiz:',
        jsonString
      );

      return res.status(500).json({
        message: 'AI returned an invalid quiz format.',
      });
    }

    if (!Array.isArray(questions)) {
      return res.status(500).json({
        message: 'AI returned an invalid quiz format.',
      });
    }

    if (questions.length !== 5) {
      return res.status(500).json({
        message: 'AI did not generate exactly 5 questions.',
      });
    }

    const isValid = questions.every((question) => {
      return (
        question &&
        typeof question.text === 'string' &&
        question.text.trim() &&
        Array.isArray(question.options) &&
        question.options.length === 4 &&
        question.options.every(
          (option) =>
            typeof option === 'string' && option.trim()
        ) &&
        typeof question.correctAnswer === 'string' &&
        question.options.includes(question.correctAnswer) &&
        typeof question.explanation === 'string' &&
        question.explanation.trim() &&
        ['Easy', 'Medium', 'Hard'].includes(
          question.difficultyLevel
        )
      );
    });

    if (!isValid) {
      return res.status(500).json({
        message:
          'AI generated quiz questions in an invalid format.',
      });
    }

    return res.status(200).json({
      questions,
    });

  } catch (error) {
    console.error('Gemini Quiz Error:', error);

    return res.status(500).json({
      message: 'Failed to generate quiz.',
      error: error.message,
    });
  }
});

const { protect } = require('../middleware/authMiddleware');
const QuizAttempt = require('../models/QuizAttempt');

router.post('/attempt', protect, async (req, res) => {
  try {
    const { topic, score, totalQuestions, correctAnswers } = req.body;
    
    if (!topic || score === undefined || !totalQuestions || correctAnswers === undefined) {
      return res.status(400).json({ message: 'Missing required fields for quiz attempt.' });
    }

    const attempt = new QuizAttempt({
      user: req.user._id,
      topic,
      score,
      totalQuestions,
      correctAnswers
    });

    await attempt.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('quiz_completed', { user: req.user._id, score });
    }

    res.status(201).json({ message: 'Quiz attempt saved successfully.', attempt });
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    res.status(500).json({ message: 'Failed to save quiz attempt.', error: error.message });
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    const history = await QuizAttempt.find({ user: req.user._id }).sort({ completedAt: -1 });
    res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({ message: 'Failed to fetch quiz history.', error: error.message });
  }
});

module.exports = router;