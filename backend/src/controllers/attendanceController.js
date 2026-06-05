const Attendance = require('../models/Attendance');

exports.getAttendance = async (req, res) => {
  const filter = { project: req.params.projectId };
  if (req.query.date) {
    const d = new Date(req.query.date);
    filter.date = { $gte: new Date(d.setHours(0, 0, 0, 0)), $lte: new Date(d.setHours(23, 59, 59, 999)) };
  }
  if (req.query.workerId) filter.worker = req.query.workerId;
  const records = await Attendance.find(filter).populate('worker', 'name trade');
  res.json({ success: true, data: records });
};

exports.markAttendance = async (req, res) => {
  const { worker, date, status, location, isRemote, notes } = req.body;
  const record = await Attendance.findOneAndUpdate(
    { project: req.params.projectId, worker, date: new Date(date) },
    { status, location, isRemote, notes, markedBy: req.user._id },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: record });
};

exports.bulkMarkAttendance = async (req, res) => {
  const { records, date } = req.body;
  const ops = records.map(r => ({
    updateOne: {
      filter: { project: req.params.projectId, worker: r.worker, date: new Date(date) },
      update: { $set: { status: r.status, markedBy: req.user._id } },
      upsert: true
    }
  }));
  await Attendance.bulkWrite(ops);
  res.json({ success: true, message: 'Attendance saved' });
};

exports.updateAttendance = async (req, res) => {
  const record = await Attendance.findById(req.params.id);
  const { status, reason } = req.body;
  record.editHistory.push({ editedBy: req.user._id, oldStatus: record.status, newStatus: status, reason });
  record.status = status;
  await record.save();
  res.json({ success: true, data: record });
};
