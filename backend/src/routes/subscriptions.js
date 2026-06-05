const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getSubscription,
  getPlans,
  activateTrial,
  upgrade,
} = require('../controllers/subscriptionController');

// All subscription routes require login — but NO subscription gate here
// (so expired users can still access this to upgrade)
router.use(protect);

router.get('/',        getSubscription);   // GET  /api/subscription
router.get('/plans',   getPlans);          // GET  /api/subscription/plans
router.post('/trial',  adminOnly, activateTrial);  // POST /api/subscription/trial
router.post('/upgrade',adminOnly, upgrade);         // POST /api/subscription/upgrade

module.exports = router;
