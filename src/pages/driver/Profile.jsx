import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import userService from '@/services/userService';
import { getInitials } from '@/utils/helpers';
import { User, Mail, Phone, Lock, Save, Car } from 'lucide-react';

export default function DriverProfile() {
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', vehicleNumber: user?.vehicleNumber || '', vehicleType: user?.vehicleType || 'car' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePw = (e) => setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault(); setMsg({}); setLoading(true);
    try {
      await userService.updateProfile(form);
      setMsg({ type: 'success', text: 'Profile updated!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally { setLoading(false); }
  };

  const changePw = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { setMsg({ type: 'error', text: 'Passwords do not match' }); return; }
    setMsg({}); setLoading(true);
    try {
      await userService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setMsg({ type: 'success', text: 'Password changed!' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed' });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-surface-900">Profile</h1>
        <p className="text-surface-500 mt-1">Manage your driver account</p>
      </div>

      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl font-heading font-bold">
          {getInitials(user?.name)}
        </div>
        <div>
          <p className="font-semibold text-surface-900">{user?.name}</p>
          <p className="text-sm text-surface-500">{user?.email}</p>
          <span className="badge bg-green-100 text-green-700 mt-1">Driver</span>
        </div>
      </div>

      <div className="flex border-b border-surface-200">
        {[['profile', 'Profile'], ['password', 'Password']].map(([k, label]) => (
          <button key={k} onClick={() => { setTab(k); setMsg({}); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
              ${tab === k ? 'border-primary-600 text-primary-700' : 'border-transparent text-surface-500 hover:text-surface-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {msg.text && (
        <div className={`p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-success-100 text-green-700' : 'bg-danger-100 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {tab === 'profile' && (
        <div className="card">
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input name="name" value={form.name} onChange={handle} className="input pl-9" />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input value={user?.email} readOnly className="input pl-9 bg-surface-50 text-surface-400 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input name="phone" value={form.phone} onChange={handle} className="input pl-9" placeholder="+977 98XXXXXXXX" />
              </div>
            </div>
            <div>
              <label className="label">Vehicle Number</label>
              <div className="relative">
                <Car size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input name="vehicleNumber" value={form.vehicleNumber} onChange={handle} className="input pl-9" placeholder="BA 1 KHA 1234" />
              </div>
            </div>
            <div>
              <label className="label">Vehicle Type</label>
              <select name="vehicleType" value={form.vehicleType} onChange={handle} className="input">
                <option value="bike">Bike</option>
                <option value="car">Car</option>
                <option value="ev">EV Car</option>
                <option value="suv">SUV</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary gap-2">
              {loading ? <span className="spinner w-4 h-4" /> : <><Save size={16} /> Save Changes</>}
            </button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="card">
          <form onSubmit={changePw} className="space-y-4">
            {['currentPassword', 'newPassword', 'confirmPassword'].map((field, i) => (
              <div key={field}>
                <label className="label">{['Current Password', 'New Password', 'Confirm Password'][i]}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input name={field} type="password" required value={pwForm[field]} onChange={handlePw} className="input pl-9" placeholder="••••••••" />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary gap-2">
              {loading ? <span className="spinner w-4 h-4" /> : <><Lock size={16} /> Change Password</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
