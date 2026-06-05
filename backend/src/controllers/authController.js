const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// Consistent user payload returned in all auth responses
const userPayload = (user) => ({
  _id:            user._id,
  name:           user.name,
  email:          user.email,
  phone:          user.phone,
  role:           user.role,
  company:        user.company,
  organizationId: user.organizationId,
  bankDetails:    user.bankDetails,
  isActive:       user.isActive,
});

exports.register = async (req, res) => {
  const { name, email, phone, company, password, role } = req.body;

  // Create user — organizationId will be set to own _id just after
  const user = await User.create({ name, email, phone, company, password, role });

  // Self-org: admin/owner's organizationId points to themselves
  user.organizationId = user._id;
  await user.save();

  const token = signToken(user._id);
  res.status(201).json({ success: true, token, user: userPayload(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account is deactivated. Contact your admin.' });
  }
  const token = signToken(user._id);
  res.json({ success: true, token, user: userPayload(user) });
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: userPayload(req.user) });
};

exports.updateProfile = async (req, res) => {
  // Allow updating name, phone, company, and bank details (for admin users)
  const { name, phone, company, bankDetails } = req.body;
  const updates = { name, phone, company };
  if (bankDetails) updates.bankDetails = bankDetails;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json({ success: true, user: userPayload(user) });
};
