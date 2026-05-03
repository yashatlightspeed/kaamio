import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createTask } from '../../redux/slices/taskSlice';
import Spinner from '../common/Spinner';
import toast from 'react-hot-toast';

const CreateTaskModal = ({ projectId, members = [], onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [data, setData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    labels: '',
    subtasks: [],
  });

  const set = (k, v) => setData((p) => ({ ...p, [k]: v }));

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    setData((p) => ({ ...p, subtasks: [...p.subtasks, { title: subtaskInput.trim(), completed: false }] }));
    setSubtaskInput('');
  };

  const removeSubtask = (i) => setData((p) => ({ ...p, subtasks: p.subtasks.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.title.trim()) return;
    setLoading(true);
    const payload = {
      ...data,
      projectId,
      labels: data.labels ? data.labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
      assignedTo: data.assignedTo || null,
    };
    const res = await dispatch(createTask(payload));
    setLoading(false);
    if (res.type === 'tasks/create/fulfilled') {
      toast.success('Task created!');
      onClose();
    } else {
      toast.error(res.payload || 'Failed to create task');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Task Title *</label>
        <input className="input-field" placeholder="e.g. Implement login flow" value={data.title} onChange={(e) => set('title', e.target.value)} required />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input-field resize-none" rows={3} placeholder="Task details..." value={data.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Priority</label>
          <select className="input-field" value={data.priority} onChange={(e) => set('priority', e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="label">Due Date</label>
          <input type="date" className="input-field" value={data.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Assign To</label>
        <select className="input-field" value={data.assignedTo} onChange={(e) => set('assignedTo', e.target.value)}>
          <option value="">Unassigned</option>
          {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Labels <span className="text-slate-600">(comma-separated)</span></label>
        <input className="input-field" placeholder="bug, feature, frontend" value={data.labels} onChange={(e) => set('labels', e.target.value)} />
      </div>
      {/* Subtasks */}
      <div>
        <label className="label">Subtasks</label>
        <div className="flex gap-2 mb-2">
          <input
            className="input-field flex-1 text-sm"
            placeholder="Add subtask..."
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
          />
          <button type="button" onClick={addSubtask} className="btn-secondary px-3 text-sm">Add</button>
        </div>
        {data.subtasks.length > 0 && (
          <div className="space-y-1.5">
            {data.subtasks.map((s, i) => (
              <div key={i} className="flex items-center gap-2 bg-surface-700 rounded-lg px-3 py-2 border border-white/5">
                <span className="text-sm text-slate-300 flex-1">{s.title}</span>
                <button type="button" onClick={() => removeSubtask(i)} className="text-slate-500 hover:text-red-400 text-xs">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
        {loading && <Spinner />}
        Create Task
      </button>
    </form>
  );
};

export default CreateTaskModal;
