import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen bg-surface-900 bg-grid flex items-center justify-center text-center px-4">
    <div>
      <div className="text-8xl font-black gradient-text mb-4">404</div>
      <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-slate-400 mb-8">The page you're looking for doesn't exist or was moved.</p>
      <Link to="/" className="btn-primary px-6 py-2.5">Back to Home</Link>
    </div>
  </div>
);

export default NotFound;
