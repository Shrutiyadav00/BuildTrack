const express = require('express');
const router = express.Router();
const { getOwnerDashboard, getProjectDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getOwnerDashboard);
router.get('/project/:projectId', getProjectDashboard);

module.exports = router;
