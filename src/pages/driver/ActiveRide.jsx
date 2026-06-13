import { useEffect, useState } from 'react';
import rideService from '@/services/rideService';
import { formatCurrency, formatDateTime } from '@/utils/helpers';
import { Navigation, MapPin, CheckCircle, XCircle, Play } from 'lucide-react';

export default function ActiveRide() {
  const [available, setAvail]   = useState([]);
  const [activeRide, setActive] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [actionLoading, setAL]  = useState('');
  const [msg, setMsg]           = useState({ type: '', text: '' });

  const load = () => {
    setLoading(true);
    Promise.all([
      rideService.getAvailable().catch(() => ({ data: null })),
      rideService.getDriverRides().catch(() => ({ data: null })),
    ]).then(([av, dr]) => {
      setAvail(av.data?.data?.rides || []);
      const active = (dr.data?.data?.rides || []).find(r => ['accepted','in_progress'].includes(r.status));
      setActive(active || null);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const action = async (fn, id, label) => {
    setAL(id + label); setMsg({});
    try {
      await fn(id);
      setMsg({ type: 'success', text: `Ride ${label} successfully` });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || `Failed to ${label} ride` });
    } finally { setAL(''); }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><span className="spinner w-8 h-8 border-[3px]" /></div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-surface-900">Active Ride</h1>
        <p className="text-surface-500 mt-1">Accept and manage your rides</p>
      </div>

      {msg.text && (
        <div className={`p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-success-100 text-green-700' : 'bg-danger-100 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Current active ride */}
      {activeRide && (
        <div className="card border-2 border-green-400">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-semibold text-green-700 text-sm capitalize">
              {activeRide.status?.replace('_',' ')} Ride
            </span>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 text-green-500 flex-shrink-0" />
              <p className="text-sm"><span className="text-surface-500">From: </span>{activeRide.pickup?.address}</p>
            </div>
            <div className="flex items-start gap-2">
              <Navigation size={14} className="mt-0.5 text-red-500 flex-shrink-0" />
              <p className="text-sm"><span className="text-surface-500">To: </span>{activeRide.dropoff?.address}</p>
            </div>
          </div>
          {activeRide.fare && (
            <p className="text-lg font-heading font-bold text-surface-900 mb-4">
              {formatCurrency(activeRide.fare)}
            </p>
          )}
          <div className="flex gap-3">
            {activeRide.status === 'accepted' && (
              <button onClick={() => action(rideService.startRide, activeRide._id, 'started')}
                disabled={!!actionLoading}
                className="btn-primary flex-1 justify-center gap-2">
                {actionLoading ? <span className="spinner w-4 h-4" /> : <><Play size={14} /> Start Ride</>}
              </button>
            )}
            {activeRide.status === 'in_progress' && (
              <button onClick={() => action(rideService.completeRide, activeRide._id, 'completed')}
                disabled={!!actionLoading}
                className="btn bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 flex-1 justify-center gap-2">
                {actionLoading ? <span className="spinner w-4 h-4" /> : <><CheckCircle size={14} /> Complete Ride</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Available rides list */}
      <div className="card">
        <h2 className="font-heading font-semibold text-surface-900 mb-4">
          Available Rides ({available.length})
        </h2>
        {available.length === 0 ? (
          <div className="text-center py-10 text-surface-400">
            <Navigation size={36} className="mx-auto mb-2 opacity-30" />
            <p>No pending rides available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {available.map(ride => (
              <div key={ride._id} className="p-4 rounded-lg border border-surface-200 hover:border-primary-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <p className="text-sm text-surface-700 truncate max-w-[200px]">{ride.pickup?.address}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <p className="text-sm font-medium text-surface-900 truncate max-w-[200px]">{ride.dropoff?.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {ride.fare && <p className="font-semibold text-surface-900">{formatCurrency(ride.fare)}</p>}
                    <p className="text-xs text-surface-400 capitalize">{ride.vehicleType}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-surface-400">{formatDateTime(ride.createdAt)}</p>
                  {!activeRide && (
                    <button onClick={() => action(rideService.acceptRide, ride._id, 'accepted')}
                      disabled={!!actionLoading}
                      className="btn-primary text-xs px-3 py-1.5">
                      {actionLoading === ride._id + 'accepted' ? <span className="spinner w-3 h-3" /> : 'Accept'}
                    </button>
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
