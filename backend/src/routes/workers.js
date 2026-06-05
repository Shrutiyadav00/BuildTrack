const express = require('express');
const router = express.Router();
const { getWorkers, getWorker, createWorker, updateWorker, deleteWorker, getWorkerPayrollSummary } = require('../controllers/workerController');
const { protect } = require('../middleware/auth');
const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');

router.use(protect);

/* Worker self-service: returns the worker record linked to the logged-in user */
router.get('/me', async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker profile not found' });
    res.json({ success: true, data: worker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.route('/').get(getWorkers).post(createWorker);
router.route('/:id').get(getWorker).put(updateWorker).delete(deleteWorker);
router.get('/:id/payroll', getWorkerPayrollSummary);

module.exports = router;
