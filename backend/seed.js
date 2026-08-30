require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const LearningPath = require('./models/LearningPath');
const Module = require('./models/Module');
const Lesson = require('./models/Lesson');
const UserProgress = require('./models/UserProgress');

const seedDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    // Clear existing
    await Course.deleteMany({});
    await LearningPath.deleteMany({});
    await Module.deleteMany({});
    await Lesson.deleteMany({});
    await UserProgress.deleteMany({});
    
    const courses = [
      {
        title: 'Introduction to Data Science with Python',
        description: 'Learn the fundamentals of Data Science using Python, Pandas, and Scikit-Learn.',
        difficulty: 'Beginner',
        duration: 20,
        provider: 'Coursera',
        category: 'Data Science',
        learningUrl: 'https://coursera.org',
        isDemoIntegration: true
      },
      {
        title: 'Advanced Machine Learning Architectures',
        description: 'Deep dive into Neural Networks, Transformers, and LLM fine-tuning.',
        difficulty: 'Advanced',
        duration: 40,
        provider: 'Udacity',
        category: 'Artificial Intelligence',
        learningUrl: 'https://udacity.com',
        isDemoIntegration: true
      },
      {
        title: 'Full-Stack Web Development with React',
        description: 'Master the MERN stack and build production-ready applications.',
        difficulty: 'Intermediate',
        duration: 35,
        provider: 'Udemy',
        category: 'Web Development',
        learningUrl: 'https://udemy.com',
        isDemoIntegration: true
      },
      {
        title: 'Cybersecurity Fundamentals',
        description: 'Understand the basics of network security, cryptography, and risk management.',
        difficulty: 'Beginner',
        duration: 15,
        provider: 'edX',
        category: 'Security',
        learningUrl: 'https://edx.org',
        isDemoIntegration: true
      }
    ];

    await Course.insertMany(courses);

    // Create Learning Path
    const path = new LearningPath({
      title: "Foundations of Study",
      description: "Build your skills through structured modules and practical learning.",
      type: "Foundation"
    });
    await path.save();

    // Module 1
    const mod1 = new Module({
      learningPathId: path._id,
      number: 1,
      title: "AI and Data Fundamentals",
      description: "Build a strong foundation in artificial intelligence, data concepts, and their practical applications.",
      duration: "45 min"
    });
    await mod1.save();

    const m1l1 = new Lesson({ moduleId: mod1._id, order: 1, title: "Introduction to Artificial Intelligence", content: "Artificial Intelligence enables computer systems to perform tasks that normally require human intelligence. It can support learning, reasoning, pattern recognition, automation, and decision-making." });
    const m1l2 = new Lesson({ moduleId: mod1._id, order: 2, title: "Understanding Data", content: "Data is the foundation of modern digital systems. Information can be collected, processed, analysed, and transformed into meaningful insights that support better decisions." });
    const m1l3 = new Lesson({ moduleId: mod1._id, order: 3, title: "AI in Practical Applications", content: "AI and data technologies can improve efficiency, automate repetitive processes, identify patterns, and support structured decision-making." });
    await Lesson.insertMany([m1l1, m1l2, m1l3]);
    
    mod1.lessons = [m1l1._id, m1l2._id, m1l3._id];
    await mod1.save();

    // Module 2
    const mod2 = new Module({
      learningPathId: path._id,
      number: 2,
      title: "Practical Application Exercise",
      description: "Apply AI and data concepts through practical examples and structured exercises.",
      duration: "1.5 hrs"
    });
    await mod2.save();

    const m2l1 = new Lesson({ moduleId: mod2._id, order: 1, title: "Identifying the Problem", content: "Start by clearly understanding the problem. Define what needs improvement and identify the expected outcome before selecting a technical solution." });
    const m2l2 = new Lesson({ moduleId: mod2._id, order: 2, title: "Selecting Relevant Data", content: "Choose information that is relevant, reliable, and useful for solving the identified problem." });
    const m2l3 = new Lesson({ moduleId: mod2._id, order: 3, title: "Applying the Solution", content: "Use structured reasoning to apply the concepts learned and evaluate whether the selected approach solves the problem effectively." });
    await Lesson.insertMany([m2l1, m2l2, m2l3]);

    mod2.lessons = [m2l1._id, m2l2._id, m2l3._id];
    await mod2.save();

    // Module 3
    const mod3 = new Module({
      learningPathId: path._id,
      number: 3,
      title: "Applied AI and Decision Making",
      description: "Learn how AI and data can support structured and responsible decision-making.",
      duration: "2 hrs"
    });
    await mod3.save();

    const m3l1 = new Lesson({ moduleId: mod3._id, order: 1, title: "Data-Driven Decisions", content: "Strong decisions combine domain knowledge with relevant evidence, data analysis, and careful evaluation." });
    const m3l2 = new Lesson({ moduleId: mod3._id, order: 2, title: "Evaluating AI Results", content: "AI-generated recommendations should always be evaluated for relevance, accuracy, fairness, and possible limitations." });
    const m3l3 = new Lesson({ moduleId: mod3._id, order: 3, title: "Applied Decision Scenario", content: "Use the concepts from the complete learning path to evaluate a practical situation and select an appropriate solution." });
    await Lesson.insertMany([m3l1, m3l2, m3l3]);

    mod3.lessons = [m3l1._id, m3l2._id, m3l3._id];
    await mod3.save();

    path.modules = [mod1._id, mod2._id, mod3._id];
    await path.save();

    console.log("Database seeded successfully with courses and learning paths.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedDB();
