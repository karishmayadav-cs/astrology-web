const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userKey: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, required: true },
  rating: { type: mongoose.Schema.Types.Mixed },
  detail: { type: String, default: '' },
  date: { type: String, default: null }
}, { timestamps: true, strict: false });

module.exports = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
