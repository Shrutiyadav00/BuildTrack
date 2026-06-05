const mongoose = require('mongoose');

const SiteDiarySchema = new mongoose.Schema({
  project:        { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  date:           { type: Date, required: true },
  reportedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weather:        { type: String, enum: ['sunny', 'cloudy', 'rainy', 'hot', 'windy'] },
  workDone:       { type: String, required: true },
  workersPresent: { type: Number, default: 0 },
  issues:         { type: String },
  materials:      { type: String },
  nextDayPlan:    { type: String },
  photos:         [{ url: String, caption: String }],
}, { timestamps: true });

// Compound index: sort by project + date descending
SiteDiarySchema.index({ project: 1, date: -1 });

// Unique entry per project per date
SiteDiarySchema.index({ project: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('SiteDiary', SiteDiarySchema);
