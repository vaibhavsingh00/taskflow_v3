const Project = require("../models/Project");
const Task = require("../models/Task");

// @route GET /api/projects
// admin sees all projects, member sees only projects they are in
const getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === "admin") {
      // admin sees everything
      projects = await Project.find()
        .populate("createdBy", "name email")
        .populate("members", "name email")
        .sort({ createdAt: -1 });
    } else {
      // member only sees projects where they are added
      projects = await Project.find({ members: req.user._id })
        .populate("createdBy", "name email")
        .populate("members", "name email")
        .sort({ createdAt: -1 });
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects" });
  }
};

// @route POST /api/projects
const createProject = async (req, res) => {
  const { title, description, deadline, members } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Project title is required" });
  }

  try {
    const project = await Project.create({
      title,
      description,
      deadline,
      members: members || [],
      createdBy: req.user._id,
    });

    // populate for immediate response
    const populated = await Project.findById(project._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error creating project" });
  }
};

// @route GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // if member, make sure they are part of this project
    if (req.user.role === "member") {
      const isMember = project.members.some(
        (m) => m._id.toString() === req.user._id.toString()
      );
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project" });
  }
};

// @route PUT /api/projects/:id
const updateProject = async (req, res) => {
  const { title, description, deadline, members } = req.body;

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.title = title || project.title;
    project.description = description ?? project.description;
    project.deadline = deadline ?? project.deadline;
    project.members = members ?? project.members;

    const updated = await project.save();
    const populated = await Project.findById(updated._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error updating project" });
  }
};

// @route DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // also delete all tasks in this project
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: "Project and its tasks deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project" });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
};
