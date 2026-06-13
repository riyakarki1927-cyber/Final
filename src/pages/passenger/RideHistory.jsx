import { useEffect, useState } from 'react';
import rideService from '@/services/rideService';
import { formatCurrency, formatDateTime, statusColor } from '@/utils/helpers';
import { MapPin, Search, Filter } from 'lucide-react';

export default function RideHistory() {
  const [rides, setRides]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    rideService.getMyRides()
      .then(r => setRides(r.data?.data?.rides || []))
      .catch(() => setRides([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rides.filter(r => {
    const matchSearch = r.dropoff?.address?.toLowerCase().includes(search.toLowerCase())
      || r.pickup?.address?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || r.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-surface-900">Ride History</h1>
        <p className="text-surface-500 mt-1">All your past and active rides</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input className="input pl-9" placeholder="Search by location…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <select className="input pl-9 pr-8" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All</option>
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
          <MapPin size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No rides found</p>
          <p className="text-sm mt-1">Try changing your search or filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ride => (
            <div key={ride._id} className="card hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    <p className="text-sm text-surface-500 truncate">{ride.pickup?.address || 'Pickup'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    <p className="text-sm font-medium text-surface-900 truncate">{ride.dropoff?.address || 'Destination'}</p>
                  </div>
                  <p className="text-xs text-surface-400 pt-1">{formatDateTime(ride.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <span className={`badge ${statusColor(ride.status)}`}>{ride.status?.replace('_',' ')}</span>
                  {ride.fare && (
                    <p className="text-sm font-semibold text-surface-900">{formatCurrency(ride.fare)}</p>
                  )}
                  {ride.vehicleType && (
                    <p className="text-xs text-surface-400 capitalize">{ride.vehicleType}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
