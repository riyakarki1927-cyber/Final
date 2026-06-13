import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import rideService from '@/services/rideService';
import { VEHICLE_TYPES } from '@/utils/constants';
import { formatCurrency } from '@/utils/helpers';
import { MapPin, Navigation, CheckCircle } from 'lucide-react';

export default function BookRide() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: location, 2: vehicle, 3: confirm, 4: booked
  const [form, setForm] = useState({
    pickup:  { address: '' },
    dropoff: { address: '' },
    vehicleType: 'car',
    paymentMethod: 'cash',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookedRide, setBookedRide] = useState(null);

  const selectedVehicle = VEHICLE_TYPES.find(v => v.value === form.vehicleType);
  const estimatedFare   = selectedVehicle ? selectedVehicle.basePrice * 3 : 0; // mock estimate

  const handle = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const payload = {
        pickup:        { address: form.pickup.address,  coordinates: [85.3240, 27.7172] },
        dropoff:       { address: form.dropoff.address, coordinates: [85.3500, 27.7400] },
        vehicleType:   form.vehicleType,
        paymentMethod: form.paymentMethod,
      };
      const res = await rideService.book(payload);
      setBookedRide(res.data?.data?.ride);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book ride. Make sure the backend is running.');
    } finally { setLoading(false); }
  };

  if (step === 4) return (
    <div className="max-w-md mx-auto text-center py-12">
      <CheckCircle size={56} className="mx-auto text-green-500 mb-4" />
      <h2 className="text-2xl font-heading font-bold text-surface-900 mb-2">Ride Booked!</h2>
      <p className="text-surface-500 mb-6">Looking for a driver near you…</p>
      <div className="card text-left mb-6 space-y-2 text-sm">
        <p><span className="text-surface-500">From:</span> {form.pickup.address}</p>
        <p><span className="text-surface-500">To:</span>   {form.dropoff.address}</p>
        <p><span className="text-surface-500">Vehicle:</span> {selectedVehicle?.label}</p>
        <p><span className="text-surface-500">Estimated fare:</span> {formatCurrency(estimatedFare)}</p>
      </div>
      <button onClick={() => navigate('/passenger')} className="btn-primary">Back to Dashboard</button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-surface-900">Book a Ride</h1>
        <p className="text-surface-500 mt-1">Step {step} of 3</p>
        <div className="flex gap-1 mt-3">
          {[1,2,3].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary-600' : 'bg-surface-200'}`} />
          ))}
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-danger-100 text-red-700 text-sm">{error}</div>}

      {/* Step 1: Locations */}
      {step === 1 && (
        <div className="card space-y-4">
          <h2 className="font-heading font-semibold text-surface-900">Where are you going?</h2>
          <div>
            <label className="label">Pickup Location</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
              <input className="input pl-9" placeholder="Enter pickup address"
                value={form.pickup.address}
                onChange={e => handle('pickup', { address: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Drop-off Location</label>
            <div className="relative">
              <Navigation size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
              <input className="input pl-9" placeholder="Enter destination"
                value={form.dropoff.address}
                onChange={e => handle('dropoff', { address: e.target.value })} />
            </div>
          </div>
          {/* Map placeholder */}
          <div className="rounded-lg bg-surface-100 h-40 flex items-center justify-center text-surface-400 text-sm">
            🗺️ Map integration (Google Maps / OpenStreetMap)
          </div>
          <button disabled={!form.pickup.address || !form.dropoff.address}
            onClick={() => setStep(2)} className="btn-primary w-full justify-center">
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Vehicle */}
      {step === 2 && (
        <div className="card space-y-4">
          <h2 className="font-heading font-semibold text-surface-900">Choose vehicle type</h2>
          <div className="space-y-2">
            {VEHICLE_TYPES.map(v => (
              <label key={v.value} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors
                ${form.vehicleType === v.value ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-primary-300'}`}>
                <input type="radio" name="vehicleType" value={v.value}
                  checked={form.vehicleType === v.value}
                  onChange={e => handle('vehicleType', e.target.value)} className="sr-only" />
                <span className="text-2xl">{v.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-surface-900">{v.label}</p>
                  <p className="text-xs text-surface-500">Estimated {formatCurrency(v.basePrice * 3)}</p>
                </div>
                {form.vehicleType === v.value && (
                  <CheckCircle size={18} className="text-primary-600" />
                )}
              </label>
            ))}
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select className="input" value={form.paymentMethod}
              onChange={e => handle('paymentMethod', e.target.value)}>
              <option value="cash">💵 Cash</option>
              <option value="esewa">📱 eSewa</option>
              <option value="khalti">📱 Khalti</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-outline flex-1 justify-center">Back</button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1 justify-center">Continue</button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="card space-y-4">
          <h2 className="font-heading font-semibold text-surface-900">Confirm your ride</h2>
          <div className="bg-surface-50 rounded-lg p-4 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="mt-0.5 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-surface-500">Pickup</p>
                <p className="font-medium">{form.pickup.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Navigation size={16} className="mt-0.5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-surface-500">Drop-off</p>
                <p className="font-medium">{form.dropoff.address}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-t border-surface-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedVehicle?.icon}</span>
              <span className="font-medium">{selectedVehicle?.label}</span>
            </div>
            <span className="text-lg font-heading font-bold text-surface-900">
              ~{formatCurrency(estimatedFare)}
            </span>
          </div>
          <p className="text-xs text-surface-400">Payment: {form.paymentMethod}</p>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-outline flex-1 justify-center">Back</button>
            <button onClick={submit} disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <span className="spinner w-4 h-4" /> : 'Confirm Ride'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
