import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { ROLES } from '@/utils/constants';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: ROLES.PASSENGER, phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await register(form);
      navigate('/' + user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 mb-4">
            <span className="text-white font-heading font-bold text-xl">N</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-surface-900">Create account</h1>
          <p className="text-surface-500 mt-1">Join NepRide AI today</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger-100 text-red-700 text-sm">{error}</div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input name="name" required value={form.name} onChange={handle}
                className="input" placeholder="Hari Bahadur" />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" required value={form.email}
                onChange={handle} className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" value={form.phone} onChange={handle}
                className="input" placeholder="+977 98XXXXXXXX" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input name="password" type={showPw ? 'text' : 'password'} required minLength={8}
                  value={form.password} onChange={handle} className="input pr-10" placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: ROLES.PASSENGER, label: '🧑 Ride as Passenger' },
                  { val: ROLES.DRIVER,    label: '🚗 Drive & Earn' },
                ].map(({ val, label }) => (
                  <label key={val} className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 cursor-pointer text-sm font-medium transition-colors
                    ${form.role === val
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-surface-200 text-surface-600 hover:border-primary-300'}`}>
                    <input type="radio" name="role" value={val} checked={form.role === val}
                      onChange={handle} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <span className="spinner w-4 h-4" /> : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>
          <p className="text-center text-sm text-surface-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
