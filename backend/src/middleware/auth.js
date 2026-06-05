const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
  if (!req.user.isActive) return res.status(401).json({ success: false, message: 'Account is deactivated' });
  next();
};

// Generic role checker — use role group helpers below instead of this directly
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Not authorized for this action' });
  }
  next();
};

// ── Role Group Helpers ──────────────────────────────────────────────────────
// Admin group: full access — finance, vendors, PO, users, subscription
exports.adminOnly = (req, res, next) => {
  if (!['super_admin', 'admin', 'owner'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Engineer and above: projects, workers, attendance, documents — no finance/vendors
exports.engineerUp = (req, res, next) => {
  if (!['super_admin', 'admin', 'owner', 'engineer', 'supervisor', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Engineer or higher access required' });
  }
  next();
};

// Client only: client portal access
exports.clientOnly = (req, res, next) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ success: false, message: 'Client access only' });
  }
  next();
};

// Worker only: worker dashboard access
exports.workerOnly = (req, res, next) => {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ success: false, message: 'Worker access only' });
  }
  next();
};

// ── Org Scoping Helper ──────────────────────────────────────────────────────
// Returns the organization owner's _id for scoping DB queries.
// For admin/owner: returns their own _id.
// For engineers/workers/clients: returns the admin who invited them.
exports.getOrgId = (user) => user.organizationId || user._id;
