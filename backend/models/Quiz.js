const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  sourceMaterial: { type: String }, // e.g., 'PDF Upload', 'Course Material'
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isAiGenerated: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
