import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import rideService from '@/services/rideService';
import { formatCurrency, formatDateTime, statusColor } from '@/utils/helpers';
import { Navigation, DollarSign, CheckCircle, Clock } from 'lucide-react';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [rides, setRides]     = useState([]);
  const [available, setAvail] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      rideService.getDriverRides().catch(() => ({ data: null })),
      rideService.getAvailable().catch(() => ({ data: null })),
    ]).then(([dr, av]) => {
      setRides(dr.data?.data?.rides || []);
      setAvail(av.data?.data?.rides || []);
    }).finally(() => setLoading(false));
  }, []);

  const completed = rides.filter(r => r.status === 'completed');
  const totalEarned = completed.reduce((s, r) => s + (r.fare || 0), 0);
  const active = rides.find(r => ['accepted','in_progress'].includes(r.status));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-surface-900">
          Hey {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-surface-500 mt-1">Ready to start earning today?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Trips Done', value: completed.length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Total Earned', value: formatCurrency(totalEarned), icon: DollarSign, color: 'text-primary-600 bg-primary-50' },
          { label: 'Available Rides', value: available.length, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
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

      {/* Active ride */}
      {active && (
        <div className="card border-l-4 border-l-green-500 bg-green-50/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-surface-900">You have an active ride</p>
              <p className="text-sm text-surface-500 capitalize mt-0.5">Status: {active.status?.replace('_',' ')}</p>
            </div>
            <Link to="/driver/ride" className="btn-primary text-xs px-3 py-1.5">
              View Ride
            </Link>
          </div>
        </div>
      )}

      {/* Available rides */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-surface-900">Available Rides</h2>
          <Link to="/driver/ride" className="text-sm text-primary-600 hover:underline">Manage</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><span className="spinner w-6 h-6 border-[3px]" /></div>
        ) : available.length === 0 ? (
          <div className="text-center py-8 text-surface-400">
            <Navigation size={32} className="mx-auto mb-2 opacity-40" />
            <p>No rides available right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {available.slice(0, 5).map(ride => (
              <div key={ride._id} className="flex items-center gap-4 p-3 rounded-lg bg-surface-50 hover:bg-surface-100 transition-colors">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                  <Navigation size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">
                    → {ride.dropoff?.address || 'Unknown destination'}
                  </p>
                  <p className="text-xs text-surface-500">{ride.vehicleType} • {formatDateTime(ride.createdAt)}</p>
                </div>
                {ride.fare && (
                  <span className="text-sm font-semibold text-green-700">{formatCurrency(ride.fare)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent rides */}
      <div className="card">
        <h2 className="font-heading font-semibold text-surface-900 mb-4">Recent Trips</h2>
        {rides.slice(0, 5).length === 0 ? (
          <p className="text-center py-6 text-surface-400 text-sm">No trips yet</p>
        ) : (
          <div className="space-y-3">
            {rides.slice(0, 5).map(ride => (
              <div key={ride._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">
                    {ride.dropoff?.address || 'Destination'}
                  </p>
                  <p className="text-xs text-surface-500">{formatDateTime(ride.createdAt)}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${statusColor(ride.status)}`}>{ride.status}</span>
                  {ride.fare && <p className="text-xs font-medium text-surface-700 mt-1">{formatCurrency(ride.fare)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
