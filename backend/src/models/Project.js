const mongoose = require('mongoose');

const PhaseSchema = new mongoose.Schema({
  name: String,
  plannedStart: Date,
  plannedEnd: Date,
  actualStart: Date,
  actualEnd: Date,
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  completion: { type: Number, default: 0 }
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['residential', 'commercial', 'industrial', 'infrastructure'], required: true },
  description: String,
  address: String,
  location: { lat: Number, lng: Number },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leadEngineer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  client: { name: String, email: String, phone: String },
  budget: {
    total: { type: Number, default: 0 },
    structure: { type: Number, default: 0 },
    labour: { type: Number, default: 0 },
    mep: { type: Number, default: 0 },
    finishing: { type: Number, default: 0 },
    misc: { type: Number, default: 0 }
  },
  contractValue: { type: Number, default: 0 },
  currency: { type: String, default: 'PKR' },
  startDate: Date,
  endDate: Date,
  completion: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'], default: 'planning' },
  phases: [PhaseSchema],
  clientPortalEnabled: { type: Boolean, default: false },
  clientPortalToken:   String,

  // Login-based client user linked to this project
  clientUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Running totals of paid POs + approved transactions per category
  budgetSpent: {
    total:     { type: Number, default: 0 },
    structure: { type: Number, default: 0 },
    labour:    { type: Number, default: 0 },
    mep:       { type: Number, default: 0 },
    finishing: { type: Number, default: 0 },
    misc:      { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
