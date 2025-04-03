const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ChatSchema = new mongoose.Schema({
  chatID: { type: String, required: true, unique: true },
  participant1: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'participant1Model',
    required: true
  },
  participant1Model: { type: String, enum: ['Rider', 'Driver'], required: true },
  participant2: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'participant2Model',
    required: true
  },
  participant2Model: { type: String, enum: ['Admin', 'Driver'], required: true },
  messageHistory: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, required: true },
      message: { type: String },
      timestamp: { type: Date, default: Date.now },
      attachments: [{ type: String }]
    }
  ]
});

module.exports = mongoose.model('Chat', ChatSchema);
