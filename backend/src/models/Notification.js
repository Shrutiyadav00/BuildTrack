const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  type: {
    type: String,
    enum: [
      'task_completed', 'phase_started', 'payment_requested', 'payment_received',
      'po_created', 'po_paid', 'subscription_expiring', 'low_stock', 'document_shared',
      'user_invited', 'general',
    ],
    default: 'general',
  },

  title:          { type: String, required: true },
  message:        { type: String, required: true },
  relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  relatedEntity:  { type: String },   // generic stringified ID for PO, PaymentSchedule, etc.
  isRead:         { type: Boolean, default: false },
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
