import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchProject, addMember, updateProject } from '../redux/slices/projectSlice';
import { fetchProjectTasks } from '../redux/slices/taskSlice';
import { clearTasks } from '../redux/slices/taskSlice';
import Modal from '../components/common/Modal';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import { PriorityBadge, ProjectStatusBadge } from '../components/common/Badges';
import Spinner from '../components/common/Spinner';
import { getUsers } from '../services/userService';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';

const TABS = ['Board', 'List', 'Members', 'Activity'];

const ProjectDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, loading } = useSelector((s) => s.projects);
  const { list: tasks, loading: tasksLoading } = useSelector((s) => s.tasks);
  const { user } = useSelector((s) => s.auth);

  const [activeTab, setActiveTab] = useState('Board');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const isAdmin = user?.role === 'admin';
  const project = current?.project;
  const activityLogs = current?.activityLogs || [];

  useEffect(() => {
    dispatch(fetchProject(id));
    dispatch(fetchProjectTasks({ projectId: id }));
    if (isAdmin) getUsers().then(setAllUsers).catch(() => {});
    return () => dispatch(clearTasks());
  }, [id]);

  const handleAddMember = async (userId) => {
    const res = await dispatch(addMember({ projectId: id, userId }));
    if (res.type === 'projects/addMember/fulfilled') toast.success('Member added!');
    else toast.error(res.payload || 'Failed');
  };

  const handleArchive = async () => {
    if (!window.confirm('Archive this project?')) return;
    await api.put(`/projects/${id}/archive`);
    toast.success('Project archived');
    navigate('/projects');
  };

  const filteredTasks = tasks.filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchPriority = !filterPriority || t.priority === filterPriority;
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchPriority && matchStatus;
  });

  // When a task is selected, find the latest version from redux
  const liveSelectedTask = selectedTask
    ? tasks.find((t) => t._id === selectedTask._id) || selectedTask
    : null;

  if (loading && !current) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (!project) return <div className="card p-12 text-center text-slate-400">Project not found</div>;

  const memberIds = project.members?.map((m) => m._id || m) || [];
  const nonMembers = allUsers.filter((u) => !memberIds.includes(u._id) && u._id !== project.createdBy?._id);

  return (
    <div className="space-y-5 max-w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${project.color || '#7c3aed'}20`, border: `1px solid ${project.color || '#7c3aed'}35` }}
            >
              📁
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-white truncate">{project.title}</h1>
                <ProjectStatusBadge status={project.status} />
                <PriorityBadge priority={project.priority} />
              </div>
              {project.description && (
                <p className="text-slate-400 text-sm mt-0.5 truncate">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isAdmin && (
              <>
                <button onClick={() => setShowCreateTask(true)} className="btn-primary text-sm">
                  + Task
                </button>
                <button onClick={() => setShowAddMember(true)} className="btn-secondary text-sm">
                  + Member
                </button>
                <button onClick={handleArchive} className="btn-ghost text-sm text-slate-500">
                  Archive
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress + stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface-700 rounded-xl p-3 border border-white/5">
            <div className="text-xl font-black gradient-text">{project.progress ?? 0}%</div>
            <div className="text-xs text-slate-500">Progress</div>
          </div>
          <div className="bg-surface-700 rounded-xl p-3 border border-white/5">
            <div className="text-xl font-black text-white">{tasks.length}</div>
            <div className="text-xs text-slate-500">Total Tasks</div>
          </div>
          <div className="bg-surface-700 rounded-xl p-3 border border-white/5">
            <div className="text-xl font-black text-emerald-400">{tasks.filter((t) => t.status === 'completed').length}</div>
            <div className="text-xs text-slate-500">Completed</div>
          </div>
          <div className="bg-surface-700 rounded-xl p-3 border border-white/5">
            <div className="text-xl font-black text-white">{project.members?.length ?? 0}</div>
            <div className="text-xs text-slate-500">Members</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress ?? 0}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${project.color || '#7c3aed'}, ${project.color || '#7c3aed'}90)` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/5">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-brand-400 border-brand-500'
                : 'text-slate-500 border-transparent hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}

        {/* Filters (Board/List) */}
        {(activeTab === 'Board' || activeTab === 'List') && (
          <div className="ml-auto flex items-center gap-2 pb-1">
            <input
              className="input-field text-xs py-1.5 px-3 w-36"
              placeholder="🔍 Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="input-field text-xs py-1.5 px-2 w-28" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="">Priority</option>
              {['low','medium','high','critical'].map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'Board' && (
        tasksLoading ? <div className="flex justify-center py-10"><Spinner size="lg" /></div> :
        <KanbanBoard tasks={filteredTasks} onTaskClick={setSelectedTask} isAdmin={isAdmin} />
      )}

      {activeTab === 'List' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-700 border-b border-white/5">
              <tr>
                {['Task', 'Status', 'Priority', 'Assigned To', 'Due Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((t, i) => {
                const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed';
                return (
                  <tr
                    key={t._id}
                    onClick={() => setSelectedTask(t)}
                    className={`border-b border-white/5 cursor-pointer hover:bg-surface-700/50 transition-colors ${i % 2 === 0 ? '' : 'bg-surface-800/30'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{t.title}</div>
                      {t.labels?.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {t.labels.map((l) => <span key={l} className="text-[10px] bg-brand-600/15 text-brand-400 px-1.5 py-0.5 rounded-full">{l}</span>)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3"><span className={`badge ${t.status === 'completed' ? 'status-completed' : t.status === 'in-progress' ? 'status-in-progress' : t.status === 'review' ? 'status-review' : 'status-todo'}`}>{t.status}</span></td>
                    <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-4 py-3 text-slate-400">{t.assignedTo?.name || '—'}</td>
                    <td className={`px-4 py-3 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                      {t.dueDate ? format(new Date(t.dueDate), 'MMM d, yyyy') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-slate-500">No tasks found</div>
          )}
        </div>
      )}

      {activeTab === 'Members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Creator */}
          {project.createdBy && (
            <div className="card p-4 flex items-center gap-3 border-brand-500/20">
              <div className="w-10 h-10 rounded-xl bg-brand-600/25 flex items-center justify-center font-bold text-brand-300">
                {project.createdBy.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-white truncate">{project.createdBy.name}</div>
                <div className="text-xs text-brand-400">Project Creator</div>
              </div>
            </div>
          )}
          {project.members?.map((m) => {
            const memberTasks = tasks.filter((t) => t.assignedTo?._id === (m._id || m));
            const completed = memberTasks.filter((t) => t.status === 'completed').length;
            return (
              <div key={m._id} className="card p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center font-bold text-slate-300 border border-white/10">
                    {m.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{m.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{m.role}</div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={async () => {
                        await api.delete(`/projects/${id}/members/${m._id}`);
                        dispatch(fetchProject(id));
                        toast.success('Member removed');
                      }}
                      className="ml-auto text-slate-600 hover:text-red-400 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{memberTasks.length} tasks</span>
                  <span>{completed} completed</span>
                </div>
                {memberTasks.length > 0 && (
                  <div className="h-1 bg-surface-600 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(completed / memberTasks.length) * 100}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'Activity' && (
        <div className="card p-5 space-y-3">
          {activityLogs.map((log) => (
            <div key={log._id} className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0">
              <div className="w-7 h-7 rounded-lg bg-brand-600/20 flex items-center justify-center text-xs font-semibold text-brand-400 flex-shrink-0 mt-0.5">
                {log.userId?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300">{log.action}</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          {activityLogs.length === 0 && <div className="text-center py-6 text-slate-500">No activity yet</div>}
        </div>
      )}

      {/* Task Detail Modal */}
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Task Details" size="lg">
        {liveSelectedTask && (
          <TaskDetailModal
            task={liveSelectedTask}
            onClose={() => setSelectedTask(null)}
            projectMembers={project.members || []}
            isAdmin={isAdmin}
          />
        )}
      </Modal>

      {/* Create Task Modal */}
      <Modal isOpen={showCreateTask} onClose={() => setShowCreateTask(false)} title="Create Task" size="md">
        <CreateTaskModal
          projectId={id}
          members={project.members || []}
          onClose={() => setShowCreateTask(false)}
        />
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Add Member" size="sm">
        <div className="space-y-2">
          {nonMembers.length === 0 && <p className="text-slate-500 text-sm text-center py-4">All users are already members</p>}
          {nonMembers.map((u) => (
            <div key={u._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-700 border border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center font-semibold text-brand-300 text-sm">
                  {u.name?.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{u.name}</div>
                  <div className="text-xs text-slate-500 capitalize">{u.role}</div>
                </div>
              </div>
              <button onClick={() => handleAddMember(u._id)} className="btn-primary text-xs px-3 py-1.5">Add</button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
