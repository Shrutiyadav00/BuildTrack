const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
  const filter = { project: req.query.projectId };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  const tasks = await Task.find(filter).populate('assignedTo createdBy', 'name');
  res.json({ success: true, data: tasks });
};

exports.createTask = async (req, res) => {
  req.body.createdBy = req.user._id;
  const task = await Task.create(req.body);
  res.status(201).json({ success: true, data: task });
};

exports.updateTask = async (req, res) => {
  if (req.body.status === 'completed') req.body.completedAt = new Date();
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: task });
};

exports.deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Task deleted' });
};
