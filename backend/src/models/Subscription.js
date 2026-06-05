const mongoose = require('mongoose');

// Plan durations in days (source of truth — not stored in DB)
const PLAN_DURATIONS = {
  trial:    30,
  basic:    90,
  standard: 180,
  premium:  365,
};

const SubscriptionSchema = new mongoose.Schema({
  // The admin/owner user this subscription belongs to (one per organization)
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  plan: {
    type: String,
    enum: ['trial', 'basic', 'standard', 'premium'],
    required: true,
  },

  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
  },

  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },

  // Prevents the same org from activating trial more than once
  trialUsed: { type: Boolean, default: false },

  // Optional payment reference (for manual payment tracking)
  paymentRef: { type: String },

  // History of plan changes
  history: [{
    plan:      String,
    startDate: Date,
    endDate:   Date,
    changedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// Virtual: days remaining (can be negative if expired)
SubscriptionSchema.virtual('daysRemaining').get(function () {
  const diff = this.endDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual: is currently active
SubscriptionSchema.virtual('isActive').get(function () {
  return this.status === 'active' && new Date() <= this.endDate;
});

SubscriptionSchema.set('toJSON', { virtuals: true });
SubscriptionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
module.exports.PLAN_DURATIONS = PLAN_DURATIONS;
