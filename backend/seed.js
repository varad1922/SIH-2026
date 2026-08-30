require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

const seedDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    // Clear existing
    await Course.deleteMany({});
    
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
    console.log("Database seeded successfully with courses.");
    
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedDB();
