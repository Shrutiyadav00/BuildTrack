const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  owner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:     { type: String, required: true },
  idType:   { type: String, enum: ['aadhar','pan','cnic','passport','driving_license','other'], default: 'other' },
  idNumber: { type: String },
  phone:    String,
  country:  { type: String, default: 'Pakistan' },
  trade:    { type: String, enum: ['mason','electrician','plumber','steel_fixer','helper','driver','carpenter','painter','other'], required: true },
  payType:  { type: String, enum: ['daily','weekly','monthly'], required: true },
  rate:     { type: Number, required: true },
  currency: { type: String, default: 'PKR' },
  payment:  {
    method:    { type: String, enum: ['cash','bank','upi','paytm','easypaisa','jazzcash','other'], default: 'cash' },
    accountNo: String,
    upiId:     String,
  },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  isActive: { type: Boolean, default: true },
  joinDate: { type: Date, default: Date.now },
  leftDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('Worker', WorkerSchema);
