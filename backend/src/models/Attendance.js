const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'half_day', 'overtime'], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: { lat: Number, lng: Number },
  isRemote: { type: Boolean, default: false },
  notes: String,
  editHistory: [{
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    oldStatus: String,
    newStatus: String,
    reason: String,
    editedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

AttendanceSchema.index({ project: 1, worker: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
