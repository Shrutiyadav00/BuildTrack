const SiteDiary = require('../models/SiteDiary');
const { getOrgId } = require('../middleware/auth');

// GET /api/site-diary/:projectId
exports.listEntries = async (req, res) => {
  const { projectId } = req.params;
  const page  = Math.max(0, parseInt(req.query.page)  || 0);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);

  const entries = await SiteDiary.find({ project: projectId })
    .populate('reportedBy', 'name')
    .sort({ date: -1 })
    .skip(page * limit)
    .limit(limit);

  const total = await SiteDiary.countDocuments({ project: projectId });

  res.json({ success: true, data: entries, total, page, limit });
};

// POST /api/site-diary/:projectId
exports.createEntry = async (req, res) => {
  const { projectId } = req.params;

  // Normalise date to midnight UTC so uniqueness index works reliably
  const rawDate = req.body.date ? new Date(req.body.date) : new Date();
  rawDate.setUTCHours(0, 0, 0, 0);

  try {
    const entry = await SiteDiary.create({
      ...req.body,
      project:    projectId,
      reportedBy: req.user._id,
      date:       rawDate,
    });
    const populated = await entry.populate('reportedBy', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A diary entry already exists for this date' });
    }
    throw err;
  }
};

// GET /api/site-diary/:projectId/:id
exports.getEntry = async (req, res) => {
  const entry = await SiteDiary.findOne({ _id: req.params.id, project: req.params.projectId })
    .populate('reportedBy', 'name');
  if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
  res.json({ success: true, data: entry });
};

// PUT /api/site-diary/:projectId/:id
exports.updateEntry = async (req, res) => {
  const orgId = getOrgId(req.user);
  const entry = await SiteDiary.findOne({ _id: req.params.id, project: req.params.projectId });
  if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

  // Only the original reporter or admin can edit
  const isAdmin    = ['super_admin', 'admin', 'owner'].includes(req.user.role);
  const isReporter = entry.reportedBy.toString() === req.user._id.toString();
  if (!isAdmin && !isReporter) {
    return res.status(403).json({ success: false, message: 'Only the reporter or an admin can edit this entry' });
  }

  const { date, project, reportedBy, ...updates } = req.body; // prevent overwriting immutable fields
  Object.assign(entry, updates);
  await entry.save();
  res.json({ success: true, data: entry });
};
