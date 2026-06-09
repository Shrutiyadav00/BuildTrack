const Subscription = require('../models/Subscription');
const { PLAN_DURATIONS } = require('../models/Subscription');
const { getOrgId } = require('../middleware/auth');

// Plan metadata sent to frontend for display
const PLAN_META = {
  trial: {
    name:        'Free Trial',
    duration:    7,
    price:       0,
    description: '7 days free. Full access — 1 project only. One-time.',
    features:    [
      'All modules & features',
      '1 project',
      'Unlimited team members',
      'Vendors & Purchase Orders',
      'Finance & Reports',
      'Site Diary & Inventory',
    ],
    maxProjects: 1,
    highlight:   false,
  },
  starter: {
    name:        'Starter',
    duration:    30,
    price:       500,
    description: '30 days — perfect for small projects.',
    features:    [
      'All modules & features',
      'Up to 2 projects',
      'Unlimited team members',
      'Vendors & Purchase Orders',
      'Finance & Reports',
      'Site Diary & Inventory',
    ],
    maxProjects: 2,
    highlight:   false,
  },
  professional: {
    name:        'Professional',
    duration:    60,
    price:       1200,
    description: '60 days — best for growing firms.',
    features:    [
      'All modules & features',
      'Up to 5 projects',
      'Unlimited team members',
      'Vendors & Purchase Orders',
      'Finance & Reports',
      'Priority support',
    ],
    maxProjects: 5,
    highlight:   true,
  },
  business: {
    name:        'Business',
    duration:    90,
    price:       2000,
    description: '90 days — for established contractors.',
    features:    [
      'All modules & features',
      'Unlimited projects',
      'Unlimited team members',
      'Vendors & Purchase Orders',
      'Dedicated support',
      'Custom reports',
    ],
    maxProjects: -1,
    highlight:   false,
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

  const paidPlans = ['starter', 'professional', 'business', 'basic', 'standard', 'premium'];
  if (!paidPlans.includes(plan)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid plan. Choose starter, professional, or business.',
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
