const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, getProjectSummary, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/:projectId').get(getTransactions).post(createTransaction);
router.get('/:projectId/summary', getProjectSummary);
router.route('/:id').put(updateTransaction).delete(deleteTransaction);

module.exports = router;
