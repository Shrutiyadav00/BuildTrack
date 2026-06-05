const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  type: { type: String, enum: ['material_purchase', 'labour_payment', 'advance', 'misc_expense', 'client_receipt', 'refund'], required: true },
  category: { type: String, enum: ['structure', 'labour', 'mep', 'finishing', 'misc'], default: 'misc' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'PKR' },
  description: { type: String, required: true },
  vendor: String,
  invoiceNo: String,
  paymentMethod: { type: String, enum: ['cash', 'bank', 'easypaisa', 'jazzcash', 'cheque'], default: 'cash' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
  date: { type: Date, default: Date.now },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receipt: String,
  notes: String,
  poRef: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  owner:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
