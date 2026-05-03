const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    targetType: {
      type: String,
      enum: ['project', 'task', 'user', 'comment', 'system'],
      default: 'system',
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    meta: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ projectId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
