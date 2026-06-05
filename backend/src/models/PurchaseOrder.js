const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  qty:   { type: Number, required: true },
  unit:  { type: String, default: 'nos' }, // bags, kg, sqft, rft, liters, nos
  rate:  { type: Number, required: true },
  total: { type: Number },                 // qty * rate, set on save
}, { _id: false });

const PurchaseOrderSchema = new mongoose.Schema({
  owner:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  vendor:  { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor',  required: true },

  poNumber:    { type: String, unique: true }, // PO-YYYY-NNNN — auto-generated
  items:       [LineItemSchema],
  subtotal:    { type: Number, default: 0 },
  tax:         { type: Number, default: 0 },   // in rupees (not %)
  totalAmount: { type: Number, required: true },
  currency:    { type: String, default: 'INR' },

  category: {
    type: String,
    enum: ['structure', 'labour', 'mep', 'finishing', 'misc'],
    default: 'misc',
  },

  status: {
    type: String,
    enum: ['draft', 'sent', 'unpaid', 'paid'],
    default: 'draft',
  },

  privateMode:  { type: Boolean, default: false }, // hide vendor bank details from client
  sentToVendor: { type: Boolean, default: false },
  sentToClient: { type: Boolean, default: false },
  pdfPath:      { type: String },
  paidAt:       { type: Date },
  notes:        { type: String },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-compute item totals before save
PurchaseOrderSchema.pre('save', function () {
  this.items.forEach(item => { item.total = item.qty * item.rate; });
  this.subtotal    = this.items.reduce((s, i) => s + i.total, 0);
  this.totalAmount = this.subtotal + (this.tax || 0);
});

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
