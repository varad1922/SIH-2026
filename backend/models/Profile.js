const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String },
  designation: { type: String },
  jobRole: { type: String },
  currentAssignment: { type: String },
  educationalQualification: { type: String },
  workExperience: { type: Number }, // in years
  previousTraining: [{ type: String }],
  careerGoals: { type: String },
  competencies: [{
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
