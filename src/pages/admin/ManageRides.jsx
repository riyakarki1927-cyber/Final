import { useEffect, useState } from 'react';
import rideService from '@/services/rideService';
import { formatCurrency, formatDateTime, statusColor } from '@/utils/helpers';
import { Car, Search, Filter } from 'lucide-react';

export default function ManageRides() {
  const [rides, setRides]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    rideService.getAll()
      .then(r => setRides(r.data?.data?.rides || []))
      .catch(() => setRides([]))
      .finally(() => setLoad(false));
  }, []);

  const filtered = rides.filter(r => {
    const matchSearch = r.dropoff?.address?.toLowerCase().includes(search.toLowerCase())
      || r.pickup?.address?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'all' || r.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-surface-900">Manage Rides</h1>
        <p className="text-surface-500 mt-1">All rides on the platform</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input className="input pl-9" placeholder="Search by location…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <select className="input pl-9 sm:w-44" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="spinner w-6 h-6 border-[3px]" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-surface-400">
          <Car size={40} className="mx-auto mb-3 opacity-30" />
          <p>No rides found</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr>
                  <th className="text-left px-4 py-3 text-surface-500 font-medium">Route</th>
                  <th className="text-left px-4 py-3 text-surface-500 font-medium">Vehicle</th>
                  <th className="text-left px-4 py-3 text-surface-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-surface-500 font-medium">Fare</th>
                  <th className="text-left px-4 py-3 text-surface-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {filtered.map(ride => (
                  <tr key={ride._id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-surface-900 truncate max-w-[200px]">
                        → {ride.dropoff?.address || 'Unknown'}
                      </p>
                      <p className="text-xs text-surface-400 truncate max-w-[200px]">
                        From: {ride.pickup?.address || 'Unknown'}
                      </p>
                    </td>
                    <td className="px-4 py-3 capitalize text-surface-600">{ride.vehicleType || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusColor(ride.status)}`}>{ride.status?.replace('_',' ')}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-surface-900">
                      {ride.fare ? formatCurrency(ride.fare) : '—'}
                    </td>
                    <td className="px-4 py-3 text-surface-500 text-xs">{formatDateTime(ride.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
