const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');

exports.getWorkers = async (req, res) => {
  const workers = await Worker.find({ owner: req.user._id, isActive: true }).sort('name');
  res.json({ success: true, data: workers });
};

exports.getWorker = async (req, res) => {
  const worker = await Worker.findById(req.params.id);
  res.json({ success: true, data: worker });
};

exports.createWorker = async (req, res) => {
  req.body.owner = req.user._id;
  const worker = await Worker.create(req.body);
  res.status(201).json({ success: true, data: worker });
};

exports.updateWorker = async (req, res) => {
  const existing = await Worker.findOne({ _id: req.params.id, owner: req.user._id });
  if (!existing) return res.status(404).json({ success: false, message: 'Worker not found' });
  const { owner, userId, ...updates } = req.body;
  const worker = await Worker.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  res.json({ success: true, data: worker });
};

exports.deleteWorker = async (req, res) => {
  await Worker.findByIdAndUpdate(req.params.id, { isActive: false, leftDate: new Date() });
  res.json({ success: true, message: 'Worker deactivated' });
};

exports.getWorkerPayrollSummary = async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const worker = await Worker.findById(req.params.id);
  const records = await Attendance.find({ worker: req.params.id, date: { $gte: start, $lte: end } });

  const multipliers = { present: 1, half_day: 0.5, overtime: 1.5, absent: 0 };
  const totalDays = records.reduce((sum, r) => sum + (multipliers[r.status] || 0), 0);
  const totalPay = totalDays * worker.rate;

  res.json({ success: true, data: { worker, totalDays, totalPay, records } });
};
