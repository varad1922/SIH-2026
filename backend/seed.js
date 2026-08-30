const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Skill = require('./models/Skill');
const Course = require('./models/Course');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Profile.deleteMany();
    await Skill.deleteMany();
    await Course.deleteMany();

    // Create Skills
    const skills = await Skill.insertMany([
      { name: 'Python', category: 'TECHNICAL', description: 'Python programming' },
      { name: 'Data Visualization', category: 'TECHNICAL', description: 'Data Viz' },
      { name: 'Leadership', category: 'BEHAVIOURAL AND MANAGERIAL', description: 'Leadership skills' },
      { name: 'Survey Design', category: 'STATISTICAL', description: 'Survey methodology' }
    ]);

    // Create Courses
    await Course.insertMany([
      { title: 'Python for Data Science', difficulty: 'Beginner', duration: 10, skills: [skills[0]._id], category: 'TECHNICAL', isDemoIntegration: true },
      { title: 'Advanced Survey Design', difficulty: 'Advanced', duration: 15, skills: [skills[3]._id], category: 'STATISTICAL', isDemoIntegration: true },
      { title: 'Leadership in Tech', difficulty: 'Intermediate', duration: 5, skills: [skills[2]._id], category: 'BEHAVIOURAL', isDemoIntegration: true }
    ]);

    // Create Users
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash('password123', salt);

    const admin = await User.create({ name: 'Admin User', email: 'admin@example.com', password: hashPassword, role: 'Admin' });
    const learner = await User.create({ name: 'Learner User', email: 'learner@example.com', password: hashPassword, role: 'Learner' });

    await Profile.create({ user: learner._id, department: 'Statistics', jobRole: 'Data Analyst' });

    console.log('Data Seeded Successfully');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

seedData();
