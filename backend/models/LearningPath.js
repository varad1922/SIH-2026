const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String }, // e.g., 'Foundation', 'Core Skill', 'Advanced'
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }]
}, { timestamps: true });

module.exports = mongoose.model('LearningPath', learningPathSchema);
