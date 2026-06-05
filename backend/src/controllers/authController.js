const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.register = async (req, res) => {
  const { name, email, phone, company, password, role } = req.body;
  const user = await User.create({ name, email, phone, company, password, role });
  const token = signToken(user._id);
  res.status(201).json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, company: user.company } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const token = signToken(user._id);
  res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, company: user.company } });
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  const { name, phone, company } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone, company }, { new: true });
  res.json({ success: true, user });
};
