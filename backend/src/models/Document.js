const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema({
  versionNumber: Number,
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  status: { type: String, enum: ['for_review', 'issued_for_construction', 'superseded', 'void'], default: 'for_review' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
  notes: String
});

const DocumentSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['drawing', 'layout', 'structural', 'mep', 'boq', 'contract', 'permit', 'photo', 'inspection', 'other'], default: 'other' },
  versions: [VersionSchema],
  activeVersion: { type: Number, default: 1 },
  sharedWithClient: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
