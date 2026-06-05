const express = require('express');
const router  = express.Router();
const { protect, clientOnly } = require('../middleware/auth');
const {
  getProject, getActivityFeed, getPaymentSchedule,
  getBuilderProfile, getDocuments,
} = require('../controllers/clientPortalController');

// All client portal routes: JWT auth + client role only
// No subscription gate — client access is independent of builder's subscription
router.use(protect, clientOnly);

router.get('/project',          getProject);        // GET /api/client/project
router.get('/activity-feed',    getActivityFeed);   // GET /api/client/activity-feed
router.get('/payment-schedule', getPaymentSchedule);// GET /api/client/payment-schedule
router.get('/builder-profile',  getBuilderProfile); // GET /api/client/builder-profile
router.get('/documents',        getDocuments);      // GET /api/client/documents

module.exports = router;
