const PaymentSchedule = require('../models/PaymentSchedule');
const Project         = require('../models/Project');
const Transaction     = require('../models/Transaction');
const notify          = require('../utils/notify');
const { getOrgId }    = require('../middleware/auth');

// ── GET /api/payment-schedules/:projectId ─────────────────────────────────
exports.getSchedules = async (req, res) => {
  const schedules = await PaymentSchedule.find({ project: req.params.projectId })
    .sort('createdAt')
    .populate('createdBy receivedBy', 'name');
  res.json({ success: true, data: schedules });
};

// ── POST /api/payment-schedules/:projectId ────────────────────────────────
exports.createSchedule = async (req, res) => {
  const { milestoneName, amount, dueDate, notes, currency } = req.body;
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  const percentOfContract = project.contractValue
    ? Math.round((amount / project.contractValue) * 100 * 10) / 10
    : null;

  const schedule = await PaymentSchedule.create({
    project:     req.params.projectId,
    owner:       getOrgId(req.user),
    milestoneName,
    amount,
    currency:    currency || project.currency || 'INR',
    dueDate,
    notes,
    percentOfContract,
    createdBy:   req.user._id,
  });

  res.status(201).json({ success: true, data: schedule });
};

// ── PUT /api/payment-schedules/:id ────────────────────────────────────────
exports.updateSchedule = async (req, res) => {
  const { milestoneName, amount, dueDate, notes } = req.body;
  const schedule = await PaymentSchedule.findByIdAndUpdate(
    req.params.id,
    { milestoneName, amount, dueDate, notes },
    { new: true }
  );
  if (!schedule) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: schedule });
};

// ── PUT /api/payment-schedules/:id/request ────────────────────────────────
// Admin marks milestone as "payment requested" — client gets notified
exports.requestPayment = async (req, res) => {
  const schedule = await PaymentSchedule.findById(req.params.id).populate('project');
  if (!schedule) return res.status(404).json({ success: false, message: 'Not found' });

  schedule.status      = 'requested';
  schedule.requestedAt = new Date();
  await schedule.save();

  // Notify the linked client user
  const project = schedule.project;
  if (project?.clientUserId) {
    await notify({
      recipientId:    project.clientUserId,
      type:           'payment_requested',
      title:          `Payment Request: ${schedule.milestoneName}`,
      message:        `₹${schedule.amount.toLocaleString()} is due for "${schedule.milestoneName}". Please transfer the amount.`,
      relatedProject: project._id,
      relatedEntity:  schedule._id.toString(),
    });
  }

  res.json({ success: true, data: schedule });
};

// ── PUT /api/payment-schedules/:id/received ───────────────────────────────
// Admin marks payment as received — auto-creates Transaction + notifies client
exports.markReceived = async (req, res) => {
  const schedule = await PaymentSchedule.findById(req.params.id).populate('project');
  if (!schedule) return res.status(404).json({ success: false, message: 'Not found' });

  schedule.status     = 'received';
  schedule.receivedAt = new Date();
  schedule.receivedBy = req.user._id;
  await schedule.save();

  // Auto-create a Transaction record for audit trail
  await Transaction.create({
    project:       schedule.project._id,
    type:          'client_receipt',
    category:      'misc',
    amount:        schedule.amount,
    currency:      schedule.currency,
    description:   `Payment received: ${schedule.milestoneName}`,
    paymentMethod: 'bank',
    status:        'paid',
    createdBy:     req.user._id,
  });

  // Notify client
  const project = schedule.project;
  if (project?.clientUserId) {
    await notify({
      recipientId:    project.clientUserId,
      type:           'payment_received',
      title:          `Payment Received ✓`,
      message:        `Your payment of ₹${schedule.amount.toLocaleString()} for "${schedule.milestoneName}" has been received. Thank you!`,
      relatedProject: project._id,
      relatedEntity:  schedule._id.toString(),
    });
  }

  res.json({ success: true, data: schedule });
};

// ── DELETE /api/payment-schedules/:id ─────────────────────────────────────
exports.deleteSchedule = async (req, res) => {
  await PaymentSchedule.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
};
