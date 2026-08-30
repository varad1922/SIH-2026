const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const UserProgress = require('../models/UserProgress');

const mockPathDetails = {
  1: {
    id: 1,
    title: "Foundations of Study",
    description: "Build a strong base in your chosen field. This module covers all the prerequisite knowledge you need.",
    modules: [
      { id: 101, title: "AI and Data Fundamentals", duration: "45 min" },
      { id: 102, title: "Practical Application Exercise", duration: "1.5 hrs" },
      { id: 103, title: "Applied AI and Decision Making", duration: "2 hrs" }
    ]
  },
  2: {
    id: 2,
    title: "Advanced Methods",
    description: "Deep dive into complex methodologies and practical applications.",
    modules: [
      { id: 201, title: "Intermediate Techniques", duration: "2 hrs" },
      { id: 202, title: "Practical Application Exercise", duration: "3 hrs" },
      { id: 203, title: "Advanced Theory", duration: "2.5 hrs" }
    ]
  },
  3: {
    id: 3,
    title: "Mastery Integration",
    description: "Synthesize everything you've learned into a final capstone project.",
    modules: [
      { id: 301, title: "Capstone Briefing", duration: "1 hr" },
      { id: 302, title: "Project Execution", duration: "10 hrs" },
      { id: 303, title: "Final Review", duration: "1 hr" }
    ]
  }
};

const mockModulesData = {
  // Path 1 Modules
  "101": {
    _id: "101",
    moduleNumber: 1,
    title: "AI and Data Fundamentals",
    description: "Build a strong base in your chosen field.",
    duration: "45 min",
    lessons: [
      { id: "l1", title: "Introduction to Artificial Intelligence", order: 1, content: "<h3>Introduction</h3><p>AI refers to the simulation of human intelligence...</p>" },
      { id: "l2", title: "Understanding Data", order: 2, content: "<h3>Understanding Data</h3><p>Data is the fuel for AI. It can be structured or unstructured.</p>" },
      { id: "l3", title: "Introduction to Machine Learning", order: 3, content: "<h3>Machine Learning</h3><p>Systems learn from data rather than being explicitly programmed.</p>" },
      { id: "l4", title: "Data Quality", order: 4, content: "<h3>Data Quality</h3><p>Garbage in, garbage out. The quality of your AI depends on the data.</p>" },
      { id: "l5", title: "AI in Real Life", order: 5, content: "<h3>Real Life AI</h3><p>AI is everywhere: recommendation engines, autonomous vehicles, etc.</p>" },
      { id: "l6", title: "Knowledge Check", order: 6, content: "<h3>Quiz</h3><p>Complete the knowledge check to proceed.</p>" }
    ]
  },
  "102": {
    _id: "102",
    moduleNumber: 2,
    title: "Practical Application Exercise",
    description: "Apply your data knowledge.",
    duration: "1.5 hrs",
    lessons: [
      { id: "l1", title: "Understanding the Problem", order: 1, content: "<h3>Problem Definition</h3><p>Define the scope of the problem you are trying to solve.</p>" },
      { id: "l2", title: "Preparing a Dataset", order: 2, content: "<h3>Data Prep</h3><p>Clean and format your data for ingestion.</p>" },
      { id: "l3", title: "Exploring Data", order: 3, content: "<h3>EDA</h3><p>Perform Exploratory Data Analysis (EDA).</p>" },
      { id: "l4", title: "Choosing an Approach", order: 4, content: "<h3>Model Selection</h3><p>Choose the right algorithm for the job.</p>" },
      { id: "l5", title: "Building a Solution", order: 5, content: "<h3>Implementation</h3><p>Write code to build your ML solution.</p>" },
      { id: "l6", title: "Practical Exercise", order: 6, content: "<h3>Exercise</h3><p>Submit your completed project notebook.</p>" }
    ]
  },
  "103": {
    _id: "103",
    moduleNumber: 3,
    title: "Applied AI and Decision Making",
    description: "Using AI to drive business value.",
    duration: "2 hrs",
    lessons: [
      { id: "l1", title: "AI Insights", order: 1, content: "<h3>Insights</h3><p>Translating model outputs into actionable strategies.</p>" },
      { id: "l2", title: "Data-Driven Decisions", order: 2, content: "<h3>Decision Making</h3><p>Transition from intuition to data.</p>" },
      { id: "l3", title: "Responsible AI", order: 3, content: "<h3>Ethics</h3><p>Understanding bias, fairness, and transparency.</p>" },
      { id: "l4", title: "Real-World Applications", order: 4, content: "<h3>Case Studies</h3><p>Successful AI implementations across industries.</p>" },
      { id: "l5", title: "AI Strategy", order: 5, content: "<h3>Strategy</h3><p>Building an AI roadmap for your organization.</p>" },
      { id: "l6", title: "Final Assessment", order: 6, content: "<h3>Final Quiz</h3><p>Test your knowledge of the entire path.</p>" }
    ]
  },
  // Path 2 & 3 Fallbacks
  "201": { _id: "201", moduleNumber: 1, title: "Intermediate Techniques", lessons: [{ id: "l1", title: "Lesson 1", order: 1, content: "<p>Placeholder content</p>" }] },
  "202": { _id: "202", moduleNumber: 2, title: "Practical Application Exercise", lessons: [{ id: "l1", title: "Lesson 1", order: 1, content: "<p>Placeholder content</p>" }] },
  "203": { _id: "203", moduleNumber: 3, title: "Advanced Theory", lessons: [{ id: "l1", title: "Lesson 1", order: 1, content: "<p>Placeholder content</p>" }] },
  "301": { _id: "301", moduleNumber: 1, title: "Capstone Briefing", lessons: [{ id: "l1", title: "Lesson 1", order: 1, content: "<p>Placeholder content</p>" }] },
  "302": { _id: "302", moduleNumber: 2, title: "Project Execution", lessons: [{ id: "l1", title: "Lesson 1", order: 1, content: "<p>Placeholder content</p>" }] },
  "303": { _id: "303", moduleNumber: 3, title: "Final Review", lessons: [{ id: "l1", title: "Lesson 1", order: 1, content: "<p>Placeholder content</p>" }] }
};

// GET /api/learning-path/:pathId
// Fetch learning path details merged with user progress
router.get('/:pathId', protect, async (req, res) => {
  try {
    const { pathId } = req.params;
    const path = mockPathDetails[pathId];
    
    if (!path) {
      return res.status(404).json({ message: 'Learning Path not found.' });
    }

    // Fetch user progress for this path
    const userProgress = await UserProgress.find({ user: req.user._id, pathId });

    // Merge progress into modules
    const modulesWithProgress = path.modules.map(mod => {
      const progress = userProgress.find(p => p.moduleId === mod.id.toString());
      return {
        ...mod,
        status: progress ? progress.status : 'Not Started',
        currentLessonId: progress ? progress.currentLessonId : null,
        completedLessons: progress ? progress.completedLessons : []
      };
    });

    // Calculate overall progress percentage based on completed modules
    const completedCount = modulesWithProgress.filter(m => m.status === 'Completed').length;
    const overallProgress = Math.round((completedCount / path.modules.length) * 100);

    res.json({
      path: {
        ...path,
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
    const moduleData = mockModulesData[moduleId];
    
    if (!moduleData) {
      return res.status(404).json({ message: 'Module material not found.' });
    }

    const progress = await UserProgress.findOne({ user: req.user._id, pathId, moduleId });

    res.json({ 
      module: moduleData,
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
// Update module status (start, complete, unreview, etc.)
router.post('/:pathId/modules/:moduleId/status', protect, async (req, res) => {
  try {
    const { pathId, moduleId } = req.params;
    const { status } = req.body;

    if (!['Not Started', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    // Upsert the progress record
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
    const { nextLessonId } = req.body; // Optional next lesson ID to set as current

    let progress = await UserProgress.findOne({ user: req.user._id, pathId, moduleId });
    
    if (!progress) {
      progress = new UserProgress({ user: req.user._id, pathId, moduleId, status: 'In Progress' });
    }

    // Add to completed lessons if not already there
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }
    
    // Update current lesson or null if finished
    progress.currentLessonId = nextLessonId || null;

    // Check if all lessons are completed
    const moduleData = mockModulesData[moduleId];
    if (moduleData && progress.completedLessons.length >= moduleData.lessons.length) {
      if (progress.status === 'In Progress' || progress.status === 'Not Started') {
        progress.status = 'Completed';
      }
    } else {
      // If we are progressing, ensure status is In Progress
      if (progress.status === 'Not Started') {
        progress.status = 'In Progress';
      }
    }

    progress.lastAccessed = Date.now();
    await progress.save();

    res.json({ message: 'Lesson completed', progress });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({ message: 'Server Error completing lesson.' });
  }
});

module.exports = router;
