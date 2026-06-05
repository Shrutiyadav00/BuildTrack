const Notification = require('../models/Notification');

/**
 * notify({ recipientId, type, title, message, relatedProject, relatedEntity })
 *
 * Lightweight helper imported by controllers to create in-app notifications.
 * Fire-and-forget — errors are swallowed so they never break the main request.
 *
 * @example
 *   await notify({ recipientId: project.owner, type:'po_paid',
 *     title:'PO Paid', message:`PO-2026-0001 marked as paid`, relatedProject: project._id });
 */
module.exports = async function notify({ recipientId, type = 'general', title, message, relatedProject, relatedEntity }) {
  try {
    if (!recipientId || !title || !message) return;
    await Notification.create({ recipient: recipientId, type, title, message, relatedProject, relatedEntity });
  } catch (err) {
    // Never let notification errors crash the main flow
    console.error('[notify] error:', err.message);
  }
};
