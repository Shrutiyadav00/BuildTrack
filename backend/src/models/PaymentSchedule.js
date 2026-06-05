const mongoose = require('mongoose');

const PaymentScheduleSchema = new mongoose.Schema({
  project:  { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  owner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },

  milestoneName:     { type: String, required: true },
  amount:            { type: Number, required: true },
  currency:          { type: String, default: 'INR' },
  dueDate:           { type: Date },
  percentOfContract: { type: Number }, // auto-calculated when possible

  status: {
    type:    String,
    enum:    ['pending', 'requested', 'received'],
    default: 'pending',
  },

  requestedAt: { type: Date },
  receivedAt:  { type: Date },
  notes:       { type: String },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receivedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('PaymentSchedule', PaymentScheduleSchema);
