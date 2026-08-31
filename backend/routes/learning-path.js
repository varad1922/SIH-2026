const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const LearningPath = require('../models/LearningPath');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const UserProgress = require('../models/UserProgress');

// GET /api/learning-path
// Fetch all learning paths with high-level user progress
router.get('/', protect, async (req, res) => {
  try {
    const paths = await LearningPath.find().populate('modules');
    const userProgress = await UserProgress.find({ user: req.user._id });

    const pathsWithProgress = paths.map(path => {
      const modulesWithProgress = path.modules.map(mod => {
        const progress = userProgress.find(p => p.moduleId === mod._id.toString());
        return {
          id: mod._id,
          number: mod.number,
          title: mod.title,
          description: mod.description,
          duration: mod.duration,
          status: progress ? progress.status : 'Not Started'
        };
      });

      const completedCount = modulesWithProgress.filter(m => m.status === 'Completed').length;
      const progressPercentage = path.modules.length > 0 ? Math.round((completedCount / path.modules.length) * 100) : 0;

      return {
        id: path._id,
        title: path.title,
        description: path.description,
        type: path.type,
        progress: progressPercentage,
        modules: modulesWithProgress
      };
    });

    res.json(pathsWithProgress);
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    res.status(500).json({ message: 'Server Error fetching learning paths.' });
  }
});

// GET /api/learning-path/:pathId
// Fetch specific learning path details merged with user progress
router.get('/:pathId', protect, async (req, res) => {
  try {
    const { pathId } = req.params;
    const path = await LearningPath.findById(pathId).populate('modules');
    
    if (!path) {
      return res.status(404).json({ message: 'Learning Path not found.' });
    }

    const userProgress = await UserProgress.find({ user: req.user._id, pathId });

    const modulesWithProgress = path.modules.map(mod => {
      const progress = userProgress.find(p => p.moduleId === mod._id.toString());
      return {
        id: mod._id,
        number: mod.number,
        title: mod.title,
        description: mod.description,
        duration: mod.duration,
        status: progress ? progress.status : 'Not Started',
        currentLessonId: progress ? progress.currentLessonId : null,
        completedLessons: progress ? progress.completedLessons : []
      };
    });

    const completedCount = modulesWithProgress.filter(m => m.status === 'Completed').length;
    const overallProgress = path.modules.length > 0 ? Math.round((completedCount / path.modules.length) * 100) : 0;

    res.json({
      path: {
        id: path._id,
        title: path.title,
        description: path.description,
        type: path.type,
        progress: overallProgress,
        modules: modulesWithProgress
      }
    });
  } catch (error) {
    console.error('Error fetching learning path:', error);
    res.status(500).json({ message: 'Server Error fetching learning path.' });
  }
});

// GET /api/learning-path/:pathId/modules/:moduleId
// Fetch specific module content and progress
router.get('/:pathId/modules/:moduleId', protect, async (req, res) => {
  try {
    const { pathId, moduleId } = req.params;
    const mod = await Module.findOne({ _id: moduleId, learningPathId: pathId }).populate('lessons');
    
    if (!mod) {
      return res.status(404).json({ message: 'Module material not found.' });
    }

    const progress = await UserProgress.findOne({ user: req.user._id, pathId, moduleId });

    const formattedLessons = mod.lessons
      .sort((a, b) => a.order - b.order)
      .map(lesson => ({
        id: lesson._id,
        title: lesson.title,
        order: lesson.order,
        content: lesson.content
      }));

    res.json({ 
      module: {
        id: mod._id,
        moduleNumber: mod.number,
        title: mod.title,
        description: mod.description,
        duration: mod.duration,
        lessons: formattedLessons
      },
      progress: progress ? {
        status: progress.status,
        currentLessonId: progress.currentLessonId,
        completedLessons: progress.completedLessons
      } : {
        status: 'Not Started',
        currentLessonId: null,
        completedLessons: []
      }
    });
  } catch (error) {
    console.error('Error fetching module material:', error);
    res.status(500).json({ message: 'Server Error fetching module material.' });
  }
});

// POST /api/learning-path/:pathId/modules/:moduleId/status
// Update module status (start, unreview, etc.)
router.post('/:pathId/modules/:moduleId/status', protect, async (req, res) => {
  try {
    const { pathId, moduleId } = req.params;
    const { status } = req.body;

    if (!['Not Started', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const updateData = { status, lastAccessed: Date.now() };
    
    // If resetting to Not Started, clear lessons
    if (status === 'Not Started') {
      updateData.completedLessons = [];
      updateData.currentLessonId = null;
    }

    const progress = await UserProgress.findOneAndUpdate(
      { user: req.user._id, pathId, moduleId },
      updateData,
      { new: true, upsert: true }
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('progress_updated', { user: req.user._id, type: 'module_status' });
    }

    res.json({ message: 'Status updated successfully', progress });
  } catch (error) {
    console.error('Error updating module status:', error);
    res.status(500).json({ message: 'Server Error updating module status.' });
  }
});

// POST /api/learning-path/:pathId/modules/:moduleId/lessons/:lessonId/complete
// Complete a lesson and potentially update module status
router.post('/:pathId/modules/:moduleId/lessons/:lessonId/complete', protect, async (req, res) => {
  try {
    const { pathId, moduleId, lessonId } = req.params;
    const { nextLessonId } = req.body; 

    let progress = await UserProgress.findOne({ user: req.user._id, pathId, moduleId });
    
    if (!progress) {
      progress = new UserProgress({ user: req.user._id, pathId, moduleId, status: 'In Progress' });
    }

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }
    
    progress.currentLessonId = nextLessonId || null;

    const mod = await Module.findById(moduleId);
    if (mod && progress.completedLessons.length >= mod.lessons.length) {
      if (progress.status === 'In Progress' || progress.status === 'Not Started') {
        progress.status = 'Completed';
      }
    } else {
      if (progress.status === 'Not Started') {
        progress.status = 'In Progress';
      }
    }

    progress.lastAccessed = Date.now();
    await progress.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('progress_updated', { user: req.user._id, type: 'lesson_completed' });
    }

    res.json({ message: 'Lesson completed', progress });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({ message: 'Server Error completing lesson.' });
  }
});

// POST /api/learning-path/:pathId/modules/:moduleId/lessons/:lessonId/generate-notes
// Generate comprehensive notes for a lesson using AI
router.post('/:pathId/modules/:moduleId/lessons/:lessonId/generate-notes', protect, async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'AI API Key is missing. Cannot generate notes.' });
    }

    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are an expert educational course creator for the Skill Intel platform. 
Generate a comprehensive, highly detailed study guide from scratch for a lesson titled: "${lesson.title}".
Assume the learner is starting from scratch and needs a proper, in-depth explanation. Structure the lesson with:
1. An engaging Introduction.
2. Core Concepts explained clearly with depth.
3. Practical Real-world Examples.
4. Key Takeaways / Summary.

IMPORTANT: Return the output EXCLUSIVELY in plain HTML tags (like <h2>, <h3>, <p>, <strong>, <ul>, <li>). 
DO NOT use ANY Markdown (no asterisks **, no hashes #). Do NOT wrap your response in markdown code blocks (\`\`\`html). Just output raw HTML.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt
    });

    // Clean the response just in case Gemini wraps it in a code block despite instructions
    let generatedContent = response.text;
    generatedContent = generatedContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Update the lesson content in the database so it persists
    lesson.content = generatedContent;
    await lesson.save();

    res.json({ content: generatedContent });
  } catch (error) {
    console.error('Error generating notes:', error);
    res.status(500).json({ message: 'Server Error generating notes.' });
  }
});

// POST /api/learning-path/:pathId/modules/:moduleId/lessons/:lessonId/generate-quiz
// Generate a 10-question quiz for the lesson to pass before completion
router.post('/:pathId/modules/:moduleId/lessons/:lessonId/generate-quiz', protect, async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'AI API Key is missing. Cannot generate quiz.' });
    }

    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const plainTextContent = lesson.content ? lesson.content.replace(/<[^>]*>?/gm, '') : lesson.title;

    const prompt = `
Generate exactly 10 multiple-choice questions based on the following lesson content.

Lesson Title: "${lesson.title}"
Lesson Content: "${plainTextContent.substring(0, 3000)}"

Return ONLY valid JSON. Do not include Markdown, Code blocks, or extra text.
The result must be a JSON array of exactly 10 questions.

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
  "explanation": "Brief explanation"
}

Rules:
1. Generate exactly 10 questions.
2. Every question must have exactly 4 options.
3. correctAnswer must exactly match one item from options.
`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt
    });

    const jsonString = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const questions = JSON.parse(jsonString);

    if (!Array.isArray(questions)) {
      return res.status(500).json({ message: 'AI returned an invalid quiz format.' });
    }

    res.json({ questions });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ message: 'Server Error generating quiz.' });
  }
});

module.exports = router;
