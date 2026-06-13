import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(form);
      navigate('/' + user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Check email and password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 mb-4">
            <span className="text-white font-heading font-bold text-xl">N</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-surface-900">Welcome back</h1>
          <p className="text-surface-500 mt-1">Sign in to NepRide AI</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger-100 text-red-700 text-sm">{error}</div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" required value={form.email}
                onChange={handle} className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input name="password" type={showPw ? 'text' : 'password'} required
                  value={form.password} onChange={handle} className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <span className="spinner w-4 h-4" /> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>
          <p className="text-center text-sm text-surface-500 mt-4">
            No account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">Register</Link>
          </p>
        </div>

        <div className="card mt-4 text-xs text-surface-500 space-y-1">
          <p className="font-medium text-surface-700">Demo accounts (pw: password123)</p>
          <p>👤 passenger@test.com</p>
          <p>🚗 driver@test.com</p>
          <p>🛡️ admin@test.com</p>
        </div>
      </div>
    </div>
  );
}
