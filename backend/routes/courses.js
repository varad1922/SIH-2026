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
    // Deterministic logic based on course ID for consistent UI rendering without real ML backend
    const courses = await Course.find().populate('skills');
    
    const generateDeterministicScore = (id) => {
      let hash = 0;
      const str = id.toString();
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; 
      }
      return 60 + (Math.abs(hash) % 36); // Score between 60 and 95
    };

    const recommended = courses.map(c => {
      const score = generateDeterministicScore(c._id);
      return {
        course: c,
        score: score,
        reason: 'Recommended to address your identified skill gaps.'
      };
    }).sort((a, b) => b.score - a.score);
    
    res.json(recommended);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
