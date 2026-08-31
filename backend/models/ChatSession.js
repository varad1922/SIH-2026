const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  messages: [
    {
      id: { type: String, required: true },
      text: { type: String, required: true },
      sender: { type: String, enum: ['user', 'bot'], required: true },
      isError: { type: Boolean, default: false }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
