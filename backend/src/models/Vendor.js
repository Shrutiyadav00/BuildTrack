const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  owner:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName:   { type: String, required: true, trim: true },
  gstNumber:     { type: String, trim: true },
  aadharNumber:  { type: String },   // stored in full, returned masked (last 4 only)
  contactPerson: { type: String, required: true },
  email:         { type: String, trim: true, lowercase: true },
  phone:         { type: String },
  address:       { type: String },
  bankDetails: {
    accountHolderName: String,
    bankName:          String,
    accountNumber:     String,
    ifscCode:          String,
  },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', VendorSchema);
