import api from './api';
import { USE_MOCK_API } from '@/utils/constants';
import { mockRideApi } from './mockApi';

const realRideService = {
  // Passenger
  book:        (data) => api.post('/rides',                data),
  getMyRides:  ()     => api.get('/rides/my'),
  cancelRide:  (id)   => api.patch(`/rides/${id}/cancel`),
  rateRide:    (id, d)=> api.post(`/rides/${id}/rate`,     d),

  // Driver
  getAvailable: ()    => api.get('/rides/available'),
  acceptRide:  (id)   => api.patch(`/rides/${id}/accept`),
  startRide:   (id)   => api.patch(`/rides/${id}/start`),
  completeRide:(id)   => api.patch(`/rides/${id}/complete`),
  getDriverRides: ()  => api.get('/rides/driver/my'),

  // Admin
  getAll:      (p)    => api.get('/rides',                 { params: p }),
  getById:     (id)   => api.get(`/rides/${id}`),
};

const rideService = USE_MOCK_API
  ? {
      book:           (data)   => mockRideApi.book(data),
      getMyRides:     ()       => mockRideApi.getMyRides(),
      cancelRide:     (id)     => mockRideApi.cancelRide(id),
      rateRide:       (id, d)  => mockRideApi.rateRide(id, d),
      getAvailable:   ()       => mockRideApi.getAvailable(),
      acceptRide:     (id)     => mockRideApi.acceptRide(id),
      startRide:      (id)     => mockRideApi.startRide(id),
      completeRide:   (id)     => mockRideApi.completeRide(id),
      getDriverRides: ()       => mockRideApi.getDriverRides(),
      getAll:         (p)      => mockRideApi.getAll(p),
      getById:        (id)     => mockRideApi.getById(id),
    }
  : realRideService;

export default rideService;
