import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { login, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const res = await dispatch(login(data));
    if (res.type === 'auth/login/fulfilled') {
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } else {
      toast.error(res.payload || 'Login failed');
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      document.getElementById('email').value = 'admin@kaamio.dev';
      document.getElementById('password').value = 'kaamio123';
    } else {
      document.getElementById('email').value = 'member@kaamio.dev';
      document.getElementById('password').value = 'kaamio123';
    }
  };

  return (
    <div className="card p-8 animate-slide-up">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-glow-sm">
          <span className="text-white font-bold">K</span>
        </div>
        <span className="font-bold text-white text-xl">Kaamio</span>
      </div>

      <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
      <p className="text-slate-400 text-sm mb-6">Sign in to continue to your workspace.</p>

      {/* Demo credentials */}
      <div className="mb-5 p-3 rounded-xl bg-brand-600/10 border border-brand-500/20">
        <p className="text-xs text-brand-300 font-medium mb-2">Demo accounts:</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => fillDemo('admin')}
            className="text-xs bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 px-3 py-1.5 rounded-lg border border-brand-500/20 transition-colors">
            Fill Admin
          </button>
          <button type="button" onClick={() => fillDemo('member')}
            className="text-xs bg-surface-700 hover:bg-surface-600 text-slate-400 px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
            Fill Member
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            id="email"
            type="email"
            className="input-field"
            placeholder="you@company.com"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label">Password</label>
          <input
            id="password"
            type="password"
            className="input-field"
            placeholder="••••••••"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {loading ? <Spinner /> : null}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-slate-500 text-sm mt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium">Create one</Link>
      </p>
    </div>
  );
};

export default Login;
