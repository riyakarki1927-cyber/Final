export const API_URL    = import.meta.env.VITE_API_URL    || 'http://localhost:5000/api/v1';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// While the real backend isn't ready yet, the app runs against an in-memory
// mock API (see services/mockApi.js) so all pages/dashboards are usable.
// Set VITE_USE_MOCK_API=false in a .env file once your backend is live.
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const ROLES = {
  PASSENGER: 'passenger',
  DRIVER:    'driver',
  ADMIN:     'admin',
};

export const STORAGE_KEYS = {
  TOKEN:         'nepride_token',
  REFRESH_TOKEN: 'nepride_refresh',
  USER:          'nepride_user',
};

export const RIDE_STATUS = {
  PENDING:    'pending',
  ACCEPTED:   'accepted',
  IN_PROGRESS:'in_progress',
  COMPLETED:  'completed',
  CANCELLED:  'cancelled',
};

export const VEHICLE_TYPES = [
  { value: 'bike',    label: 'Bike',    icon: '🏍️', basePrice: 30 },
  { value: 'car',     label: 'Car',     icon: '🚗', basePrice: 80 },
  { value: 'ev',      label: 'EV Car',  icon: '⚡', basePrice: 70 },
  { value: 'suv',     label: 'SUV',     icon: '🚙', basePrice: 120 },
];
