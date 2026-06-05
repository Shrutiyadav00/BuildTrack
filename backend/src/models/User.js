const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  phone:    { type: String },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     {
    type: String,
    enum: ['super_admin', 'admin', 'owner', 'manager', 'engineer', 'supervisor', 'worker', 'client'],
    default: 'owner',
  },
  company:  { type: String },
  avatar:   { type: String },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  isActive: { type: Boolean, default: true },

  // Org scoping — points to the admin/owner who created this user.
  // For admin/owner users this equals their own _id (set on register).
  // For invited engineers/workers/clients this is the admin's _id.
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // For 'client' role only — which project they can access
  clientProjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },

  // Builder's bank details — shown to clients so they can make payments easily
  bankDetails: {
    accountHolderName: { type: String },
    bankName:          { type: String },
    accountNumber:     { type: String },
    ifscCode:          { type: String },
    upiId:             { type: String },
  },
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);
