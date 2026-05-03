import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { register as registerUser } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const onSubmit = async (data) => {
    const res = await dispatch(registerUser(data));
    if (res.type === 'auth/register/fulfilled') {
      toast.success('Account created! Welcome to Kaamio 🚀');
      navigate('/dashboard');
    } else {
      toast.error(res.payload || 'Registration failed');
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

      <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
      <p className="text-slate-400 text-sm mb-6">Join your team on Kaamio.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input
            type="text"
            className="input-field"
            placeholder="Yash Sharma"
            {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Email</label>
          <input
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
            type="password"
            className="input-field"
            placeholder="Min 6 characters"
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
          />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="label">Role</label>
          <select className="input-field" {...register('role')}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="label">Department <span className="text-slate-600">(optional)</span></label>
          <input
            type="text"
            className="input-field"
            placeholder="Engineering, Design..."
            {...register('department')}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {loading ? <Spinner /> : null}
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-slate-500 text-sm mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
      </p>
    </div>
  );
};

export default Signup;
