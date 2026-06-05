const multer = require('multer');
const Document = require('../models/Document');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, `uploads/${req.params.projectId}/`),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
exports.upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

exports.getDocuments = async (req, res) => {
  const docs = await Document.find({ project: req.params.projectId }).populate('createdBy', 'name');
  res.json({ success: true, data: docs });
};

exports.createDocument = async (req, res) => {
  const { name, category, notes } = req.body;
  const fileUrl = req.file ? `/uploads/${req.params.projectId}/${req.file.filename}` : '';
  const doc = await Document.create({
    project: req.params.projectId,
    name, category,
    createdBy: req.user._id,
    versions: [{ versionNumber: 1, fileUrl, fileName: req.file?.originalname, fileSize: req.file?.size, uploadedBy: req.user._id, notes }],
    activeVersion: 1
  });
  res.status(201).json({ success: true, data: doc });
};

exports.addVersion = async (req, res) => {
  const doc = await Document.findById(req.params.id);
  const newVersion = doc.versions.length + 1;
  const fileUrl = req.file ? `/uploads/${req.params.projectId}/${req.file.filename}` : '';
  if (req.body.status === 'issued_for_construction') {
    doc.versions.forEach(v => { if (v.status === 'issued_for_construction') v.status = 'superseded'; });
  }
  doc.versions.push({ versionNumber: newVersion, fileUrl, fileName: req.file?.originalname, fileSize: req.file?.size, uploadedBy: req.user._id, status: req.body.status, notes: req.body.notes });
  doc.activeVersion = newVersion;
  await doc.save();
  res.json({ success: true, data: doc });
};

exports.toggleClientShare = async (req, res) => {
  const doc = await Document.findByIdAndUpdate(req.params.id, { sharedWithClient: req.body.shared }, { new: true });
  res.json({ success: true, data: doc });
};

exports.deleteDocument = async (req, res) => {
  await Document.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Document deleted' });
};
