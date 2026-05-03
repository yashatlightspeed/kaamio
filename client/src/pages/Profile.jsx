import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { updateProfile } from '../redux/slices/authSlice';
import { fetchMyTasks } from '../redux/slices/taskSlice';
import { useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';
import { format } from 'date-fns';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { myTasks, myStats } = useSelector((s) => s.tasks);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '' });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name, department: user?.department },
  });

  useEffect(() => { dispatch(fetchMyTasks()); }, []);

  const onSaveProfile = async (data) => {
    setSaving(true);
    const res = await dispatch(updateProfile(data));
    setSaving(false);
    if (res.type === 'auth/updateProfile/fulfilled') toast.success('Profile updated!');
    else toast.error('Failed to update profile');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwData.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    setChangingPw(true);
    try {
      await api.put('/auth/change-password', pwData);
      toast.success('Password changed successfully');
      setPwData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
    setChangingPw(false);
  };

  const productivityScore = myStats?.total > 0 ? Math.round((myStats.completed / myStats.total) * 100) : 0;

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Profile</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your account settings</p>
      </div>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600/40 to-brand-800/40 border border-brand-500/30 flex items-center justify-center text-3xl font-bold text-brand-300">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-xl font-bold text-white">{user?.name}</div>
            <div className="text-slate-400 text-sm">{user?.email}</div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`badge capitalize ${user?.role === 'admin' ? 'priority-critical' : 'status-in-progress'}`}>
                {user?.role}
              </span>
              {user?.department && (
                <span className="text-xs text-slate-500">{user.department}</span>
              )}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
          <h3 className="font-semibold text-white text-sm">Update Profile</h3>
          <div>
            <label className="label">Full Name</label>
            <input className="input-field" {...register('name', { required: true })} />
          </div>
          <div>
            <label className="label">Department</label>
            <input className="input-field" placeholder="Engineering, Design..." {...register('department')} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving && <Spinner />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-4">My Statistics</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Total Tasks', value: myStats?.total ?? 0, color: 'text-white' },
            { label: 'Completed', value: myStats?.completed ?? 0, color: 'text-emerald-400' },
            { label: 'Overdue', value: myStats?.overdue ?? 0, color: 'text-red-400' },
          ].map((s) => (
            <div key={s.label} className="bg-surface-700 rounded-xl p-3 border border-white/5 text-center">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-slate-400">Productivity Score</span>
          <span className="font-bold gradient-text">{productivityScore}%</span>
        </div>
        <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all" style={{ width: `${productivityScore}%` }} />
        </div>
      </div>

      {/* Change Password */}
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-4">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              className="input-field"
              value={pwData.currentPassword}
              onChange={(e) => setPwData((p) => ({ ...p, currentPassword: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              className="input-field"
              value={pwData.newPassword}
              onChange={(e) => setPwData((p) => ({ ...p, newPassword: e.target.value }))}
              required
              placeholder="Min 6 characters"
            />
          </div>
          <button type="submit" disabled={changingPw} className="btn-secondary flex items-center gap-2">
            {changingPw && <Spinner />}
            Change Password
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-3">Account Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Member since</span>
            <span className="text-slate-300">{user?.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span className="text-slate-300">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Role</span>
            <span className="text-slate-300 capitalize">{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
