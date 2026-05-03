import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getUsers, getProductivityStats } from '../services/userService';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeTab, setActiveTab] = useState('Members');

  const load = async () => {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([getUsers(), getProductivityStats()]);
      setUsers(u);
      setStats(s);
    } catch (e) {
      toast.error('Failed to load team data');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (userId, role) => {
    await api.put(`/users/${userId}/role`, { role });
    toast.success('Role updated');
    load();
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user?')) return;
    await api.put(`/users/${userId}/deactivate`);
    toast.success('User deactivated');
    load();
  };

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Team</h1>
          <p className="text-slate-400 text-sm mt-0.5">{users.length} members</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        {['Members', 'Productivity'].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === t ? 'text-brand-400 border-brand-500' : 'text-slate-500 border-transparent hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : activeTab === 'Members' ? (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input className="input-field max-w-xs text-sm" placeholder="🔍 Search members..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="input-field max-w-[140px] text-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          </div>

          {/* Members grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((u, i) => {
              const userStat = stats.find((s) => s.name === u.name);
              return (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`card p-5 ${!u.isActive ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-brand-600/20 border border-brand-500/20 flex items-center justify-center text-lg font-bold text-brand-300 flex-shrink-0">
                      {u.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">{u.name}</div>
                      <div className="text-xs text-slate-500 truncate">{u.email}</div>
                      {u.department && <div className="text-xs text-slate-600 truncate">{u.department}</div>}
                    </div>
                  </div>

                  {/* Stats row */}
                  {userStat && (
                    <div className="flex justify-between text-xs text-slate-500 mb-3">
                      <span><span className="text-white font-semibold">{userStat.total}</span> tasks</span>
                      <span><span className="text-emerald-400 font-semibold">{userStat.completed}</span> done</span>
                      <span><span className="text-brand-400 font-semibold">{Math.round(userStat.rate || 0)}%</span> rate</span>
                    </div>
                  )}
                  {userStat?.total > 0 && (
                    <div className="h-1 bg-surface-600 rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.round(userStat?.rate || 0)}%` }} />
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <select
                      className="flex-1 bg-surface-700 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleDeactivate(u._id)}
                      className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/10"
                    >
                      {u.isActive ? 'Deactivate' : 'Inactive'}
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-600 mt-2">
                    Joined {format(new Date(u.createdAt), 'MMM d, yyyy')}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        /* Productivity Tab */
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="font-semibold text-white">Member Productivity Report</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-700">
              <tr>
                {['Member', 'Total Tasks', 'Completed', 'Overdue', 'Rate'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((s, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-surface-700/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-brand-600/20 flex items-center justify-center text-xs font-bold text-brand-300">
                        {s.name?.charAt(0)}
                      </div>
                      <span className="font-medium text-white">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{s.total}</td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold">{s.completed}</td>
                  <td className="px-4 py-3 text-red-400">{s.overdue}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-surface-600 rounded-full overflow-hidden w-16">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.round(s.rate || 0)}%` }} />
                      </div>
                      <span className="text-brand-400 font-semibold">{Math.round(s.rate || 0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-slate-500">No productivity data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Team;
