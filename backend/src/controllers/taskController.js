const Task    = require('../models/Task');
const Project = require('../models/Project');
const notify  = require('../utils/notify');

exports.getTasks = async (req, res) => {
  const filter = { project: req.query.projectId };
  if (req.query.status)   filter.status   = req.query.status;
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
  const wasCompleted = req.body.status === 'completed';
  if (wasCompleted) req.body.completedAt = new Date();

  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

  // On task completion: notify the linked client user
  if (wasCompleted && task?.project) {
    const project = await Project.findById(task.project);
    if (project?.clientUserId) {
      await notify({
        recipientId:    project.clientUserId,
        type:           'task_completed',
        title:          `Task Completed: ${task.title}`,
        message:        `"${task.title}" has been marked as completed on ${project.name}.`,
        relatedProject: project._id,
        relatedEntity:  task._id.toString(),
      });
    }
  }

  res.json({ success: true, data: task });
};

exports.deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Task deleted' });
};
