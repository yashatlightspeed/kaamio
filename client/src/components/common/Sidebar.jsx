import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const navItems = [
  { icon: '⊞', label: 'Dashboard', to: '/dashboard' },
  { icon: '📁', label: 'Projects', to: '/projects' },
  { icon: '🔔', label: 'Notifications', to: '/notifications' },
];

const adminItems = [
  { icon: '👥', label: 'Team', to: '/team' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className={`
      fixed top-0 left-0 h-full w-60 bg-surface-800 border-r border-white/5 z-30
      flex flex-col transition-transform duration-300
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-glow-sm">
          <span className="text-white font-bold text-sm">K</span>
        </div>
        <div>
          <span className="font-bold text-white text-lg tracking-tight">Kaamio</span>
          <div className="text-xs text-slate-500 -mt-0.5">Work Smart. Build Faster.</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">Main</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mt-4">Admin</div>
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/5">
        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) => `sidebar-link mb-1 ${isActive ? 'active' : ''}`}
        >
          <span className="text-base w-5 text-center">👤</span>
          <span>Profile</span>
        </NavLink>
        <button onClick={handleLogout} className="sidebar-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <span className="text-base w-5 text-center">↗</span>
          <span>Logout</span>
        </button>
      </div>

      {/* User info pill */}
      <div className="mx-3 mb-3 p-2.5 rounded-lg bg-surface-700 border border-white/5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-brand-600/30 border border-brand-500/30 flex items-center justify-center text-brand-400 font-semibold text-sm flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
          <div className="text-xs text-slate-500 truncate capitalize">{user?.role}</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
