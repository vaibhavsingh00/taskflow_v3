const Task = require("../models/Task");
const Project = require("../models/Project");

const populate = (q) =>
  q
    .populate("project", "title")
    .populate("assignedTo", "name email")
    .populate("createdBy", "name");

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "member") {
      filter.assignedTo = req.user._id;
    }
    if (req.query.project) filter.project = req.query.project;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const tasks = await populate(Task.find(filter)).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  const { title, description, status, priority, deadline, project, assignedTo } = req.body;

  if (!title || !project)
    return res.status(400).json({ message: "Title and project are required" });

  try {
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: "Project not found" });

    const task = await Task.create({
      title,
      description: description || "",
      status: status || "todo",
      priority: priority || "medium",
      deadline: deadline || null,
      project,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
    });

    const result = await populate(Task.findById(task._id));
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating task" });
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const task = await populate(Task.findById(req.params.id));
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (
      req.user.role === "member" &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Error fetching task" });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role === "member") {
      // member can only update status of their own task
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (req.body.status) task.status = req.body.status;
    } else {
      // admin/manager can update all fields
      if (req.body.title !== undefined) task.title = req.body.title;
      if (req.body.description !== undefined) task.description = req.body.description;
      if (req.body.status !== undefined) task.status = req.body.status;
      if (req.body.priority !== undefined) task.priority = req.body.priority;
      if (req.body.deadline !== undefined) task.deadline = req.body.deadline;
      if (req.body.assignedTo !== undefined) task.assignedTo = req.body.assignedTo || null;
    }

    const updated = await task.save();
    const result = await populate(Task.findById(updated._id));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating task" });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting task" });
  }
};

// GET /api/tasks/stats
const getTaskStats = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "member") filter.assignedTo = req.user._id;

    const now = new Date();
    const [total, completed, inProgress, review, todo, overdue] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: "completed" }),
      Task.countDocuments({ ...filter, status: "in-progress" }),
      Task.countDocuments({ ...filter, status: "review" }),
      Task.countDocuments({ ...filter, status: "todo" }),
      Task.countDocuments({
        ...filter,
        deadline: { $lt: now },
        status: { $ne: "completed" },
      }),
    ]);

    res.json({ total, completed, inProgress, review, todo, overdue });
  } catch (err) {
    res.status(500).json({ message: "Error getting stats" });
  }
};

module.exports = { getTasks, createTask, getTaskById, updateTask, deleteTask, getTaskStats };
