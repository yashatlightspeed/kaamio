import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProjects, createProject, deleteProject, updateProject } from '../redux/slices/projectSlice';
import { getUsers } from '../services/userService';
import Modal from '../components/common/Modal';
import { PriorityBadge, ProjectStatusBadge } from '../components/common/Badges';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PROJECT_COLORS = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const ProjectCard = ({ project, onEdit, onDelete, isAdmin }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="card-hover p-5 flex flex-col gap-4"
  >
    {/* Header */}
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
          style={{ background: `${project.color || '#7c3aed'}20`, border: `1px solid ${project.color || '#7c3aed'}35` }}
        >
          📁
        </div>
        <div className="min-w-0">
          <Link to={`/projects/${project._id}`} className="font-semibold text-white hover:text-brand-300 transition-colors truncate block">
            {project.title}
          </Link>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <ProjectStatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
          </div>
        </div>
      </div>
      {isAdmin && (
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(project)} className="p-1.5 rounded-lg hover:bg-surface-600 text-slate-500 hover:text-white transition-colors text-sm">✏️</button>
          <button onClick={() => onDelete(project._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors text-sm">🗑️</button>
        </div>
      )}
    </div>

    {/* Description */}
    {project.description && (
      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{project.description}</p>
    )}

    {/* Progress */}
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
        <span>Progress</span>
        <span className="font-semibold text-white">{project.progress ?? 0}%</span>
      </div>
      <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${project.progress ?? 0}%`,
            background: `linear-gradient(90deg, ${project.color || '#7c3aed'}, ${project.color || '#7c3aed'}99)`,
          }}
        />
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between pt-1">
      {/* Members */}
      <div className="flex -space-x-2">
        {project.members?.slice(0, 4).map((m, i) => (
          <div
            key={m._id || i}
            title={m.name}
            className="w-7 h-7 rounded-full bg-brand-600/30 border-2 border-surface-800 flex items-center justify-center text-xs font-semibold text-brand-300"
          >
            {m.name?.charAt(0).toUpperCase()}
          </div>
        ))}
        {(project.members?.length ?? 0) > 4 && (
          <div className="w-7 h-7 rounded-full bg-surface-700 border-2 border-surface-800 flex items-center justify-center text-xs text-slate-400">
            +{project.members.length - 4}
          </div>
        )}
      </div>

      {/* Deadline */}
      {project.deadline && (
        <span className="text-xs text-slate-500">
          📅 {format(new Date(project.deadline), 'MMM d, yyyy')}
        </span>
      )}
    </div>

    {/* Task stats */}
    <div className="flex items-center gap-4 pt-1 border-t border-white/5">
      <span className="text-xs text-slate-500">
        <span className="text-white font-semibold">{project.totalTasks ?? 0}</span> tasks
      </span>
      <span className="text-xs text-slate-500">
        <span className="text-emerald-400 font-semibold">{project.completedTasks ?? 0}</span> done
      </span>
      <Link to={`/projects/${project._id}`} className="ml-auto text-xs text-brand-400 hover:text-brand-300">
        Open →
      </Link>
    </div>
  </motion.div>
);

const ProjectForm = ({ initial, onSubmit, loading, users }) => {
  const [formData, setFormData] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    deadline: initial?.deadline ? format(new Date(initial.deadline), 'yyyy-MM-dd') : '',
    priority: initial?.priority || 'medium',
    status: initial?.status || 'active',
    color: initial?.color || '#7c3aed',
    members: initial?.members?.map((m) => m._id || m) || [],
  });

  const set = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  const toggleMember = (uid) => {
    setFormData((p) => ({
      ...p,
      members: p.members.includes(uid) ? p.members.filter((id) => id !== uid) : [...p.members, uid],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Project Title *</label>
        <input className="input-field" placeholder="e.g. AIHRT Platform v2" value={formData.title} onChange={(e) => set('title', e.target.value)} required />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input-field resize-none" rows={3} placeholder="What is this project about?" value={formData.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Priority</label>
          <select className="input-field" value={formData.priority} onChange={(e) => set('priority', e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input-field" value={formData.status} onChange={(e) => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Deadline</label>
        <input className="input-field" type="date" value={formData.deadline} onChange={(e) => set('deadline', e.target.value)} />
      </div>
      <div>
        <label className="label">Color</label>
        <div className="flex gap-2 flex-wrap">
          {PROJECT_COLORS.map((c) => (
            <button key={c} type="button" onClick={() => set('color', c)}
              className={`w-7 h-7 rounded-lg transition-all ${formData.color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-surface-800 scale-110' : ''}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="label">Add Members</label>
        <div className="max-h-40 overflow-y-auto space-y-1.5 border border-white/10 rounded-xl p-2 bg-surface-900/50">
          {users.map((u) => (
            <label key={u._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-700 cursor-pointer transition-colors">
              <input type="checkbox" checked={formData.members.includes(u._id)} onChange={() => toggleMember(u._id)} className="accent-brand-500" />
              <div className="w-6 h-6 rounded-lg bg-brand-600/25 flex items-center justify-center text-xs font-semibold text-brand-300">
                {u.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-white">{u.name}</div>
                <div className="text-xs text-slate-500 capitalize">{u.role}</div>
              </div>
            </label>
          ))}
          {users.length === 0 && <p className="text-center text-slate-500 text-sm py-3">No users found</p>}
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
        {loading && <Spinner />}
        {initial ? 'Update Project' : 'Create Project'}
      </button>
    </form>
  );
};

const Projects = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.projects);
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';

  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    dispatch(fetchProjects());
    if (isAdmin) {
      getUsers().then(setUsers).catch(() => {});
    }
  }, []);

  const handleCreate = async (data) => {
    setSubmitting(true);
    const res = await dispatch(createProject(data));
    setSubmitting(false);
    if (res.type === 'projects/create/fulfilled') {
      toast.success('Project created!');
      setShowCreate(false);
    } else toast.error(res.payload || 'Failed to create project');
  };

  const handleEdit = async (data) => {
    setSubmitting(true);
    const res = await dispatch(updateProject({ id: editProject._id, data }));
    setSubmitting(false);
    if (res.type === 'projects/update/fulfilled') {
      toast.success('Project updated!');
      setEditProject(null);
    } else toast.error(res.payload || 'Failed to update');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    const res = await dispatch(deleteProject(id));
    if (res.type === 'projects/delete/fulfilled') toast.success('Project deleted');
    else toast.error('Failed to delete');
  };

  const filtered = list.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-0.5">{list.length} projects total</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            + New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="input-field max-w-xs"
          placeholder="🔍 Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input-field max-w-[160px]" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">📁</div>
          <div className="text-white font-semibold mb-1">No projects found</div>
          <div className="text-slate-500 text-sm mb-4">
            {isAdmin ? 'Create your first project to get started.' : 'You have no assigned projects.'}
          </div>
          {isAdmin && <button onClick={() => setShowCreate(true)} className="btn-primary">Create Project</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((p) => (
              <ProjectCard key={p._id} project={p} onEdit={setEditProject} onDelete={handleDelete} isAdmin={isAdmin} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Project" size="md">
        <ProjectForm onSubmit={handleCreate} loading={submitting} users={users} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editProject} onClose={() => setEditProject(null)} title="Edit Project" size="md">
        {editProject && <ProjectForm initial={editProject} onSubmit={handleEdit} loading={submitting} users={users} />}
      </Modal>
    </div>
  );
};

export default Projects;
