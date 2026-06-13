import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import rideService from '@/services/rideService';
import userService from '@/services/userService';
import { formatCurrency } from '@/utils/helpers';
import { Users, Car, DollarSign, TrendingUp, LayoutDashboard } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, rides: 0, revenue: 0, drivers: 0 });
  const [recentRides, setRecent] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      userService.getAll({ limit: 1 }).catch(() => ({ data: null })),
      rideService.getAll({ limit: 5 }).catch(() => ({ data: null })),
    ]).then(([u, r]) => {
      const rides = r.data?.data?.rides || [];
      const revenue = rides.filter(x => x.status === 'completed').reduce((s, x) => s + (x.fare || 0), 0);
      setStats({
        users:   u.data?.data?.total || 0,
        rides:   r.data?.data?.total || rides.length,
        revenue,
        drivers: u.data?.data?.drivers || 0,
      });
      setRecent(rides);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-surface-900">Admin Dashboard</h1>
        <p className="text-surface-500 mt-1">Platform overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',    value: stats.users,               icon: Users,      color: 'text-blue-600 bg-blue-50',    to: '/admin/users' },
          { label: 'Total Rides',    value: stats.rides,               icon: Car,        color: 'text-primary-600 bg-primary-50', to: '/admin/rides' },
          { label: 'Revenue',        value: formatCurrency(stats.revenue), icon: DollarSign, color: 'text-green-600 bg-green-50', to: null },
          { label: 'Active Drivers', value: stats.drivers,             icon: TrendingUp, color: 'text-yellow-600 bg-yellow-50', to: null },
        ].map(({ label, value, icon: Icon, color, to }) => (
          <div key={label} className={`card ${to ? 'hover:shadow-card-hover cursor-pointer transition-shadow' : ''}`}>
            {to ? (
              <Link to={to} className="block">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={20} /></div>
                <p className="text-2xl font-heading font-bold text-surface-900">{value}</p>
                <p className="text-sm text-surface-500 mt-0.5">{label}</p>
              </Link>
            ) : (
              <>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={20} /></div>
                <p className="text-2xl font-heading font-bold text-surface-900">{value}</p>
                <p className="text-sm text-surface-500 mt-0.5">{label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-surface-900">Recent Rides</h2>
            <Link to="/admin/rides" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-6"><span className="spinner w-5 h-5 border-[3px]" /></div>
          ) : recentRides.length === 0 ? (
            <p className="text-center text-surface-400 py-6 text-sm">No rides yet</p>
          ) : (
            <div className="space-y-2">
              {recentRides.map(r => (
                <div key={r._id} className="flex items-center justify-between py-2 border-b border-surface-50 last:border-0 text-sm">
                  <span className="text-surface-700 truncate flex-1">{r.dropoff?.address || 'Unknown'}</span>
                  <span className={`badge ml-2 ${r.status === 'completed' ? 'bg-success-100 text-green-700' : 'bg-warning-100 text-yellow-700'}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-heading font-semibold text-surface-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: '/admin/users',     label: 'Manage Users',     icon: Users },
              { to: '/admin/rides',     label: 'Manage Rides',     icon: Car },
              { to: '/admin/analytics', label: 'View Analytics',   icon: TrendingUp },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-50 transition-colors text-sm font-medium text-surface-700 hover:text-primary-700">
                <Icon size={16} className="text-primary-500" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
