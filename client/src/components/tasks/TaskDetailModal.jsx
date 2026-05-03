import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Modal from '../common/Modal';
import { PriorityBadge, StatusBadge } from '../common/Badges';
import { updateTask, deleteTask, addComment } from '../../redux/slices/taskSlice';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';
import api from '../../services/api';

const STATUSES = ['todo', 'in-progress', 'review', 'completed'];
const STATUS_LABELS = { 'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'Review', 'completed': 'Completed' };

const TaskDetailModal = ({ task, onClose, projectMembers = [], isAdmin }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    assignedTo: task?.assignedTo?._id || '',
    labels: task?.labels?.join(', ') || '',
  });

  if (!task) return null;

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed';

  const handleStatusChange = async (newStatus) => {
    await dispatch(updateTask({ id: task._id, data: { status: newStatus } }));
    toast.success('Status updated');
  };

  const handleSaveEdit = async () => {
    const data = {
      ...editData,
      labels: editData.labels ? editData.labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
    };
    const res = await dispatch(updateTask({ id: task._id, data }));
    if (res.type === 'tasks/update/fulfilled') {
      toast.success('Task updated');
      setEditMode(false);
    } else toast.error('Failed to update');
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setSubmittingComment(true);
    const res = await dispatch(addComment({ taskId: task._id, text: comment }));
    setSubmittingComment(false);
    if (res.type === 'tasks/addComment/fulfilled') {
      setComment('');
    } else toast.error('Failed to add comment');
  };

  const handleSubtaskToggle = async (subtaskId, completed) => {
    await api.put(`/tasks/${task._id}/subtasks/${subtaskId}`, { completed });
    dispatch(updateTask({ id: task._id, data: {} })); // refetch
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    await dispatch(deleteTask(task._id));
    toast.success('Task deleted');
    onClose();
  };

  const set = (k, v) => setEditData((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      {/* Title & edit toggle */}
      <div className="flex items-start justify-between gap-3">
        {editMode ? (
          <input className="input-field flex-1 text-lg font-semibold" value={editData.title} onChange={(e) => set('title', e.target.value)} />
        ) : (
          <h3 className="text-lg font-bold text-white flex-1 leading-snug">{task.title}</h3>
        )}
        <div className="flex gap-1.5 flex-shrink-0">
          {(isAdmin || task.assignedTo?._id === user?._id) && (
            <button onClick={() => setEditMode(!editMode)} className="btn-ghost text-xs px-2.5 py-1.5">
              {editMode ? '✕ Cancel' : '✏️ Edit'}
            </button>
          )}
          {isAdmin && (
            <button onClick={handleDelete} className="btn-danger text-xs px-2.5 py-1.5">🗑️</button>
          )}
        </div>
      </div>

      {/* Overdue warning */}
      {isOverdue && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm flex items-center gap-2">
          ⚠️ This task is overdue
        </div>
      )}

      {/* Status chips */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
              task.status === s
                ? 'bg-brand-600 border-brand-500 text-white'
                : 'bg-surface-700 border-white/5 text-slate-400 hover:border-brand-500/30 hover:text-white'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Meta grid */}
      {editMode ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label text-xs">Priority</label>
            <select className="input-field text-sm" value={editData.priority} onChange={(e) => set('priority', e.target.value)}>
              {['low', 'medium', 'high', 'critical'].map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Due Date</label>
            <input type="date" className="input-field text-sm" value={editData.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="label text-xs">Assign To</label>
            <select className="input-field text-sm" value={editData.assignedTo} onChange={(e) => set('assignedTo', e.target.value)}>
              <option value="">Unassigned</option>
              {projectMembers.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label text-xs">Labels (comma-separated)</label>
            <input className="input-field text-sm" placeholder="bug, feature, urgent" value={editData.labels} onChange={(e) => set('labels', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="label text-xs">Description</label>
            <textarea className="input-field text-sm resize-none" rows={3} value={editData.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="col-span-2">
            <button onClick={handleSaveEdit} className="btn-primary w-full py-2">Save Changes</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 bg-surface-700/50 rounded-xl p-4 border border-white/5">
          <div>
            <div className="text-xs text-slate-500 mb-1">Priority</div>
            <PriorityBadge priority={task.priority} />
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Status</div>
            <StatusBadge status={task.status} />
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Due Date</div>
            <div className={`text-sm font-medium ${isOverdue ? 'text-red-400' : 'text-white'}`}>
              {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Assigned To</div>
            <div className="text-sm font-medium text-white">{task.assignedTo?.name || 'Unassigned'}</div>
          </div>
          {task.labels?.length > 0 && (
            <div className="col-span-2">
              <div className="text-xs text-slate-500 mb-1.5">Labels</div>
              <div className="flex gap-1.5 flex-wrap">
                {task.labels.map((l) => (
                  <span key={l} className="text-xs bg-brand-600/20 text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/20">{l}</span>
                ))}
              </div>
            </div>
          )}
          {task.description && (
            <div className="col-span-2">
              <div className="text-xs text-slate-500 mb-1">Description</div>
              <p className="text-sm text-slate-300 leading-relaxed">{task.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Subtasks */}
      {task.subtasks?.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-white mb-2">
            Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
          </div>
          <div className="space-y-1.5">
            {task.subtasks.map((sub) => (
              <label key={sub._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={sub.completed}
                  onChange={() => handleSubtaskToggle(sub._id, !sub.completed)}
                  className="accent-brand-500 w-4 h-4"
                />
                <span className={`text-sm ${sub.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>{sub.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div>
        <div className="text-sm font-semibold text-white mb-3">Comments ({task.comments?.length || 0})</div>
        <div className="space-y-3 mb-3 max-h-40 overflow-y-auto">
          {task.comments?.map((c) => (
            <div key={c._id} className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-brand-600/25 flex items-center justify-center text-xs font-semibold text-brand-300 flex-shrink-0 mt-0.5">
                {c.user?.name?.charAt(0)}
              </div>
              <div className="flex-1 bg-surface-700 rounded-xl px-3 py-2 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white">{c.user?.name}</span>
                  <span className="text-[10px] text-slate-500">{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span>
                </div>
                <p className="text-sm text-slate-300">{c.text}</p>
              </div>
            </div>
          ))}
          {task.comments?.length === 0 && <p className="text-slate-500 text-sm">No comments yet.</p>}
        </div>
        <div className="flex gap-2">
          <input
            className="input-field flex-1 text-sm"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
          />
          <button onClick={handleAddComment} disabled={!comment.trim() || submittingComment} className="btn-primary px-4 text-sm">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
