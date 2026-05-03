const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) query.role = role;

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const tasks = await Task.find({ assignedTo: user._id }).populate('projectId', 'title');
    const projects = await Project.find({ members: user._id }).select('title status');

    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'completed').length,
      pendingTasks: tasks.filter((t) => t.status !== 'completed').length,
      totalProjects: projects.length,
    };

    res.json({ success: true, user, stats, tasks, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Deactivate user
// @route   PUT /api/users/:id/deactivate
// @access  Admin
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User deactivated.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get member productivity stats
// @route   GET /api/users/productivity
// @access  Admin
const getProductivityStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                { $and: [{ $lt: ['$dueDate', new Date()] }, { $ne: ['$status', 'completed'] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          avatar: '$user.avatar',
          total: 1,
          completed: 1,
          overdue: 1,
          rate: { $multiply: [{ $divide: ['$completed', '$total'] }, 100] },
        },
      },
      { $sort: { rate: -1 } },
    ]);

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, getUser, updateUserRole, deactivateUser, getProductivityStats };
