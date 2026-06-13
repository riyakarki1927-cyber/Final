import { useEffect, useState } from 'react';
import rideService from '@/services/rideService';
import userService from '@/services/userService';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { BarChart2, Users, Car, DollarSign, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function Analytics() {
  const [rides, setRides] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    Promise.all([
      rideService.getAll({ limit: 1000 }).catch(() => ({ data: null })),
      userService.getAll({ limit: 1000 }).catch(() => ({ data: null })),
    ]).then(([r, u]) => {
      setRides(r.data?.data?.rides || []);
      setUsers(u.data?.data?.users || []);
    }).finally(() => setLoad(false));
  }, []);

  const completed  = rides.filter(r => r.status === 'completed');
  const cancelled  = rides.filter(r => r.status === 'cancelled');
  const pending    = rides.filter(r => r.status === 'pending');
  const revenue    = completed.reduce((s, r) => s + (r.fare || 0), 0);
  const passengers = users.filter(u => u.role === 'passenger');
  const drivers    = users.filter(u => u.role === 'driver');

  // By vehicle type
  const byVehicle = rides.reduce((acc, r) => {
    if (r.vehicleType) acc[r.vehicleType] = (acc[r.vehicleType] || 0) + 1;
    return acc;
  }, {});

  // By day (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const label = formatDate(d);
    const count = rides.filter(r => formatDate(r.createdAt) === label).length;
    return { label, count };
  });
  const maxCount = Math.max(...last7.map(d => d.count), 1);

  if (loading) return (
    <div className="flex justify-center py-20"><span className="spinner w-8 h-8 border-[3px]" /></div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-surface-900">Analytics</h1>
        <p className="text-surface-500 mt-1">Platform performance overview</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',     value: formatCurrency(revenue),  icon: DollarSign,  color: 'text-green-600 bg-green-50' },
          { label: 'Total Rides',       value: rides.length,             icon: Car,         color: 'text-primary-600 bg-primary-50' },
          { label: 'Total Passengers',  value: passengers.length,        icon: Users,       color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Drivers',     value: drivers.length,           icon: TrendingUp,  color: 'text-yellow-600 bg-yellow-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={20} /></div>
            <p className="text-2xl font-heading font-bold text-surface-900">{value}</p>
            <p className="text-sm text-surface-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Ride status breakdown */}
        <div className="card">
          <h2 className="font-heading font-semibold text-surface-900 mb-4">Ride Status Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: 'Completed', count: completed.length,  icon: CheckCircle, color: 'text-green-500' },
              { label: 'Cancelled', count: cancelled.length,  icon: XCircle,     color: 'text-red-500'   },
              { label: 'Pending',   count: pending.length,    icon: Clock,       color: 'text-yellow-500' },
              { label: 'Other',     count: rides.length - completed.length - cancelled.length - pending.length, icon: BarChart2, color: 'text-blue-500' },
            ].map(({ label, count, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon size={16} className={color} />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-surface-700">{label}</span>
                    <span className="font-medium text-surface-900">{count}</span>
                  </div>
                  <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-400 rounded-full transition-all"
                      style={{ width: rides.length ? `${(count / rides.length) * 100}%` : '0%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle type breakdown */}
        <div className="card">
          <h2 className="font-heading font-semibold text-surface-900 mb-4">Rides by Vehicle Type</h2>
          {Object.keys(byVehicle).length === 0 ? (
            <p className="text-surface-400 text-sm text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byVehicle).map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-sm text-surface-700 capitalize w-16">{type}</span>
                  <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full"
                      style={{ width: `${(count / rides.length) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium text-surface-900 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 7-day chart */}
      <div className="card">
        <h2 className="font-heading font-semibold text-surface-900 mb-6">Rides — Last 7 Days</h2>
        <div className="flex items-end gap-2 h-32">
          {last7.map(({ label, count }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-surface-700">{count || ''}</span>
              <div className="w-full bg-primary-500 rounded-t transition-all"
                style={{ height: `${(count / maxCount) * 100}%`, minHeight: count > 0 ? '6px' : '0' }} />
              <span className="text-xs text-surface-400 whitespace-nowrap"
                style={{ fontSize: '10px' }}>
                {label.split(' ')[1]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
