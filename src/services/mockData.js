// ── Mock data store (used only when no backend is available) ──────────────
// This simulates a small in-memory database so the whole frontend
// (auth, dashboards, ride flows) can be developed and demoed without
// a real backend. Everything resets on page reload.

import { ROLES, RIDE_STATUS } from '@/utils/constants';

const now = Date.now();
const minsAgo = (m) => new Date(now - m * 60 * 1000).toISOString();

export const mockUsers = [
  {
    _id: 'u_admin_1',
    name: 'Admin User',
    email: 'admin@nepride.ai',
    phone: '9800000000',
    role: ROLES.ADMIN,
    status: 'active',
    createdAt: minsAgo(60 * 24 * 30),
  },
  {
    _id: 'u_passenger_1',
    name: 'Riya Karki',
    email: 'riyakarki@gmail.com',
    phone: '9806068870',
    role: ROLES.PASSENGER,
    status: 'active',
    createdAt: minsAgo(60 * 24 * 10),
  },
  {
    _id: 'u_passenger_2',
    name: 'Sita Sharma',
    email: 'sita@example.com',
    phone: '9811111111',
    role: ROLES.PASSENGER,
    status: 'active',
    createdAt: minsAgo(60 * 24 * 5),
  },
  {
    _id: 'u_driver_1',
    name: 'Hari Bahadur',
    email: 'hari@example.com',
    phone: '9822222222',
    role: ROLES.DRIVER,
    status: 'active',
    vehicleType: 'car',
    vehicleNumber: 'BA 2 PA 1234',
    rating: 4.8,
    createdAt: minsAgo(60 * 24 * 20),
  },
  {
    _id: 'u_driver_2',
    name: 'Suresh Thapa',
    email: 'suresh@example.com',
    phone: '9833333333',
    role: ROLES.DRIVER,
    status: 'blocked',
    vehicleType: 'bike',
    vehicleNumber: 'BA 5 PA 5678',
    rating: 4.2,
    createdAt: minsAgo(60 * 24 * 15),
  },
];

export const mockRides = [
  {
    _id: 'r1',
    passenger: 'u_passenger_1',
    driver: 'u_driver_1',
    pickup:  { address: 'Dharan Bus Park, Dharan' },
    dropoff: { address: 'Bhanu Chowk, Dharan' },
    vehicleType: 'car',
    fare: 180,
    status: RIDE_STATUS.COMPLETED,
    createdAt: minsAgo(60 * 5),
    rating: 5,
  },
  {
    _id: 'r2',
    passenger: 'u_passenger_1',
    driver: 'u_driver_1',
    pickup:  { address: 'Putalisadak, Kathmandu' },
    dropoff: { address: 'Thamel, Kathmandu' },
    vehicleType: 'bike',
    fare: 90,
    status: RIDE_STATUS.COMPLETED,
    createdAt: minsAgo(60 * 24),
    rating: 4,
  },
  {
    _id: 'r3',
    passenger: 'u_passenger_2',
    driver: null,
    pickup:  { address: 'New Road, Dharan' },
    dropoff: { address: 'Itahari Chowk' },
    vehicleType: 'ev',
    fare: 220,
    status: RIDE_STATUS.PENDING,
    createdAt: minsAgo(3),
  },
  {
    _id: 'r4',
    passenger: 'u_passenger_2',
    driver: 'u_driver_1',
    pickup:  { address: 'Mahendranagar Chowk' },
    dropoff: { address: 'Pindeshwor Temple' },
    vehicleType: 'car',
    fare: 150,
    status: RIDE_STATUS.IN_PROGRESS,
    createdAt: minsAgo(10),
  },
  {
    _id: 'r5',
    passenger: 'u_passenger_1',
    driver: null,
    pickup:  { address: 'Vijaypur, Dharan' },
    dropoff: { address: 'Ghopa Chowk, Dharan' },
    vehicleType: 'suv',
    fare: 300,
    status: RIDE_STATUS.CANCELLED,
    createdAt: minsAgo(60 * 48),
  },
];

// simple id generator for new mock entities
export const nextId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;