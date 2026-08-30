const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String },
  difficultyLevel: { type: String, enum: ['Easy', 'Medium', 'Hard'] }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
