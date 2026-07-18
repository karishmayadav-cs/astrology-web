const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userKey: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  dob: { type: String, required: true },
  tob: { type: String, required: true },
  pob: { type: String, required: true },
  tz: { type: Number },
  gender: { type: String, default: 'male' },
  isBirthTimeApprox: { type: Boolean, default: false },
  lagna: { type: Object },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true, strict: false });

module.exports = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
