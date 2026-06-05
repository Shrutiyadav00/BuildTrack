const Notification = require('../models/Notification');

// ── GET /api/notifications ─────────────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip  = (page - 1) * limit;

  const filter = { recipient: req.user._id };
  if (req.query.unread === 'true') filter.isRead = false;

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data:    notifications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

// ── GET /api/notifications/unread-count ────────────────────────────────────
exports.getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  res.json({ success: true, count });
};

// ── PUT /api/notifications/:id/read ────────────────────────────────────────
exports.markRead = async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true }
  );
  res.json({ success: true });
};

// ── PUT /api/notifications/read-all ────────────────────────────────────────
exports.markAllRead = async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
};

// ── DELETE /api/notifications/:id ─────────────────────────────────────────
exports.deleteNotification = async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  res.json({ success: true });
};
