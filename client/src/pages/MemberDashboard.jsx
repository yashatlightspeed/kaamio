import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchMyTasks } from '../redux/slices/taskSlice';
import { fetchProjects } from '../redux/slices/projectSlice';
import { StatusBadge, PriorityBadge } from '../components/common/Badges';
import { formatDistanceToNow, isPast, format } from 'date-fns';
import Spinner from '../components/common/Spinner';

const StatCard = ({ label, value, icon, color }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <div className={`text-3xl font-black mb-1 ${color}`}>{value}</div>
        <div className="text-slate-400 text-sm">{label}</div>
      </div>
      <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center text-xl">{icon}</div>
    </div>
  </motion.div>
);

const MemberDashboard = () => {
  const dispatch = useDispatch();
  const { myTasks, myStats, loading } = useSelector((s) => s.tasks);
  const { list: projects } = useSelector((s) => s.projects);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchMyTasks());
    dispatch(fetchProjects());
  }, []);

  const upcomingTasks = myTasks
    .filter((t) => t.status !== 'completed' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 6);

  const overdueTasks = myTasks.filter(
    (t) => t.status !== 'completed' && t.dueDate && isPast(new Date(t.dueDate))
  );

  const productivityScore =
    myStats?.total > 0 ? Math.round((myStats.completed / myStats.total) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">
          Hey, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          You have{' '}
          <span className="text-white font-semibold">{myStats?.inProgress ?? 0} tasks in progress</span>
          {overdueTasks.length > 0 && (
            <span className="text-red-400"> and {overdueTasks.length} overdue</span>
          )}.
        </p>
      </div>

      {loading && !myStats ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="My Tasks" value={myStats?.total ?? 0} icon="📋" color="text-brand-400" />
            <StatCard label="Completed" value={myStats?.completed ?? 0} icon="✅" color="text-emerald-400" />
            <StatCard label="In Progress" value={myStats?.inProgress ?? 0} icon="⚡" color="text-blue-400" />
            <StatCard label="Overdue" value={overdueTasks.length} icon="⚠️" color="text-red-400" />
          </div>

          {/* Productivity score */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-white">My Productivity Score</div>
                <div className="text-xs text-slate-500 mt-0.5">Based on task completion rate</div>
              </div>
              <div className="text-3xl font-black gradient-text">{productivityScore}%</div>
            </div>
            <div className="h-2.5 bg-surface-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${productivityScore}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Upcoming Tasks */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">My Tasks</h3>
                <span className="text-xs text-slate-500">{myStats?.total} total</span>
              </div>
              <div className="space-y-2">
                {upcomingTasks.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-sm">🎉 No pending tasks</div>
                )}
                {upcomingTasks.map((task) => {
                  const isOverdue = task.dueDate && isPast(new Date(task.dueDate));
                  return (
                    <div key={task._id} className="flex items-start gap-3 p-3 rounded-xl bg-surface-700 border border-white/5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isOverdue ? 'bg-red-500' : 'bg-brand-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{task.title}</div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <StatusBadge status={task.status} />
                          <PriorityBadge priority={task.priority} />
                          {task.dueDate && (
                            <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                              {isOverdue ? '⚠ ' : ''}
                              {format(new Date(task.dueDate), 'MMM d')}
                            </span>
                          )}
                        </div>
                        {task.projectId?.title && (
                          <div className="text-xs text-slate-600 mt-1 truncate">📁 {task.projectId.title}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* My Projects */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">My Projects</h3>
                <Link to="/projects" className="text-brand-400 text-xs hover:text-brand-300">View all →</Link>
              </div>
              <div className="space-y-3">
                {projects.slice(0, 5).map((p) => (
                  <Link
                    key={p._id}
                    to={`/projects/${p._id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-700 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm"
                      style={{ background: `${p.color || '#7c3aed'}25`, border: `1px solid ${p.color || '#7c3aed'}35` }}
                    >
                      📁
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{p.title}</div>
                      <div className="text-xs text-slate-500">{p.progress}% complete</div>
                    </div>
                    <div className="w-16 h-1.5 bg-surface-600 rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </Link>
                ))}
                {projects.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-sm">No projects assigned</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MemberDashboard;
