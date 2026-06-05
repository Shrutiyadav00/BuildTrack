const Project       = require('../models/Project');
const Task          = require('../models/Task');
const Worker        = require('../models/Worker');
const Attendance    = require('../models/Attendance');
const Transaction   = require('../models/Transaction');
const PaymentSchedule = require('../models/PaymentSchedule');
const PurchaseOrder   = require('../models/PurchaseOrder');
const Subscription    = require('../models/Subscription');
const { getOrgId }  = require('../middleware/auth');

exports.getOwnerDashboard = async (req, res) => {
  const orgId = getOrgId(req.user);
  let projects;

  if (['super_admin', 'admin', 'owner'].includes(req.user.role)) {
    // Admin group: all org projects
    projects = await Project.find({ owner: orgId });
  } else if (['engineer', 'supervisor', 'manager'].includes(req.user.role)) {
    // Engineer group: only their assigned projects (still org-scoped)
    projects = await Project.find({
      owner: orgId,
      $or: [
        { leadEngineer: req.user._id },
        { team: req.user._id }
      ]
    });
  } else {
    projects = [];
  }

  const workers        = await Worker.countDocuments({ owner: orgId, isActive: true });
  const totalBudget    = projects.reduce((s, p) => s + (p.budget?.total || 0), 0);
  const avgCompletion  = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.completion, 0) / projects.length)
    : 0;

  // ── Budget alerts: projects >80% budget used ─────────────────────────────
  const budgetAlerts = projects
    .filter(p => p.budget?.total && p.budgetSpent?.total &&
      (p.budgetSpent.total / p.budget.total) > 0.8)
    .map(p => ({
      id:    p._id,
      name:  p.name,
      pct:   Math.round((p.budgetSpent.total / p.budget.total) * 100),
      spent: p.budgetSpent.total,
      total: p.budget.total,
    }));

  // ── Pending payment requests ─────────────────────────────────────────────
  let pendingPayments = 0;
  let poSummary       = { count: 0, total: 0 };
  let subscriptionStatus = null;

  if (['super_admin', 'admin', 'owner'].includes(req.user.role)) {
    try {
      pendingPayments = await PaymentSchedule.countDocuments({ owner: orgId, status: 'requested' });
    } catch (_) {}

    try {
      const poAgg = await PurchaseOrder.aggregate([
        { $match: { owner: orgId, status: { $in: ['draft', 'sent', 'unpaid'] } } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
      ]);
      poSummary = poAgg[0] ? { count: poAgg[0].count, total: poAgg[0].total } : { count: 0, total: 0 };
    } catch (_) {}

    try {
      const sub = await Subscription.findOne({ owner: orgId });
      if (sub) {
        const now  = new Date();
        const diff = Math.ceil((sub.endDate - now) / (1000 * 60 * 60 * 24));
        subscriptionStatus = { plan: sub.plan, status: sub.status, daysRemaining: Math.max(0, diff) };
      }
    } catch (_) {}
  }

  res.json({
    success: true,
    data: {
      totalProjects:   projects.length,
      activeProjects:  projects.filter(p => p.status === 'active').length,
      totalBudget,
      avgCompletion,
      totalWorkers:    workers,
      recentProjects:  projects.slice(-5),
      budgetAlerts,
      pendingPayments,
      poSummary,
      subscriptionStatus,
    }
  });
};

exports.getProjectDashboard = async (req, res) => {
  const { projectId } = req.params;
  const [project, tasks, txns] = await Promise.all([
    Project.findById(projectId),
    Task.find({ project: projectId }),
    Transaction.find({ project: projectId })
  ]);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const todayAttendance = await Attendance.countDocuments({ project: projectId, date: { $gte: today, $lte: todayEnd }, status: { $in: ['present', 'overtime'] } });
  const income = txns.filter(t => ['client_receipt', 'refund'].includes(t.type)).reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter(t => !['client_receipt', 'refund'].includes(t.type)).reduce((s, t) => s + t.amount, 0);
  res.json({ success: true, data: { project, tasks: { total: tasks.length, completed: tasks.filter(t => t.status === 'completed').length, open: tasks.filter(t => t.status === 'open').length }, finance: { income, expenses, profit: income - expenses, budgetRemaining: (project.budget.total || 0) - expenses }, todayAttendance } });
};
