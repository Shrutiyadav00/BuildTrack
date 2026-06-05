const Project         = require('../models/Project');
const Task            = require('../models/Task');
const Attendance      = require('../models/Attendance');
const Document        = require('../models/Document');
const PaymentSchedule = require('../models/PaymentSchedule');
const User            = require('../models/User');

// Helper: get project scoped to this client user
const getClientProject = async (user) => {
  if (!user.clientProjectId) return null;
  return Project.findById(user.clientProjectId)
    .populate('leadEngineer', 'name email phone')
    .populate('owner', 'name email company phone bankDetails');
};

// ── GET /api/client/project ────────────────────────────────────────────────
exports.getProject = async (req, res) => {
  const project = await getClientProject(req.user);
  if (!project) return res.status(404).json({ success: false, message: 'No project assigned' });
  res.json({ success: true, data: project });
};

// ── GET /api/client/activity-feed ─────────────────────────────────────────
// Returns a merged timeline of recent events for the client's project
exports.getActivityFeed = async (req, res) => {
  const project = await getClientProject(req.user);
  if (!project) return res.status(404).json({ success: false, message: 'No project assigned' });

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [completedTasks, attendanceDays, payments, phases] = await Promise.all([
    // Tasks completed in last 7 days
    Task.find({
      project:     project._id,
      status:      'completed',
      completedAt: { $gte: sevenDaysAgo },
    }).sort('-completedAt').limit(10),

    // Daily attendance counts for last 7 days
    Attendance.aggregate([
      { $match: { project: project._id, date: { $gte: sevenDaysAgo }, status: { $in: ['present', 'overtime'] } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]),

    // Payment milestones in last 30 days
    PaymentSchedule.find({
      project:    project._id,
      receivedAt: { $gte: thirtyDaysAgo },
      status:     'received',
    }).sort('-receivedAt').limit(5),

    // Phases (from project)
    project.phases || [],
  ]);

  // Build unified timeline
  const events = [];

  completedTasks.forEach(t => events.push({
    date:        t.completedAt,
    type:        'task_completed',
    icon:        '✓',
    color:       'var(--success)',
    title:       `Task Completed: ${t.title}`,
    description: t.description || '',
  }));

  attendanceDays.forEach(a => events.push({
    date:        new Date(a._id),
    type:        'attendance',
    icon:        '👷',
    color:       'var(--info)',
    title:       `${a.count} workers on site`,
    description: `Active workers recorded for ${a._id}`,
  }));

  payments.forEach(p => events.push({
    date:        p.receivedAt,
    type:        'payment_received',
    icon:        '₹',
    color:       'var(--success)',
    title:       `Payment Received: ${p.milestoneName}`,
    description: `₹${p.amount.toLocaleString()} received`,
  }));

  // Active/in-progress phases
  phases.filter(ph => ph.status === 'in_progress').forEach(ph => events.push({
    date:        ph.actualStart || ph.plannedStart || new Date(),
    type:        'phase_started',
    icon:        '▶',
    color:       'var(--primary)',
    title:       `Phase Started: ${ph.name}`,
    description: `${ph.name} is currently in progress`,
  }));

  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ success: true, data: events.slice(0, 30) });
};

// ── GET /api/client/payment-schedule ─────────────────────────────────────
exports.getPaymentSchedule = async (req, res) => {
  const project = await getClientProject(req.user);
  if (!project) return res.status(404).json({ success: false, message: 'No project assigned' });

  const schedules = await PaymentSchedule.find({ project: project._id }).sort('createdAt');

  const totalPaid    = schedules.filter(s => s.status === 'received').reduce((sum, s) => sum + s.amount, 0);
  const totalPending = schedules.filter(s => s.status !== 'received').reduce((sum, s) => sum + s.amount, 0);

  res.json({
    success: true,
    data: {
      schedules,
      summary: {
        totalPaid,
        totalPending,
        contractValue: project.contractValue || 0,
        remainingBalance: (project.contractValue || 0) - totalPaid,
      },
    },
  });
};

// ── GET /api/client/builder-profile ──────────────────────────────────────
// Returns builder (admin/owner) profile including bank details for payment
exports.getBuilderProfile = async (req, res) => {
  const project = await getClientProject(req.user);
  if (!project) return res.status(404).json({ success: false, message: 'No project assigned' });

  const owner = project.owner;
  res.json({
    success: true,
    data: {
      name:        owner.name,
      email:       owner.email,
      phone:       owner.phone,
      company:     owner.company,
      bankDetails: owner.bankDetails || null,
    },
  });
};

// ── GET /api/client/documents ─────────────────────────────────────────────
exports.getDocuments = async (req, res) => {
  const project = await getClientProject(req.user);
  if (!project) return res.status(404).json({ success: false, message: 'No project assigned' });

  const docs = await Document.find({ project: project._id, sharedWithClient: true })
    .populate('createdBy', 'name')
    .sort('-updatedAt');
  res.json({ success: true, data: docs });
};
