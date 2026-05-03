import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchAnalytics } from '../redux/slices/projectSlice';
import { fetchProjects } from '../redux/slices/projectSlice';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Spinner from '../components/common/Spinner';
import { PriorityBadge } from '../components/common/Badges';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ label, value, icon, color, sub }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className="card p-5"
  >
    <div className="flex items-start justify-between">
      <div>
        <div className={`text-3xl font-black mb-1 ${color}`}>{value}</div>
        <div className="text-slate-400 text-sm font-medium">{label}</div>
        {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
      </div>
      <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center text-xl">
        {icon}
      </div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { analytics, list: projects, loading } = useSelector((s) => s.projects);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchProjects());
  }, []);

  const pieData = analytics ? [
    { name: 'Completed', value: analytics.completedTasks, color: '#22c55e' },
    { name: 'In Progress', value: analytics.pendingTasks - analytics.overdueTasks, color: '#7c3aed' },
    { name: 'Overdue', value: analytics.overdueTasks, color: '#ef4444' },
  ] : [];

  const barData = analytics?.memberWorkload?.map((m) => ({
    name: m.name?.split(' ')[0],
    Total: m.count,
    Done: m.completed,
  })) || [];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Here's what's happening with your team today.</p>
        </div>
        <Link to="/projects" className="btn-primary text-sm hidden md:flex">
          + New Project
        </Link>
      </div>

      {loading && !analytics ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Projects" value={analytics?.totalProjects ?? 0} icon="📁" color="text-brand-400" />
            <StatCard label="Active Projects" value={analytics?.activeProjects ?? 0} icon="⚡" color="text-emerald-400" />
            <StatCard label="Completed Tasks" value={analytics?.completedTasks ?? 0} icon="✅" color="text-blue-400" />
            <StatCard label="Overdue Tasks" value={analytics?.overdueTasks ?? 0} icon="⚠️" color="text-red-400" />
          </div>

          {/* Productivity rate */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-white">Overall Productivity</span>
              <span className="text-2xl font-black gradient-text">{analytics?.productivityRate ?? 0}%</span>
            </div>
            <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${analytics?.productivityRate ?? 0}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>{analytics?.completedTasks} completed</span>
              <span>{analytics?.totalTasks} total tasks</span>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Task Distribution Pie */}
            <div className="card p-5">
              <h3 className="section-title mb-4">Task Distribution</h3>
              {pieData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={pieData} cx={75} cy={75} innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 text-sm">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-slate-400">{d.name}</span>
                        <span className="text-white font-semibold ml-auto">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">No task data yet</div>
              )}
            </div>

            {/* Member Workload Bar */}
            <div className="card p-5">
              <h3 className="section-title mb-4">Member Workload</h3>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={barData} barGap={4}>
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1e2535', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e2e8f0' }}
                    />
                    <Bar dataKey="Total" fill="#3d4562" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Done" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-slate-500">No workload data yet</div>
              )}
            </div>
          </div>

          {/* Recent projects + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Projects */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Recent Projects</h3>
                <Link to="/projects" className="text-brand-400 text-xs hover:text-brand-300">View all →</Link>
              </div>
              <div className="space-y-3">
                {projects.slice(0, 5).map((p) => (
                  <Link key={p._id} to={`/projects/${p._id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-700 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: `${p.color || '#7c3aed'}30`, border: `1px solid ${p.color || '#7c3aed'}40` }}>
                      <span className="w-full h-full flex items-center justify-center text-sm">📁</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{p.title}</div>
                      <div className="text-xs text-slate-500">{p.progress}% complete · {p.members?.length} members</div>
                    </div>
                    <div className="w-12 h-1.5 bg-surface-600 rounded-full overflow-hidden flex-shrink-0">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                  </Link>
                ))}
                {projects.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-sm">No projects yet</div>
                )}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="card p-5">
              <h3 className="section-title mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {analytics?.recentActivity?.slice(0, 6).map((log) => (
                  <div key={log._id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-brand-600/20 flex items-center justify-center text-xs font-semibold text-brand-400 flex-shrink-0 mt-0.5">
                      {log.userId?.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-300 leading-snug">{log.action}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                {(!analytics?.recentActivity || analytics.recentActivity.length === 0) && (
                  <div className="text-center py-6 text-slate-500 text-sm">No recent activity</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
