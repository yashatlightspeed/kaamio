const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create project
// @route   POST /api/projects
// @access  Admin
const createProject = async (req, res) => {
  try {
    const { title, description, deadline, priority, members, color } = req.body;

    const project = await Project.create({
      title,
      description,
      deadline,
      priority,
      color,
      createdBy: req.user._id,
      members: members || [],
    });

    await project.populate('createdBy members', 'name email avatar role');

    // Notify members
    if (members && members.length > 0) {
      const notifications = members.map((memberId) => ({
        userId: memberId,
        message: `You've been added to project "${title}"`,
        type: 'project_created',
        link: `/projects/${project._id}`,
        relatedId: project._id,
      }));
      await Notification.insertMany(notifications);
    }

    await ActivityLog.create({
      userId: req.user._id,
      action: `Created project "${title}"`,
      targetId: project._id,
      targetType: 'project',
      projectId: project._id,
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io && members) {
      members.forEach((memberId) => {
        io.to(`user_${memberId}`).emit('notification', {
          message: `You've been added to project "${title}"`,
          type: 'project_created',
        });
      });
    }

    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all projects (admin: all, member: assigned)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { status, archived, search } = req.query;
    let query = {};

    if (req.user.role !== 'admin') {
      query.$or = [{ createdBy: req.user._id }, { members: req.user._id }];
    }

    if (status) query.status = status;
    if (archived !== undefined) query.archived = archived === 'true';
    else query.archived = false;

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar role')
      .sort({ createdAt: -1 });

    // Attach task stats
    const projectsWithStats = await Promise.all(
      projects.map(async (p) => {
        const tasks = await Task.find({ projectId: p._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === 'completed').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Update project progress
        await Project.findByIdAndUpdate(p._id, { progress });

        return {
          ...p.toObject(),
          progress,
          totalTasks,
          completedTasks,
        };
      })
    );

    res.json({ success: true, projects: projectsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar role department');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check access
    const isMember = project.members.some((m) => m._id.toString() === req.user._id.toString());
    const isCreator = project.createdBy._id.toString() === req.user._id.toString();

    if (req.user.role !== 'admin' && !isMember && !isCreator) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const tasks = await Task.find({ projectId: project._id }).populate('assignedTo', 'name email avatar');
    const activityLogs = await ActivityLog.find({ projectId: project._id })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, project, tasks, activityLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Admin
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy members', 'name email avatar');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    await ActivityLog.create({
      userId: req.user._id,
      action: `Updated project "${project.title}"`,
      targetId: project._id,
      targetType: 'project',
      projectId: project._id,
    });

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    await Task.deleteMany({ projectId: project._id });
    await ActivityLog.deleteMany({ projectId: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Admin
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (project.members.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User already in project.' });
    }

    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email avatar role');

    const user = await User.findById(userId);
    await Notification.create({
      userId,
      message: `You've been added to project "${project.title}"`,
      type: 'member_added',
      link: `/projects/${project._id}`,
    });

    await ActivityLog.create({
      userId: req.user._id,
      action: `Added ${user.name} to project "${project.title}"`,
      targetId: userId,
      targetType: 'user',
      projectId: project._id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${userId}`).emit('notification', {
        message: `You've been added to project "${project.title}"`,
        type: 'member_added',
      });
    }

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Admin
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    project.members = project.members.filter((m) => m.toString() !== req.params.userId);
    await project.save();

    await ActivityLog.create({
      userId: req.user._id,
      action: `Removed member from project "${project.title}"`,
      targetType: 'user',
      projectId: project._id,
    });

    res.json({ success: true, message: 'Member removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Archive project
// @route   PUT /api/projects/:id/archive
// @access  Admin
const archiveProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { archived: true, status: 'archived' },
      { new: true }
    );
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    res.json({ success: true, message: 'Project archived.', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get analytics summary
// @route   GET /api/projects/analytics/summary
// @access  Admin
const getAnalytics = async (req, res) => {
  try {
    const [totalProjects, activeProjects, completedProjects, totalTasks, completedTasks, overdueTasks] =
      await Promise.all([
        Project.countDocuments({ archived: false }),
        Project.countDocuments({ status: 'active', archived: false }),
        Project.countDocuments({ status: 'completed' }),
        Task.countDocuments(),
        Task.countDocuments({ status: 'completed' }),
        Task.countDocuments({ dueDate: { $lt: new Date() }, status: { $ne: 'completed' } }),
      ]);

    const pendingTasks = totalTasks - completedTasks;

    // Member workload
    const memberWorkload = await Task.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', avatar: '$user.avatar', count: 1, completed: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Recent activity
    const recentActivity = await require('../models/ActivityLog')
      .find()
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      analytics: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        productivityRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        memberWorkload,
        recentActivity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  archiveProject,
  getAnalytics,
};
