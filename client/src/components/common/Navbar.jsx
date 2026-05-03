import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../../redux/slices/notificationSlice';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/team': 'Team',
  '/notifications': 'Notifications',
  '/profile': 'Profile',
};

const Navbar = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { unreadCount } = useSelector((s) => s.notifications);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, []);

  const title = pathname.startsWith('/projects/') ? 'Project Details' : (routeTitles[pathname] || 'Kaamio');

  return (
    <header className="sticky top-0 z-10 bg-surface-900/80 backdrop-blur-md border-b border-white/5 px-4 md:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-700 transition-colors text-slate-400"
        >
          ☰
        </button>
        <h1 className="text-base font-semibold text-white">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications bell */}
        <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-surface-700 transition-colors text-slate-400 hover:text-white">
          <span className="text-lg">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-brand-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar */}
        <Link to="/profile" className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-700 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-brand-600/30 border border-brand-500/30 flex items-center justify-center text-brand-400 font-semibold text-xs">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
