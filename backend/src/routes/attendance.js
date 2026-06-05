const express = require('express');
const router = express.Router();
const { getAttendance, markAttendance, bulkMarkAttendance, updateAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');

router.use(protect);

/* Worker self-service: own attendance records */
router.get('/me', async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) return res.json({ success: true, data: [] });
    const records = await Attendance.find({ worker: worker._id })
      .sort({ date: -1 }).limit(90).lean();
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.route('/:projectId').get(getAttendance).post(markAttendance);
router.post('/:projectId/bulk', bulkMarkAttendance);
router.put('/:id/edit', updateAttendance);

module.exports = router;
