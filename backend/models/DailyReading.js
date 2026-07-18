const mongoose = require('mongoose');

const dailyReadingSchema = new mongoose.Schema({
  userKey: { type: String, required: true, index: true },
  cacheKey: { type: String, required: true },
  date: { type: String, required: true },
  currentLocation: { type: String },
  transitHouses: { type: Object },
  horoscope: { type: Object },
  isAIEnhanced: { type: Boolean, default: false }
}, { timestamps: true, strict: false });

dailyReadingSchema.index({ userKey: 1, cacheKey: 1 }, { unique: true });

module.exports = mongoose.models.DailyReading || mongoose.model('DailyReading', dailyReadingSchema);
