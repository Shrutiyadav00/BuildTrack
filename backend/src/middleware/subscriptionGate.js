const Subscription = require('../models/Subscription');
const { getOrgId } = require('./auth');

/**
 * requireActiveSubscription
 * ─────────────────────────
 * Blocks any request if the organization's subscription is expired or missing.
 * Returns HTTP 402 with code: 'SUBSCRIPTION_EXPIRED' so the frontend can
 * redirect to the upgrade page.
 *
 * Apply AFTER protect(). Do NOT apply on:
 *   /api/auth/*        — login must work even if expired
 *   /api/subscription  — must be able to upgrade even if expired
 */
exports.requireActiveSubscription = async (req, res, next) => {
  try {
    const orgId = getOrgId(req.user);
    const sub   = await Subscription.findOne({ owner: orgId });

    if (!sub) {
      return res.status(402).json({
        success: false,
        code:    'SUBSCRIPTION_EXPIRED',
        message: 'No active subscription found. Please subscribe to continue.',
      });
    }

    // Auto-mark as expired in DB if end date passed (lazy expiry)
    if (sub.status === 'active' && new Date() > sub.endDate) {
      sub.status = 'expired';
      await sub.save();
    }

    if (sub.status !== 'active' || new Date() > sub.endDate) {
      return res.status(402).json({
        success:   false,
        code:      'SUBSCRIPTION_EXPIRED',
        message:   'Your subscription has expired. Please renew to continue.',
        plan:      sub.plan,
        endDate:   sub.endDate,
      });
    }

    // Attach subscription to request so controllers can read plan if needed
    req.subscription = sub;
    next();
  } catch (err) {
    next(err);
  }
};
