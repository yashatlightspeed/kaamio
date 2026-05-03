import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './redux/slices/authSlice';
import useSocket from './hooks/useSocket';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Team from './pages/Team';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Spinner from './components/common/Spinner';

// Protected Route wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { token, initialized, user } = useSelector((s) => s.auth);

  // Sync socket
  useSocket(user);

  useEffect(() => {
    if (token) dispatch(getMe());
  }, [token]);

  if (token && !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <Spinner size="md" />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={
            user?.role === 'admin' ? <AdminDashboard /> : <MemberDashboard />
          } />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/team" element={
            <ProtectedRoute adminOnly><Team /></ProtectedRoute>
          } />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
