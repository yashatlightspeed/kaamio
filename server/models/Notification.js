const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['task_assigned', 'deadline_near', 'task_overdue', 'status_updated', 'member_added', 'project_created', 'comment_added', 'general'],
      default: 'general',
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: '',
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
