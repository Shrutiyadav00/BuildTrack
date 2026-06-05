const router = require('express').Router();
const {
  listPOs, createPO, getPO, updatePO, deletePO,
  getPDF, sendPO, updateStatus,
} = require('../controllers/purchaseOrderController');
const { adminOnly } = require('../middleware/auth');

// All PO routes require adminOnly (protect + sub-gate applied at server.js level)
router.route('/')
  .get(adminOnly, listPOs)
  .post(adminOnly, createPO);

router.route('/:id')
  .get(adminOnly, getPO)
  .put(adminOnly, updatePO)
  .delete(adminOnly, deletePO);

router.get('/:id/pdf',    adminOnly, getPDF);
router.post('/:id/send',  adminOnly, sendPO);
router.put('/:id/status', adminOnly, updateStatus);

module.exports = router;
