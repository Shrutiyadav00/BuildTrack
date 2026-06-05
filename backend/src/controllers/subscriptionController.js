const Subscription = require('../models/Subscription');
const { PLAN_DURATIONS } = require('../models/Subscription');
const { getOrgId } = require('../middleware/auth');

// Plan metadata sent to frontend for display
const PLAN_META = {
  trial: {
    name:        'Free Trial',
    duration:    30,
    price:       0,
    description: 'Full access for 30 days. One-time only.',
    features:    ['All modules', 'Up to 5 projects', 'Up to 10 workers', 'Email support'],
  },
  basic: {
    name:        'Basic',
    duration:    90,
    price:       2999,
    description: '3 months of full access.',
    features:    ['All modules', 'Up to 10 projects', 'Up to 30 workers', 'Email support'],
  },
  standard: {
    name:        'Standard',
    duration:    180,
    price:       4999,
    description: '6 months — best for active projects.',
    features:    ['All modules', 'Unlimited projects', 'Unlimited workers', 'Priority support'],
  },
  premium: {
    name:        'Premium',
    duration:    365,
    price:       7999,
    description: '12 months — best value.',
    features:    ['All modules', 'Unlimited everything', 'Dedicated support', 'Custom reports'],
  },
};

// ── GET /api/subscription ───────────────────────────────────────────────────
exports.getSubscription = async (req, res) => {
  const orgId = getOrgId(req.user);
  const sub   = await Subscription.findOne({ owner: orgId });

  if (!sub) {
    return res.json({
      success: true,
      data:    null,
      message: 'No subscription found',
    });
  }

  res.json({
    success: true,
    data: {
      _id:           sub._id,
      plan:          sub.plan,
      status:        sub.status,
      startDate:     sub.startDate,
      endDate:       sub.endDate,
      daysRemaining: sub.daysRemaining,
      isActive:      sub.isActive,
      trialUsed:     sub.trialUsed,
      history:       sub.history,
    },
  });
};

// ── GET /api/subscription/plans ─────────────────────────────────────────────
exports.getPlans = async (req, res) => {
  const orgId = getOrgId(req.user);
  const sub   = await Subscription.findOne({ owner: orgId });

  // Mark trial as unavailable if already used
  const plans = Object.entries(PLAN_META).map(([key, meta]) => ({
    key,
    ...meta,
    available: key === 'trial' ? !(sub?.trialUsed) : true,
  }));

  res.json({ success: true, data: plans });
};

// ── POST /api/subscription/trial ────────────────────────────────────────────
exports.activateTrial = async (req, res) => {
  const orgId = getOrgId(req.user);
  const existing = await Subscription.findOne({ owner: orgId });

  if (existing?.trialUsed) {
    return res.status(400).json({
      success: false,
      message: 'Trial has already been used for this account.',
    });
  }

  const now     = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + PLAN_DURATIONS.trial);

  let sub;
  if (existing) {
    // Re-activate (e.g. somehow lost — edge case)
    existing.plan      = 'trial';
    existing.status    = 'active';
    existing.startDate = now;
    existing.endDate   = endDate;
    existing.trialUsed = true;
    sub = await existing.save();
  } else {
    sub = await Subscription.create({
      owner:     orgId,
      plan:      'trial',
      status:    'active',
      startDate: now,
      endDate,
      trialUsed: true,
    });
  }

  res.status(201).json({ success: true, data: sub });
};

// ── POST /api/subscription/upgrade ──────────────────────────────────────────
exports.upgrade = async (req, res) => {
  const { plan, paymentRef } = req.body;

  if (!['basic', 'standard', 'premium'].includes(plan)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid plan. Choose basic, standard, or premium.',
    });
  }

  const orgId    = getOrgId(req.user);
  const existing = await Subscription.findOne({ owner: orgId });

  const now     = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + PLAN_DURATIONS[plan]);

  if (existing) {
    // Save old plan to history before upgrading
    existing.history.push({
      plan:      existing.plan,
      startDate: existing.startDate,
      endDate:   existing.endDate,
    });

    existing.plan       = plan;
    existing.status     = 'active';
    existing.startDate  = now;
    existing.endDate    = endDate;
    if (paymentRef) existing.paymentRef = paymentRef;

    const sub = await existing.save();
    return res.json({ success: true, data: sub });
  }

  // No subscription yet — create fresh
  const sub = await Subscription.create({
    owner:     orgId,
    plan,
    status:    'active',
    startDate: now,
    endDate,
    trialUsed: existing?.trialUsed || false,
    paymentRef,
  });

  res.status(201).json({ success: true, data: sub });
};
