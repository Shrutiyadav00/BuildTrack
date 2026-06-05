const router = require('express').Router({ mergeParams: true });
const {
  listEntries, createEntry, getEntry, updateEntry,
} = require('../controllers/siteDiaryController');
const { engineerUp } = require('../middleware/auth');

// /api/site-diary/:projectId
router.route('/:projectId')
  .get(engineerUp, listEntries)
  .post(engineerUp, createEntry);

router.route('/:projectId/:id')
  .get(engineerUp, getEntry)
  .put(engineerUp, updateEntry);

module.exports = router;
