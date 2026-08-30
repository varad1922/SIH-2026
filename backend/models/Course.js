const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
  duration: { type: Number }, // in hours
  provider: { type: String },
  category: { type: String },
  learningUrl: { type: String },
  isDemoIntegration: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
