const { v4: uuidv4 } = require('uuid');
const Project = require('../models/Project');
const { getOrgId } = require('../middleware/auth');

exports.getProjects = async (req, res) => {
  const orgId = getOrgId(req.user);
  let query;

  if (['super_admin', 'admin', 'owner'].includes(req.user.role)) {
    // Admin group: see all projects belonging to their organization
    query = { owner: orgId };
  } else if (['engineer', 'supervisor', 'manager'].includes(req.user.role)) {
    // Engineer group: only projects where they are lead or team member
    query = {
      owner: orgId,         // still org-scoped — can't see other orgs' projects
      $or: [
        { leadEngineer: req.user._id },
        { team: req.user._id }
      ]
    };
  } else if (req.user.role === 'client') {
    // Client: only their linked project
    query = { _id: req.user.clientProjectId };
  } else {
    query = { _id: null }; // safety fallback — return nothing
  }

  const projects = await Project.find(query).populate('leadEngineer', 'name email');
  res.json({ success: true, data: projects });
};

exports.getProject = async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('team leadEngineer', 'name email role')
    .populate('clientUserId', 'name email');
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  res.json({ success: true, data: project });
};

exports.createProject = async (req, res) => {
  // Always assign project to the org owner — even if an invited admin creates it
  req.body.owner = getOrgId(req.user);
  const project = await Project.create(req.body);
  res.status(201).json({ success: true, data: project });
};

exports.updateProject = async (req, res) => {
  const orgId = getOrgId(req.user);
  // Verify project belongs to this org before updating
  const existing = await Project.findOne({ _id: req.params.id, owner: orgId });
  if (!existing) return res.status(404).json({ success: false, message: 'Project not found' });

  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, data: project });
};

exports.deleteProject = async (req, res) => {
  const orgId = getOrgId(req.user);
  const existing = await Project.findOne({ _id: req.params.id, owner: orgId });
  if (!existing) return res.status(404).json({ success: false, message: 'Project not found' });

  await Project.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Project deleted' });
};

exports.generateClientToken = async (req, res) => {
  const token = uuidv4();
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { clientPortalToken: token, clientPortalEnabled: true },
    { new: true }
  );
  res.json({ success: true, token: project.clientPortalToken });
};
