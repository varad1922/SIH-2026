const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  score: { type: Number, required: true }, // out of 100
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
