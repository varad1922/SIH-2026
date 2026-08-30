const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Mock data to avoid database schema bloat for now, as requested.
const mockModulesData = {
  "101": {
    _id: "101",
    moduleNumber: 1,
    title: "Introduction and Overview",
    description: "Build a strong base in your chosen field. This module covers all the prerequisite knowledge you need.",
    duration: "45 min",
    content: {
      overview: "Welcome to your first step toward mastery. In this module, we introduce the fundamental concepts of your chosen field and explain why these building blocks are so critical for your long-term success.",
      objectives: [
        "Understand the high-level goals of this learning path.",
        "Identify the primary tools and concepts required.",
        "Establish a daily study routine."
      ],
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
      ],
      keyTakeaways: [
        "Patience is key in the beginning stages.",
        "Always connect new concepts back to the fundamentals."
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
      objectives: [
        "Memorize at least 20 key industry terms.",
        "Understand how basic concepts interlock to form complex systems."
      ],
      keyConcepts: [
        { title: "Standardization", description: "Why industries agree on specific terminology to avoid confusion." }
      ],
      studyMaterial: [
        { heading: "The Importance of Vocabulary", content: "When communicating with a team, precision matters. Using the correct terminology ensures that everyone is on the same page and reduces the likelihood of catastrophic errors." }
      ],
      importantTerms: [
        { term: "Abstraction", definition: "The process of removing physical, spatial, or temporal details or attributes in the study of objects or systems to focus attention on details of greater importance." },
        { term: "Modularity", definition: "The degree to which a system's components may be separated and recombined." }
      ],
      examples: [
        { title: "Medical Jargon", description: "Just as doctors use specific Latin terms to communicate precisely about the human body, engineers use specific terms to discuss system architecture." }
      ],
      keyTakeaways: [
        "Memorization is only the first step; application is where true understanding happens.",
        "Don't be afraid to ask for clarification if you don't understand a term."
      ]
    }
  },
  "103": {
    _id: "103",
    moduleNumber: 3,
    title: "Fundamental Frameworks",
    description: "Understand the structures that support modern applications.",
    duration: "2 hrs",
    content: {
      overview: "Frameworks provide a standard way to build and deploy applications. In this module, we will explore the most popular fundamental frameworks and how they abstract away repetitive tasks.",
      objectives: [
        "Identify the purpose of a framework.",
        "Compare and contrast two major industry frameworks.",
        "Understand the concept of 'Inversion of Control'."
      ],
      keyConcepts: [
        { title: "Don't Repeat Yourself (DRY)", description: "A principle of software development aimed at reducing repetition of software patterns." },
        { title: "Inversion of Control", description: "A design principle in which custom-written portions of a computer program receive the flow of control from a generic framework." }
      ],
      studyMaterial: [
        { heading: "Why Use Frameworks?", content: "Imagine building a car from scratch. You would have to mine the metal, forge the engine, and mold the tires. Frameworks are like buying a pre-built chassis; you only need to focus on customizing the body and the interior. They save time, reduce bugs, and enforce best practices." }
      ],
      importantTerms: [
        { term: "Library vs Framework", definition: "You call a library, but a framework calls you." },
        { term: "Boilerplate", definition: "Sections of code that have to be included in many places with little or no alteration." }
      ],
      examples: [
        { title: "React", description: "A popular JavaScript library for building user interfaces, often used alongside frameworks like Next.js." }
      ],
      keyTakeaways: [
        "Frameworks dictate the architecture of your application.",
        "Understanding the underlying language is crucial before learning a framework."
      ]
    }
  }
};

// GET /api/learning-path/:pathId/modules/:moduleId
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

module.exports = router;
