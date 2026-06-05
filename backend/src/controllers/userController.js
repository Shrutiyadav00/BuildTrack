const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { getOrgId } = require('../middleware/auth');

// ── GET /api/users ─────────────────────────────────────────────────────────
// List all users in the same organization
exports.getUsers = async (req, res) => {
  const orgId = getOrgId(req.user);
  const users = await User.find({
    organizationId: orgId,
    _id: { $ne: req.user._id }, // exclude self
  }).select('-password').sort('name');
  res.json({ success: true, data: users });
};

// ── GET /api/users/:id ─────────────────────────────────────────────────────
exports.getUser = async (req, res) => {
  const orgId = getOrgId(req.user);
  const user  = await User.findOne({ _id: req.params.id, organizationId: orgId }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
};

// ── POST /api/users/invite ─────────────────────────────────────────────────
// Admin invites a new user (engineer, worker, client) into their org
exports.inviteUser = async (req, res) => {
  const { name, email, phone, role, clientProjectId, tempPassword } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ success: false, message: 'name, email and role are required' });
  }

  const allowedRoles = ['engineer', 'supervisor', 'manager', 'worker', 'client'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, message: `Role must be one of: ${allowedRoles.join(', ')}` });
  }

  const orgId = getOrgId(req.user);

  // Check duplicate email
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

  const password = tempPassword || Math.random().toString(36).slice(-8) + 'A1!';

  const newUser = await User.create({
    name,
    email,
    phone,
    role,
    password,
    organizationId:  orgId,
    clientProjectId: role === 'client' ? clientProjectId : undefined,
    isActive:        true,
  });

  res.status(201).json({
    success: true,
    data: {
      _id:   newUser._id,
      name:  newUser.name,
      email: newUser.email,
      role:  newUser.role,
      isActive: newUser.isActive,
      organizationId: newUser.organizationId,
      clientProjectId: newUser.clientProjectId,
    },
    tempPassword: password, // returned once so admin can share with the user
  });
};

// ── PUT /api/users/:id ─────────────────────────────────────────────────────
// Update role, activate/deactivate, update clientProjectId
exports.updateUser = async (req, res) => {
  const orgId = getOrgId(req.user);
  const user  = await User.findOne({ _id: req.params.id, organizationId: orgId });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const { role, isActive, clientProjectId, name, phone } = req.body;
  if (role)             user.role             = role;
  if (isActive !== undefined) user.isActive   = isActive;
  if (clientProjectId)  user.clientProjectId  = clientProjectId;
  if (name)             user.name             = name;
  if (phone !== undefined) user.phone         = phone;

  await user.save();
  res.json({ success: true, data: user });
};

// ── DELETE /api/users/:id ──────────────────────────────────────────────────
// Soft-delete (deactivate)
exports.deleteUser = async (req, res) => {
  const orgId = getOrgId(req.user);
  const user  = await User.findOne({ _id: req.params.id, organizationId: orgId });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isActive = false;
  await user.save();
  res.json({ success: true, message: 'User deactivated successfully' });
};
