const router = require('express').Router();
const {
  listItems, createItem, updateItem, deleteItem, stockIn, stockOut,
} = require('../controllers/inventoryController');
const { engineerUp } = require('../middleware/auth');

// /api/inventory/:projectId
router.route('/:projectId')
  .get(engineerUp, listItems)
  .post(engineerUp, createItem);

router.route('/:projectId/:id')
  .put(engineerUp, updateItem)
  .delete(engineerUp, deleteItem);

router.put('/:projectId/:id/in',  engineerUp, stockIn);
router.put('/:projectId/:id/out', engineerUp, stockOut);

module.exports = router;
