import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthLayout = () => {
  const { token } = useSelector((s) => s.auth);
  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-surface-900 bg-grid flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="glow-orb w-96 h-96 bg-brand-600/20 top-0 left-1/4" style={{ position: 'fixed' }} />
      <div className="glow-orb w-64 h-64 bg-indigo-600/15 bottom-0 right-1/4" style={{ position: 'fixed' }} />
      <div className="relative z-10 w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
