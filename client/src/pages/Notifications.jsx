import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications, markRead, markAllRead, deleteNotification } from '../redux/slices/notificationSlice';
import Spinner from '../components/common/Spinner';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  task_assigned: '📋',
  deadline_near: '⏰',
  task_overdue: '⚠️',
  status_updated: '🔄',
  member_added: '👥',
  project_created: '📁',
  comment_added: '💬',
  general: '🔔',
};

const Notifications = () => {
  const dispatch = useDispatch();
  const { list, unreadCount, loading } = useSelector((s) => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, []);

  const handleMarkRead = (id) => dispatch(markRead(id));

  const handleMarkAllRead = async () => {
    await dispatch(markAllRead());
    toast.success('All marked as read');
  };

  const handleDelete = async (id) => {
    await dispatch(deleteNotification(id));
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-brand-400 text-sm mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-ghost text-sm text-brand-400">
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <div className="text-white font-semibold mb-1">All caught up!</div>
          <div className="text-slate-500 text-sm">No notifications yet.</div>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {list.map((n) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className={`card p-4 flex items-start gap-3 transition-all ${!n.read ? 'border-brand-500/20 bg-brand-600/5' : ''}`}
              >
                {/* Unread dot */}
                <div className="flex-shrink-0 pt-0.5">
                  {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 mt-1" />}
                  {n.read && <div className="w-2 h-2 rounded-full bg-transparent mt-1" />}
                </div>

                {/* Icon */}
                <div className="w-9 h-9 rounded-xl bg-surface-700 flex items-center justify-center text-lg flex-shrink-0 border border-white/5">
                  {TYPE_ICONS[n.type] || '🔔'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${n.read ? 'text-slate-400' : 'text-white'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      className="p-1.5 rounded-lg hover:bg-surface-600 text-slate-500 hover:text-brand-400 transition-colors"
                      title="Mark read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors text-xs"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Notifications;
