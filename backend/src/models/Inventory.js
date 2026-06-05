const mongoose = require('mongoose');

const StockTransactionSchema = new mongoose.Schema({
  type:        { type: String, enum: ['in', 'out'], required: true },
  quantity:    { type: Number, required: true },
  date:        { type: Date, default: Date.now },
  description: { type: String },
  recordedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: true });

const InventorySchema = new mongoose.Schema({
  project:      { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  owner:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName:     { type: String, required: true, trim: true },
  unit:         { type: String, default: 'nos' },
  currentStock: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 0 },
  transactions: [StockTransactionSchema],
}, { timestamps: true });

InventorySchema.index({ project: 1, itemName: 1 });

module.exports = mongoose.model('Inventory', InventorySchema);
