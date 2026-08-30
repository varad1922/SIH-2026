const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pathId: { type: String, required: true },
  moduleId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Locked', 'Not Started', 'In Progress', 'Completed', 'Reviewed'], 
    default: 'Not Started' 
  },
  progressPercentage: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure a user has only one progress record per module per path
userProgressSchema.index({ user: 1, pathId: 1, moduleId: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);
