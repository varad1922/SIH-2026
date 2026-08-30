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
      { id: 101, title: "Introduction and Overview", duration: "45 min" },
      { id: 102, title: "Basic Concepts & Terminology", duration: "1.5 hrs" },
      { id: 103, title: "Fundamental Frameworks", duration: "2 hrs" }
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
    title: "Introduction and Overview",
    description: "Build a strong base in your chosen field. This module covers all the prerequisite knowledge you need.",
    duration: "45 min",
    content: {
      overview: "Welcome to your first step toward mastery. In this module, we introduce the fundamental concepts of your chosen field and explain why these building blocks are so critical for your long-term success.",
      objectives: ["Understand the high-level goals of this learning path.", "Identify the primary tools and concepts required.", "Establish a daily study routine."],
      keyConcepts: [
        { title: "The Learning Mindset", description: "Approaching problems with curiosity rather than frustration." },
        { title: "Iterative Mastery", description: "Learning small chunks of information repeatedly over time." }
      ],
      studyMaterial: [
        { heading: "Why This Matters", content: "Before diving into complex theories, it's essential to understand the 'why'. The concepts learned here will act as the foundation for everything you build later. Without a solid understanding of the basics, advanced topics will feel overwhelming and disconnected." }
      ],
      importantTerms: [
        { term: "Prerequisite", definition: "A thing that is required as a prior condition for something else to happen or exist." },
        { term: "Foundation", definition: "An underlying basis or principle." }
      ],
      examples: [
        { title: "The House Metaphor", description: "You cannot build the roof of a house before laying the foundation. Similarly, you cannot master advanced frameworks without first understanding basic variables and logic." }
      ]
    }
  },
  "102": {
    _id: "102",
    moduleNumber: 2,
    title: "Basic Concepts & Terminology",
    description: "Learn the shared language of professionals in your field.",
    duration: "1.5 hrs",
    content: {
      overview: "Every industry has its own language. This module will introduce you to the core vocabulary and basic concepts that you will use daily in your career.",
      objectives: ["Memorize at least 20 key industry terms.", "Understand how basic concepts interlock to form complex systems."],
      keyConcepts: [{ title: "Standardization", description: "Why industries agree on specific terminology to avoid confusion." }],
      studyMaterial: [{ heading: "The Importance of Vocabulary", content: "When communicating with a team, precision matters. Using the correct terminology ensures that everyone is on the same page and reduces the likelihood of catastrophic errors." }],
      importantTerms: [{ term: "Abstraction", definition: "The process of removing physical, spatial, or temporal details or attributes." }],
      examples: [{ title: "Medical Jargon", description: "Just as doctors use specific Latin terms to communicate precisely, engineers use specific terms to discuss system architecture." }]
    }
  },
  "103": {
    _id: "103",
    moduleNumber: 3,
    title: "Fundamental Frameworks",
    description: "Understand the structures that support modern applications.",
    duration: "2 hrs",
    content: {
      overview: "Frameworks provide a standard way to build and deploy applications. In this module, we will explore the most popular fundamental frameworks.",
      objectives: ["Identify the purpose of a framework.", "Compare and contrast two major industry frameworks."],
      keyConcepts: [{ title: "Don't Repeat Yourself (DRY)", description: "A principle of software development aimed at reducing repetition of software patterns." }],
      studyMaterial: [{ heading: "Why Use Frameworks?", content: "Frameworks are like buying a pre-built chassis; you only need to focus on customizing the body and the interior. They save time, reduce bugs, and enforce best practices." }],
      importantTerms: [{ term: "Library vs Framework", definition: "You call a library, but a framework calls you." }],
      examples: [{ title: "React", description: "A popular JavaScript library for building user interfaces, often used alongside frameworks like Next.js." }]
    }
  },
  // Path 2 Modules
  "201": {
    _id: "201",
    moduleNumber: 1,
    title: "Intermediate Techniques",
    description: "Move beyond the basics to start solving real problems.",
    duration: "2 hrs",
    content: {
      overview: "This module covers intermediate techniques required for professional work.",
      objectives: ["Apply techniques to real-world scenarios."],
      studyMaterial: [{ heading: "Application over Theory", content: "Now that you know the basics, it's time to build." }]
    }
  },
  "202": {
    _id: "202",
    moduleNumber: 2,
    title: "Practical Application Exercise",
    description: "A hands-on exercise.",
    duration: "3 hrs",
    content: {
      overview: "Put your skills to the test.",
      objectives: ["Complete a guided project."],
      studyMaterial: [{ heading: "Project Scope", content: "You will build a full application from start to finish." }]
    }
  },
  "203": {
    _id: "203",
    moduleNumber: 3,
    title: "Advanced Theory",
    description: "Theoretical underpinnings of complex systems.",
    duration: "2.5 hrs",
    content: {
      overview: "Deep dive into computer science theory.",
      objectives: ["Understand algorithmic complexity."],
      studyMaterial: [{ heading: "Big O Notation", content: "Understanding performance." }]
    }
  },
  // Path 3 Modules
  "301": {
    _id: "301",
    moduleNumber: 1,
    title: "Capstone Briefing",
    description: "Preparation for your final project.",
    duration: "1 hr",
    content: {
      overview: "Review the requirements for your capstone project.",
      objectives: ["Submit a project proposal."],
      studyMaterial: [{ heading: "Choosing a Project", content: "Select a project that demonstrates your mastery." }]
    }
  },
  "302": {
    _id: "302",
    moduleNumber: 2,
    title: "Project Execution",
    description: "Build your capstone project.",
    duration: "10 hrs",
    content: {
      overview: "Execute your project plan.",
      objectives: ["Build and deploy your project."],
      studyMaterial: [{ heading: "Execution Phase", content: "Focus on writing clean, maintainable code." }]
    }
  },
  "303": {
    _id: "303",
    moduleNumber: 3,
    title: "Final Review",
    description: "Review and polish your project.",
    duration: "1 hr",
    content: {
      overview: "Prepare your project for presentation.",
      objectives: ["Refactor code.", "Write documentation."],
      studyMaterial: [{ heading: "The Polish", content: "Documentation and testing are what separate professionals from amateurs." }]
    }
  }
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
        status: progress ? progress.status : 'Not Started'
      };
    });

    // Calculate overall progress percentage based on completed/reviewed modules
    const completedCount = modulesWithProgress.filter(m => m.status === 'Completed' || m.status === 'Reviewed').length;
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
// Fetch specific module content
router.get('/:pathId/modules/:moduleId', protect, (req, res) => {
  try {
    const { moduleId } = req.params;
    const moduleData = mockModulesData[moduleId];
    
    if (!moduleData) {
      return res.status(404).json({ message: 'Module material not found.' });
    }

    res.json({ module: moduleData });
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

    if (!['Not Started', 'In Progress', 'Completed', 'Reviewed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    // Upsert the progress record
    const progress = await UserProgress.findOneAndUpdate(
      { user: req.user._id, pathId, moduleId },
      { status, lastAccessed: Date.now() },
      { new: true, upsert: true }
    );

    res.json({ message: 'Status updated successfully', progress });
  } catch (error) {
    console.error('Error updating module status:', error);
    res.status(500).json({ message: 'Server Error updating module status.' });
  }
});

module.exports = router;
