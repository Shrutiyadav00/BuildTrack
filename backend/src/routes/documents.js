const express = require('express');
const router = express.Router();
const { getDocuments, createDocument, addVersion, toggleClientShare, deleteDocument, upload } = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const fs = require('fs');

router.use(protect);
router.route('/:projectId').get(getDocuments).post((req, res, next) => {
  fs.mkdirSync(`uploads/${req.params.projectId}`, { recursive: true });
  next();
}, upload.single('file'), createDocument);
router.post('/:projectId/:id/version', upload.single('file'), addVersion);
router.put('/:id/share', toggleClientShare);
router.delete('/:id', deleteDocument);

module.exports = router;
