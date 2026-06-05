const Inventory = require('../models/Inventory');
const { getOrgId } = require('../middleware/auth');
const notify = require('../utils/notify');

// GET /api/inventory/:projectId
exports.listItems = async (req, res) => {
  const { projectId } = req.params;
  const items = await Inventory.find({ project: projectId }).sort({ itemName: 1 });
  res.json({ success: true, data: items });
};

// POST /api/inventory/:projectId
exports.createItem = async (req, res) => {
  const orgId = getOrgId(req.user);
  const item  = await Inventory.create({
    ...req.body,
    project: req.params.projectId,
    owner:   orgId,
  });
  res.status(201).json({ success: true, data: item });
};

// PUT /api/inventory/:projectId/:id  (update definition — name, unit, minimumStock)
exports.updateItem = async (req, res) => {
  const item = await Inventory.findOne({ _id: req.params.id, project: req.params.projectId });
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  const { currentStock, transactions, ...updates } = req.body; // prevent direct stock manipulation
  Object.assign(item, updates);
  await item.save();
  res.json({ success: true, data: item });
};

// DELETE /api/inventory/:projectId/:id
exports.deleteItem = async (req, res) => {
  const item = await Inventory.findOneAndDelete({ _id: req.params.id, project: req.params.projectId });
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  res.json({ success: true, message: 'Item deleted' });
};

// PUT /api/inventory/:projectId/:id/in
exports.stockIn = async (req, res) => {
  const { quantity, description } = req.body;
  if (!quantity || quantity <= 0) return res.status(400).json({ success: false, message: 'Quantity must be > 0' });

  const item = await Inventory.findOne({ _id: req.params.id, project: req.params.projectId });
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

  item.currentStock += Number(quantity);
  item.transactions.push({ type: 'in', quantity: Number(quantity), description, recordedBy: req.user._id });
  await item.save();

  res.json({ success: true, data: item });
};

// PUT /api/inventory/:projectId/:id/out
exports.stockOut = async (req, res) => {
  const { quantity, description } = req.body;
  if (!quantity || quantity <= 0) return res.status(400).json({ success: false, message: 'Quantity must be > 0' });

  const item = await Inventory.findOne({ _id: req.params.id, project: req.params.projectId });
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

  if (item.currentStock < quantity) {
    return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${item.currentStock} ${item.unit}` });
  }

  item.currentStock -= Number(quantity);
  item.transactions.push({ type: 'out', quantity: Number(quantity), description, recordedBy: req.user._id });
  await item.save();

  // Notify admin if stock is at or below minimum
  if (item.currentStock <= item.minimumStock) {
    await notify({
      recipientId:   item.owner,
      type:          'low_stock',
      title:         `Low stock: ${item.itemName}`,
      message:       `${item.itemName} stock is at ${item.currentStock} ${item.unit} (minimum: ${item.minimumStock})`,
      relatedProject: item.project,
    });
  }

  res.json({ success: true, data: item });
};
