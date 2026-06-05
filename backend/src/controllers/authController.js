const jwt          = require('jsonwebtoken');
const User         = require('../models/User');
const Subscription = require('../models/Subscription');
const { PLAN_DURATIONS } = require('../models/Subscription');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// Consistent user payload returned in all auth responses
const userPayload = (user, subscription = null) => ({
  _id:            user._id,
  name:           user.name,
  email:          user.email,
  phone:          user.phone,
  role:           user.role,
  company:        user.company,
  organizationId: user.organizationId,
  bankDetails:    user.bankDetails,
  isActive:       user.isActive,
  subscription:   subscription ? {
    plan:          subscription.plan,
    status:        subscription.status,
    endDate:       subscription.endDate,
    daysRemaining: subscription.daysRemaining,
    isActive:      subscription.isActive,
    trialUsed:     subscription.trialUsed,
  } : null,
});

// Helper: fetch subscription for a user's org
const getSubForUser = async (user) => {
  const orgId = user.organizationId || user._id;
  return Subscription.findOne({ owner: orgId });
};

exports.register = async (req, res) => {
  const { name, email, phone, company, password, role } = req.body;

  // Create user — organizationId will be set to own _id just after
  const user = await User.create({ name, email, phone, company, password, role });

  // Self-org: admin/owner's organizationId points to themselves
  user.organizationId = user._id;
  await user.save();

  // Auto-create free trial subscription (30 days) for new admin registrations
  const now     = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + PLAN_DURATIONS.trial);

  const subscription = await Subscription.create({
    owner:     user._id,
    plan:      'trial',
    status:    'active',
    startDate: now,
    endDate,
    trialUsed: true,
  });

  const token = signToken(user._id);
  res.status(201).json({ success: true, token, user: userPayload(user, subscription) });
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
  const sub   = await getSubForUser(user);
  const token = signToken(user._id);
  res.json({ success: true, token, user: userPayload(user, sub) });
};

exports.getMe = async (req, res) => {
  const sub = await getSubForUser(req.user);
  res.json({ success: true, user: userPayload(req.user, sub) });
};

exports.updateProfile = async (req, res) => {
  // Allow updating name, phone, company, and bank details (for admin users)
  const { name, phone, company, bankDetails } = req.body;
  const updates = { name, phone, company };
  if (bankDetails) updates.bankDetails = bankDetails;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json({ success: true, user: userPayload(user) });
};
