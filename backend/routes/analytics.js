const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const UserProgress = require('../models/UserProgress');
const QuizAttempt = require('../models/QuizAttempt');

router.get('/overview', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const progress = await UserProgress.find({ user: userId });
    const quizAttempts = await QuizAttempt.find({ user: userId });

    const totalModulesAttempted = progress.length;
    const completedModules = progress.filter(p => p.status === 'Completed').length;
    
    // Average Quiz Score
    let avgScore = 0;
    if (quizAttempts.length > 0) {
      const sum = quizAttempts.reduce((acc, curr) => acc + curr.score, 0);
      avgScore = Math.round(sum / quizAttempts.length);
    }

    // Learning Hours (estimate based on progress: 0.5 hours per lesson)
    const totalCompletedLessons = progress.reduce((acc, curr) => acc + curr.completedLessons.length, 0);
    const learningHours = Math.round(totalCompletedLessons * 0.5);

    // Badges (1 badge per completed module)
    const badges = completedModules;

    // We'll treat a "Course" as a LearningPath, but for stats we can use completed modules
    res.json({
      completionPercentage: totalModulesAttempted > 0 ? Math.round((completedModules / totalModulesAttempted) * 100) : 0,
      learningHours,
      coursesCompleted: completedModules, 
      skillBadges: badges,
      averageScore: avgScore,
      quizCount: quizAttempts.length
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics.' });
  }
});

module.exports = router;
