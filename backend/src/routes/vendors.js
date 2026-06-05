const router = require('express').Router();
const {
  listVendors, createVendor, getVendor, updateVendor, deleteVendor,
} = require('../controllers/vendorController');
const { adminOnly } = require('../middleware/auth');

// All vendor routes require adminOnly (protect + sub-gate applied at server.js level)
router.route('/')
  .get(adminOnly, listVendors)
  .post(adminOnly, createVendor);

router.route('/:id')
  .get(adminOnly, getVendor)
  .put(adminOnly, updateVendor)
  .delete(adminOnly, deleteVendor);

module.exports = router;
