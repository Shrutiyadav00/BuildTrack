const express = require('express');
const router  = express.Router({ mergeParams: true });
const { protect, adminOnly, engineerUp } = require('../middleware/auth');
const { requireActiveSubscription }      = require('../middleware/subscriptionGate');
const {
  getSchedules, createSchedule, updateSchedule,
  requestPayment, markReceived, deleteSchedule,
} = require('../controllers/paymentScheduleController');

router.use(protect, requireActiveSubscription);

router.route('/:projectId')
  .get(engineerUp,  getSchedules)       // GET  /api/payment-schedules/:projectId
  .post(adminOnly,  createSchedule);    // POST /api/payment-schedules/:projectId

router.put('/:id',          adminOnly, updateSchedule);    // PUT
router.put('/:id/request',  adminOnly, requestPayment);    // PUT — request
router.put('/:id/received', adminOnly, markReceived);      // PUT — received
router.delete('/:id',       adminOnly, deleteSchedule);    // DELETE

module.exports = router;
