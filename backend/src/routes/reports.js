const router = require('express').Router();
const { getPayrollJSON, getPayrollPDF, getBudgetReport } = require('../controllers/reportsController');
const { adminOnly } = require('../middleware/auth');

// All report routes require adminOnly (protect + sub-gate applied at server.js level)
router.get('/payroll/:projectId/pdf', adminOnly, getPayrollPDF);
router.get('/payroll/:projectId',     adminOnly, getPayrollJSON);
router.get('/budget/:projectId',      adminOnly, getBudgetReport);

module.exports = router;
