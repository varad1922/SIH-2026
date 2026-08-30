const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  learningPathId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath', required: true },
  number: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String }, // e.g., '45 min'
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }]
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);
