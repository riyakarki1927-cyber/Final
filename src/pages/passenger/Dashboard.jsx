import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import rideService from '@/services/rideService';
import { formatCurrency, formatDateTime, statusColor } from '@/utils/helpers';
import { MapPin, Clock, TrendingUp, Plus } from 'lucide-react';

export default function PassengerDashboard() {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rideService.getMyRides()
      .then(r => setRides(r.data?.data?.rides || []))
      .catch(() => setRides([]))
      .finally(() => setLoading(false));
  }, []);

  const completed = rides.filter(r => r.status === 'completed').length;
  const totalSpent = rides.filter(r => r.status === 'completed').reduce((s, r) => s + (r.fare || 0), 0);
  const pending    = rides.filter(r => ['pending','accepted','in_progress'].includes(r.status));
  const recent     = rides.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-surface-900">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-surface-500 mt-1">Where are you going today?</p>
      </div>

      {/* Book ride CTA */}
      <Link to="/passenger/book"
        className="block card bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0 hover:shadow-card-hover transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-primary-100 text-sm">Ready to ride?</p>
            <p className="text-xl font-heading font-bold mt-0.5">Book a ride now</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus size={24} />
          </div>
        </div>
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Rides', value: completed, icon: MapPin, color: 'text-primary-600 bg-primary-50' },
          { label: 'Total Spent',  value: formatCurrency(totalSpent), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Active Rides', value: pending.length, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-heading font-bold text-surface-900">{value}</p>
            <p className="text-sm text-surface-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Active ride alert */}
      {pending.length > 0 && (
        <div className="card border-l-4 border-l-primary-500 bg-primary-50/50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
            <div>
              <p className="font-medium text-surface-900">Active ride in progress</p>
              <p className="text-sm text-surface-500 capitalize">Status: {pending[0].status?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent rides */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-surface-900">Recent Rides</h2>
          <Link to="/passenger/history" className="text-sm text-primary-600 hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><span className="spinner w-6 h-6 border-[3px]" /></div>
        ) : recent.length === 0 ? (
          <div className="text-center py-8 text-surface-400">
            <MapPin size={32} className="mx-auto mb-2 opacity-40" />
            <p>No rides yet. Book your first ride!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(ride => (
              <div key={ride._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">
                    {ride.dropoff?.address || 'Destination'}
                  </p>
                  <p className="text-xs text-surface-500">{formatDateTime(ride.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`badge ${statusColor(ride.status)}`}>{ride.status}</span>
                  {ride.fare && <p className="text-sm font-medium text-surface-900 mt-1">{formatCurrency(ride.fare)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
