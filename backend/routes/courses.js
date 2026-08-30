const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('skills');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/recommendations', async (req, res) => {
  try {
    // Basic mock logic for prototype, we return all courses sorted randomly
    const courses = await Course.find().populate('skills');
    const recommended = courses.map(c => ({
      course: c,
      score: Math.floor(Math.random() * 100),
      reason: 'Based on your skill gap'
    })).sort((a, b) => b.score - a.score);
    res.json(recommended);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
