import { useEffect, useState } from 'react';
import rideService from '@/services/rideService';
import { formatCurrency, formatDate, statusColor } from '@/utils/helpers';
import { DollarSign, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

export default function DriverEarnings() {
  const [rides, setRides]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rideService.getDriverRides()
      .then(r => setRides(r.data?.data?.rides || []))
      .catch(() => setRides([]))
      .finally(() => setLoading(false));
  }, []);

  const completed   = rides.filter(r => r.status === 'completed');
  const total       = completed.reduce((s, r) => s + (r.fare || 0), 0);

  // Group by day
  const byDay = completed.reduce((acc, r) => {
    const day = formatDate(r.createdAt);
    acc[day] = (acc[day] || 0) + (r.fare || 0);
    return acc;
  }, {});

  const today = formatDate(new Date());
  const todayEarnings = byDay[today] || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-surface-900">Earnings</h1>
        <p className="text-surface-500 mt-1">Your earnings overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Today's Earnings", value: formatCurrency(todayEarnings), icon: Calendar, color: 'text-primary-600 bg-primary-50' },
          { label: 'Total Earnings',    value: formatCurrency(total),         icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Trips Completed',   value: completed.length,              icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-xl font-heading font-bold text-surface-900">{value}</p>
            <p className="text-sm text-surface-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Daily breakdown */}
      {Object.keys(byDay).length > 0 && (
        <div className="card">
          <h2 className="font-heading font-semibold text-surface-900 mb-4">Daily Breakdown</h2>
          <div className="space-y-2">
            {Object.entries(byDay).reverse().slice(0, 10).map(([day, amount]) => (
              <div key={day} className="flex items-center justify-between py-2 border-b border-surface-50 last:border-0">
                <span className="text-sm text-surface-600">{day}</span>
                <span className="font-medium text-surface-900">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ride list */}
      <div className="card">
        <h2 className="font-heading font-semibold text-surface-900 mb-4">Trip History</h2>
        {loading ? (
          <div className="flex justify-center py-8"><span className="spinner w-6 h-6 border-[3px]" /></div>
        ) : rides.length === 0 ? (
          <div className="text-center py-10 text-surface-400">
            <TrendingUp size={36} className="mx-auto mb-2 opacity-30" />
            <p>No trips yet. Start accepting rides!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rides.map(ride => (
              <div key={ride._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">
                    {ride.dropoff?.address || 'Destination'}
                  </p>
                  <p className="text-xs text-surface-400">{formatDate(ride.createdAt)}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${statusColor(ride.status)}`}>{ride.status}</span>
                  {ride.fare && (
                    <p className="text-sm font-semibold text-green-700 mt-0.5">{formatCurrency(ride.fare)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
