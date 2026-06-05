const { v4: uuidv4 } = require('uuid');
const Project = require('../models/Project');

exports.getProjects = async (req, res) => {
  let query;
  
  // Filter by role: Owners see owned projects, Engineers/Supervisors see projects they're assigned to
  if (req.user.role === 'owner') {
    query = { owner: req.user._id };
  } else if (['engineer', 'supervisor', 'manager'].includes(req.user.role)) {
    query = {
      $or: [
        { leadEngineer: req.user._id },
        { team: req.user._id }
      ]
    };
  } else {
    query = {};
  }
  
  const projects = await Project.find(query).populate('leadEngineer', 'name email');
  res.json({ success: true, data: projects });
};

exports.getProject = async (req, res) => {
  const project = await Project.findById(req.params.id).populate('team leadEngineer', 'name email role');
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  res.json({ success: true, data: project });
};

exports.createProject = async (req, res) => {
  req.body.owner = req.user._id;
  const project = await Project.create(req.body);
  res.status(201).json({ success: true, data: project });
};

exports.updateProject = async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, data: project });
};

exports.deleteProject = async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Project deleted' });
};

exports.generateClientToken = async (req, res) => {
  const token = uuidv4();
  const project = await Project.findByIdAndUpdate(req.params.id, { clientPortalToken: token, clientPortalEnabled: true }, { new: true });
  res.json({ success: true, token: project.clientPortalToken });
};
