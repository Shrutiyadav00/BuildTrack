const path         = require('path');
const fs           = require('fs');
const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor        = require('../models/Vendor');
const Project       = require('../models/Project');
const Transaction   = require('../models/Transaction');
const { getOrgId }  = require('../middleware/auth');
const generatePO    = require('../utils/generatePO');
const emailService  = require('../utils/emailService');
const notify        = require('../utils/notify');

// ── Helpers ──────────────────────────────────────────────────────────────────

async function nextPoNumber() {
  const year = new Date().getFullYear();
  const last = await PurchaseOrder
    .findOne({ poNumber: new RegExp(`^PO-${year}-`) })
    .sort({ poNumber: -1 });
  const seq = last ? parseInt(last.poNumber.split('-')[2], 10) + 1 : 1;
  return `PO-${year}-${String(seq).padStart(4, '0')}`;
}

// ── Controllers ───────────────────────────────────────────────────────────────

// GET /api/purchase-orders
exports.listPOs = async (req, res) => {
  const orgId = getOrgId(req.user);
  const filter = { owner: orgId };
  if (req.query.project) filter.project = req.query.project;
  if (req.query.status)  filter.status  = req.query.status;
  if (req.query.vendor)  filter.vendor  = req.query.vendor;

  const pos = await PurchaseOrder.find(filter)
    .populate('vendor',  'companyName contactPerson phone')
    .populate('project', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: pos });
};

// POST /api/purchase-orders
exports.createPO = async (req, res) => {
  const orgId  = getOrgId(req.user);
  const poNum  = await nextPoNumber();

  const po = await PurchaseOrder.create({
    ...req.body,
    owner:     orgId,
    createdBy: req.user._id,
    poNumber:  poNum,
  });

  // Populate for PDF generation
  const populated = await PurchaseOrder.findById(po._id)
    .populate('vendor', 'companyName contactPerson email phone address gstNumber bankDetails privateMode')
    .populate('project', 'name');

  // Generate PDF
  try {
    const builder = {
      name:    req.user.name,
      company: req.user.company || req.user.name,
      phone:   req.user.phone   || '',
      address: req.user.address || '',
    };
    const pdfPath = await generatePO(populated, builder);
    await PurchaseOrder.findByIdAndUpdate(po._id, { pdfPath });
    populated.pdfPath = pdfPath;
  } catch (pdfErr) {
    console.error('[createPO] PDF generation failed:', pdfErr.message);
  }

  await notify({
    recipientId:   orgId,
    type:          'po_created',
    title:         `PO ${poNum} created`,
    message:       `Purchase Order ${poNum} created for ${populated.vendor?.companyName || 'vendor'}`,
    relatedProject: po.project,
  });

  res.status(201).json({ success: true, data: populated });
};

// GET /api/purchase-orders/:id
exports.getPO = async (req, res) => {
  const orgId = getOrgId(req.user);
  const po = await PurchaseOrder.findOne({ _id: req.params.id, owner: orgId })
    .populate('vendor',  'companyName contactPerson email phone address gstNumber bankDetails')
    .populate('project', 'name client');

  if (!po) return res.status(404).json({ success: false, message: 'PO not found' });
  res.json({ success: true, data: po });
};

// PUT /api/purchase-orders/:id  (draft only)
exports.updatePO = async (req, res) => {
  const orgId = getOrgId(req.user);
  const po    = await PurchaseOrder.findOne({ _id: req.params.id, owner: orgId });
  if (!po)                  return res.status(404).json({ success: false, message: 'PO not found' });
  if (po.status !== 'draft') return res.status(400).json({ success: false, message: 'Only draft POs can be edited' });

  Object.assign(po, req.body);
  await po.save(); // triggers pre-save hook to recompute totals

  // Regenerate PDF
  try {
    const populated = await PurchaseOrder.findById(po._id)
      .populate('vendor',  'companyName contactPerson email phone address gstNumber bankDetails')
      .populate('project', 'name');
    const builder = { name: req.user.name, company: req.user.company || req.user.name };
    const pdfPath = await generatePO(populated, builder);
    po.pdfPath = pdfPath;
    await po.save();
  } catch (e) {
    console.error('[updatePO] PDF regen failed:', e.message);
  }

  res.json({ success: true, data: po });
};

// DELETE /api/purchase-orders/:id  (draft only)
exports.deletePO = async (req, res) => {
  const orgId = getOrgId(req.user);
  const po    = await PurchaseOrder.findOne({ _id: req.params.id, owner: orgId });
  if (!po)                   return res.status(404).json({ success: false, message: 'PO not found' });
  if (po.status !== 'draft') return res.status(400).json({ success: false, message: 'Only draft POs can be deleted' });

  // Remove PDF if exists
  if (po.pdfPath && fs.existsSync(po.pdfPath)) {
    try { fs.unlinkSync(po.pdfPath); } catch (_) {}
  }

  await po.deleteOne();
  res.json({ success: true, message: 'PO deleted' });
};

// GET /api/purchase-orders/:id/pdf
exports.getPDF = async (req, res) => {
  const orgId = getOrgId(req.user);
  const po    = await PurchaseOrder.findOne({ _id: req.params.id, owner: orgId })
    .populate('vendor',  'companyName contactPerson email phone address gstNumber bankDetails')
    .populate('project', 'name');

  if (!po) return res.status(404).json({ success: false, message: 'PO not found' });

  try {
    const builder  = { name: req.user.name, company: req.user.company || req.user.name, phone: req.user.phone || '' };
    const pdfPath  = await generatePO(po, builder);
    await PurchaseOrder.findByIdAndUpdate(po._id, { pdfPath });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${po.poNumber}.pdf"`);
    fs.createReadStream(pdfPath).pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'PDF generation failed', error: err.message });
  }
};

// POST /api/purchase-orders/:id/send
exports.sendPO = async (req, res) => {
  const orgId = getOrgId(req.user);
  const po    = await PurchaseOrder.findOne({ _id: req.params.id, owner: orgId })
    .populate('vendor',  'companyName contactPerson email phone address gstNumber bankDetails')
    .populate('project', 'name client');

  if (!po) return res.status(404).json({ success: false, message: 'PO not found' });

  // Regenerate PDF if needed
  let pdfPath = po.pdfPath;
  if (!pdfPath || !fs.existsSync(pdfPath)) {
    const builder = { name: req.user.name, company: req.user.company || req.user.name };
    pdfPath = await generatePO(po, builder);
    await PurchaseOrder.findByIdAndUpdate(po._id, { pdfPath });
  }

  const { sendToVendor, sendToClient, vendorEmail, clientEmail } = req.body;
  const errors = [];
  const builderName = req.user.company || req.user.name;

  if (sendToVendor) {
    const to = vendorEmail || po.vendor?.email;
    if (to) {
      try {
        await emailService.sendPO({ to, poNumber: po.poNumber, pdfPath, builderName });
        await PurchaseOrder.findByIdAndUpdate(po._id, { sentToVendor: true, status: po.status === 'draft' ? 'sent' : po.status });
      } catch (e) {
        errors.push(`Vendor email failed: ${e.message}`);
      }
    } else {
      errors.push('No vendor email address available');
    }
  }

  if (sendToClient) {
    const to = clientEmail;
    if (to) {
      try {
        await emailService.sendPO({ to, poNumber: po.poNumber, pdfPath, builderName });
        await PurchaseOrder.findByIdAndUpdate(po._id, { sentToClient: true });
      } catch (e) {
        errors.push(`Client email failed: ${e.message}`);
      }
    } else {
      errors.push('No client email address provided');
    }
  }

  res.json({ success: errors.length === 0, data: { sent: true }, errors });
};

// PUT /api/purchase-orders/:id/status
exports.updateStatus = async (req, res) => {
  const orgId = getOrgId(req.user);
  const { status } = req.body;
  const validTransitions = { draft: ['sent','unpaid'], sent: ['unpaid'], unpaid: ['paid'], paid: [] };

  const po = await PurchaseOrder.findOne({ _id: req.params.id, owner: orgId })
    .populate('vendor',  'companyName')
    .populate('project', 'name owner');

  if (!po) return res.status(404).json({ success: false, message: 'PO not found' });

  if (!validTransitions[po.status]?.includes(status)) {
    return res.status(400).json({ success: false, message: `Cannot transition from '${po.status}' to '${status}'` });
  }

  po.status = status;
  if (status === 'paid') {
    po.paidAt = new Date();
  }
  await po.save();

  // ── On paid: budget deduction + transaction record + notification ────────────
  if (status === 'paid') {
    // 1. Update project.budgetSpent
    try {
      await Project.findByIdAndUpdate(po.project, {
        $inc: {
          'budgetSpent.total':              po.totalAmount,
          [`budgetSpent.${po.category}`]:   po.totalAmount,
        },
      });
    } catch (e) {
      console.error('[updateStatus] budgetSpent update failed:', e.message);
    }

    // 2. Create Transaction for audit trail
    try {
      await Transaction.create({
        project:     po.project?._id || po.project,
        owner:       orgId,
        type:        'material_purchase',
        category:    po.category,
        amount:      po.totalAmount,
        currency:    po.currency || 'INR',
        description: `PO ${po.poNumber}`,
        vendor:      po.vendor?.companyName || '',
        poRef:       po._id,
        status:      'approved',
        date:        new Date(),
        createdBy:   req.user._id,
      });
    } catch (e) {
      console.error('[updateStatus] Transaction create failed:', e.message);
    }

    // 3. Notify admin
    await notify({
      recipientId:    orgId,
      type:           'po_paid',
      title:          `PO ${po.poNumber} marked paid`,
      message:        `₹${po.totalAmount.toLocaleString('en-IN')} paid to ${po.vendor?.companyName || 'vendor'}`,
      relatedProject: po.project?._id || po.project,
    });
  }

  res.json({ success: true, data: po });
};
