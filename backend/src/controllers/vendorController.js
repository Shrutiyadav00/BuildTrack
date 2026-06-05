const Vendor = require('../models/Vendor');
const { getOrgId } = require('../middleware/auth');

// Mask Aadhaar number — return only last 4 digits
const maskAadhar = (num) => (num ? 'XXXX-XXXX-' + String(num).slice(-4) : undefined);

const formatVendor = (v) => {
  const obj = v.toObject ? v.toObject() : { ...v };
  if (obj.aadharNumber) obj.aadharNumber = maskAadhar(obj.aadharNumber);
  return obj;
};

// GET /api/vendors
exports.listVendors = async (req, res) => {
  const orgId = getOrgId(req.user);
  const filter = { owner: orgId };
  if (req.query.active === 'true')  filter.isActive = true;
  if (req.query.active === 'false') filter.isActive = false;
  const vendors = await Vendor.find(filter).sort({ companyName: 1 });
  res.json({ success: true, data: vendors.map(formatVendor) });
};

// POST /api/vendors
exports.createVendor = async (req, res) => {
  const orgId = getOrgId(req.user);
  const vendor = await Vendor.create({ ...req.body, owner: orgId });
  res.status(201).json({ success: true, data: formatVendor(vendor) });
};

// GET /api/vendors/:id
exports.getVendor = async (req, res) => {
  const orgId = getOrgId(req.user);
  const vendor = await Vendor.findOne({ _id: req.params.id, owner: orgId });
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
  res.json({ success: true, data: formatVendor(vendor) });
};

// PUT /api/vendors/:id
exports.updateVendor = async (req, res) => {
  const orgId = getOrgId(req.user);
  const vendor = await Vendor.findOneAndUpdate(
    { _id: req.params.id, owner: orgId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
  res.json({ success: true, data: formatVendor(vendor) });
};

// DELETE /api/vendors/:id  (soft-delete)
exports.deleteVendor = async (req, res) => {
  const orgId = getOrgId(req.user);
  const vendor = await Vendor.findOneAndUpdate(
    { _id: req.params.id, owner: orgId },
    { isActive: false },
    { new: true }
  );
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
  res.json({ success: true, message: 'Vendor deactivated' });
};
