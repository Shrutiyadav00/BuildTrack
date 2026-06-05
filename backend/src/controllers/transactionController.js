const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res) => {
  const filter = { project: req.params.projectId };
  if (req.query.type) filter.type = req.query.type;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;
  const txns = await Transaction.find(filter).populate('createdBy', 'name').sort('-date');
  res.json({ success: true, data: txns });
};

exports.createTransaction = async (req, res) => {
  req.body.project = req.params.projectId;
  req.body.createdBy = req.user._id;
  const txn = await Transaction.create(req.body);
  res.status(201).json({ success: true, data: txn });
};

exports.getProjectSummary = async (req, res) => {
  const txns = await Transaction.find({ project: req.params.projectId });
  const income = txns.filter(t => ['client_receipt', 'refund'].includes(t.type)).reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter(t => !['client_receipt', 'refund'].includes(t.type)).reduce((s, t) => s + t.amount, 0);
  res.json({ success: true, data: { income, expenses, profit: income - expenses, transactions: txns.length } });
};

exports.updateTransaction = async (req, res) => {
  const txn = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: txn });
};

exports.deleteTransaction = async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Transaction deleted' });
};
