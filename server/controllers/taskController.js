const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create task
// @route   POST /api/tasks
// @access  Admin
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate, labels, subtasks } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo: assignedTo || null,
      priority,
      dueDate,
      labels: labels || [],
      subtasks: subtasks || [],
      createdBy: req.user._id,
    });

    await task.populate('assignedTo createdBy', 'name email avatar');

    if (assignedTo) {
      await Notification.create({
        userId: assignedTo,
        message: `You've been assigned task "${title}" in "${project.title}"`,
        type: 'task_assigned',
        link: `/projects/${projectId}`,
        relatedId: task._id,
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${assignedTo}`).emit('notification', {
          message: `You've been assigned task "${title}"`,
          type: 'task_assigned',
        });
      }
    }

    await ActivityLog.create({
      userId: req.user._id,
      action: `Created task "${title}"`,
      targetId: task._id,
      targetType: 'task',
      projectId,
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get tasks for project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getProjectTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, search } = req.query;
    const query = { projectId: req.params.projectId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) query.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my tasks
// @route   GET /api/tasks/my
// @access  Private
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('projectId', 'title color')
      .populate('assignedTo', 'name avatar')
      .sort({ dueDate: 1 });

    const now = new Date();
    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      overdue: tasks.filter((t) => t.dueDate && t.dueDate < now && t.status !== 'completed').length,
      todo: tasks.filter((t) => t.status === 'todo').length,
    };

    res.json({ success: true, tasks, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.user', 'name avatar');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const oldTask = await Task.findById(req.params.id);
    if (!oldTask) return res.status(404).json({ success: false, message: 'Task not found.' });

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    // Notify on status change
    if (req.body.status && req.body.status !== oldTask.status) {
      const project = await Project.findById(task.projectId);
      if (task.assignedTo && task.assignedTo._id.toString() !== req.user._id.toString()) {
        await Notification.create({
          userId: task.assignedTo._id,
          message: `Task "${task.title}" status changed to ${req.body.status}`,
          type: 'status_updated',
          relatedId: task._id,
        });
      }

      await ActivityLog.create({
        userId: req.user._id,
        action: `Updated task "${task.title}" status to ${req.body.status}`,
        targetId: task._id,
        targetType: 'task',
        projectId: task.projectId,
      });
    }

    // Notify on assignment change
    if (req.body.assignedTo && req.body.assignedTo !== (oldTask.assignedTo?.toString())) {
      const project = await Project.findById(task.projectId);
      await Notification.create({
        userId: req.body.assignedTo,
        message: `You've been assigned task "${task.title}"`,
        type: 'task_assigned',
        relatedId: task._id,
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${req.body.assignedTo}`).emit('notification', {
          message: `You've been assigned task "${task.title}"`,
          type: 'task_assigned',
        });
      }
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    res.json({ success: true, message: 'Task deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    task.comments.push({ user: req.user._id, text });
    await task.save();
    await task.populate('comments.user', 'name avatar');

    await ActivityLog.create({
      userId: req.user._id,
      action: `Commented on task "${task.title}"`,
      targetId: task._id,
      targetType: 'comment',
      projectId: task.projectId,
    });

    res.json({ success: true, comments: task.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update subtask
// @route   PUT /api/tasks/:id/subtasks/:subtaskId
// @access  Private
const updateSubtask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ success: false, message: 'Subtask not found.' });

    subtask.completed = req.body.completed;
    await task.save();

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk update task status (Kanban drag)
// @route   PUT /api/tasks/bulk-status
// @access  Private
const bulkUpdateStatus = async (req, res) => {
  try {
    const { updates } = req.body; // [{id, status, order}]
    await Promise.all(
      updates.map(({ id, status, order }) =>
        Task.findByIdAndUpdate(id, { status, order })
      )
    );
    res.json({ success: true, message: 'Tasks updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  getMyTasks,
  getTask,
  updateTask,
  deleteTask,
  addComment,
  updateSubtask,
  bulkUpdateStatus,
};
