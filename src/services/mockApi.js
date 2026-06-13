// ── Mock API layer ──────────────────────────────────────────────────────
// Simulates the real backend's responses so the frontend can be fully
// developed/demoed before the backend exists. Each function mirrors the
// shape returned by the real axios calls: { data: { token, refreshToken,
// data: { user / users / rides / total ... } } }
//
// State is persisted to localStorage so refreshes don't lose data.

import { ROLES, RIDE_STATUS, STORAGE_KEYS } from '@/utils/constants';
import { storage } from '@/utils/helpers';
import { mockUsers, mockRides, nextId } from './mockData';

const DB_KEY = 'nepride_mock_db';
const DELAY = 350; // ms, simulate network latency

const wait = (ms = DELAY) => new Promise((res) => setTimeout(res, ms));

function loadDB() {
  const existing = storage.get(DB_KEY);
  if (existing) return existing;
  const fresh = { users: mockUsers, rides: mockRides };
  storage.set(DB_KEY, fresh);
  return fresh;
}

function saveDB(db) {
  storage.set(DB_KEY, db);
}

// Demo passwords: any password works for seeded users, password === '12345678' for new signups
const DEMO_PASSWORD = '12345678';

function makeAuthPayload(user) {
  const token = `mock_token_${user._id}`;
  const refreshToken = `mock_refresh_${user._id}`;
  storage.set(STORAGE_KEYS.TOKEN, token);
  storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  storage.set(STORAGE_KEYS.USER, user);
  return { data: { token, refreshToken, data: { user } } };
}

function getCurrentUser() {
  return storage.get(STORAGE_KEYS.USER);
}

function err(message, status = 400) {
  const e = new Error(message);
  e.response = { status, data: { message } };
  return e;
}

// ── Auth ─────────────────────────────────────────────────────────────────
export const mockAuth = {
  async login({ email, password }) {
    await wait();
    const db = loadDB();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase(),
    );
    if (!user) throw err('Invalid credentials. Check email and password.', 401);
    if (user.status === 'blocked') throw err('Your account has been blocked. Contact support.', 403);
    return makeAuthPayload(user);
  },

  async register({ name, email, password, phone, role }) {
    await wait();
    const db = loadDB();
    if (!name || !email || !password) throw err('Name, email and password are required.');
    if (password.length < 8) throw err('Password must be at least 8 characters.');
    if (db.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
      throw err('An account with this email already exists.', 409);
    }
    const user = {
      _id: nextId('u'),
      name,
      email,
      phone: phone || '',
      role: role || ROLES.PASSENGER,
      status: 'active',
      createdAt: new Date().toISOString(),
      ...(role === ROLES.DRIVER ? { vehicleType: 'car', vehicleNumber: '', rating: 0 } : {}),
    };
    db.users.push(user);
    saveDB(db);
    return makeAuthPayload(user);
  },

  async logout() {
    await wait(100);
    return { data: { success: true } };
  },

  async getMe() {
    await wait(150);
    const user = getCurrentUser();
    if (!user) throw err('Not authenticated', 401);
    const db = loadDB();
    const fresh = db.users.find((u) => u._id === user._id) || user;
    return { data: { data: { user: fresh } } };
  },

  async refresh() {
    await wait(100);
    const user = getCurrentUser();
    if (!user) throw err('Not authenticated', 401);
    return makeAuthPayload(user);
  },
};

// ── Users ────────────────────────────────────────────────────────────────
export const mockUserApi = {
  async getProfile() {
    return mockAuth.getMe();
  },

  async updateProfile(payload) {
    await wait();
    const db = loadDB();
    const current = getCurrentUser();
    const idx = db.users.findIndex((u) => u._id === current._id);
    if (idx === -1) throw err('User not found', 404);
    db.users[idx] = { ...db.users[idx], ...payload };
    saveDB(db);
    storage.set(STORAGE_KEYS.USER, db.users[idx]);
    return { data: { data: { user: db.users[idx] } } };
  },

  async uploadAvatar() {
    await wait();
    return { data: { data: { avatarUrl: '' } } };
  },

  async changePassword() {
    await wait();
    return { data: { success: true } };
  },

  // Admin
  async getAll(params = {}) {
    await wait();
    const db = loadDB();
    let users = [...db.users];
    if (params.role) users = users.filter((u) => u.role === params.role);
    const total = users.length;
    const drivers = db.users.filter((u) => u.role === ROLES.DRIVER).length;
    const limit = params.limit;
    if (limit) users = users.slice(0, limit);
    return { data: { data: { users, total, drivers } } };
  },

  async getById(id) {
    await wait();
    const db = loadDB();
    const user = db.users.find((u) => u._id === id);
    if (!user) throw err('User not found', 404);
    return { data: { data: { user } } };
  },

  async block(id) {
    await wait();
    const db = loadDB();
    const idx = db.users.findIndex((u) => u._id === id);
    if (idx === -1) throw err('User not found', 404);
    db.users[idx].status = 'blocked';
    saveDB(db);
    return { data: { data: { user: db.users[idx] } } };
  },

  async unblock(id) {
    await wait();
    const db = loadDB();
    const idx = db.users.findIndex((u) => u._id === id);
    if (idx === -1) throw err('User not found', 404);
    db.users[idx].status = 'active';
    saveDB(db);
    return { data: { data: { user: db.users[idx] } } };
  },

  async delete(id) {
    await wait();
    const db = loadDB();
    db.users = db.users.filter((u) => u._id !== id);
    saveDB(db);
    return { data: { success: true } };
  },
};

// ── Rides ────────────────────────────────────────────────────────────────
export const mockRideApi = {
  // Passenger
  async book(payload) {
    await wait();
    const db = loadDB();
    const current = getCurrentUser();
    const vehicle = payload.vehicleType || 'car';
    const baseFares = { bike: 30, car: 80, ev: 70, suv: 120 };
    const fare = (baseFares[vehicle] || 80) + Math.round(Math.random() * 100);
    const ride = {
      _id: nextId('r'),
      passenger: current._id,
      driver: null,
      pickup: payload.pickup || { address: 'Current location' },
      dropoff: payload.dropoff || { address: 'Destination' },
      vehicleType: vehicle,
      fare,
      status: RIDE_STATUS.PENDING,
      createdAt: new Date().toISOString(),
    };
    db.rides.unshift(ride);
    saveDB(db);
    return { data: { data: { ride } } };
  },

  async getMyRides() {
    await wait();
    const db = loadDB();
    const current = getCurrentUser();
    const rides = db.rides
      .filter((r) => r.passenger === current._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { data: { data: { rides } } };
  },

  async cancelRide(id) {
    await wait();
    const db = loadDB();
    const idx = db.rides.findIndex((r) => r._id === id);
    if (idx === -1) throw err('Ride not found', 404);
    db.rides[idx].status = RIDE_STATUS.CANCELLED;
    saveDB(db);
    return { data: { data: { ride: db.rides[idx] } } };
  },

  async rateRide(id, payload) {
    await wait();
    const db = loadDB();
    const idx = db.rides.findIndex((r) => r._id === id);
    if (idx === -1) throw err('Ride not found', 404);
    db.rides[idx].rating = payload?.rating;
    saveDB(db);
    return { data: { data: { ride: db.rides[idx] } } };
  },

  // Driver
  async getAvailable() {
    await wait();
    const db = loadDB();
    const rides = db.rides
      .filter((r) => r.status === RIDE_STATUS.PENDING && !r.driver)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { data: { data: { rides } } };
  },

  async acceptRide(id) {
    await wait();
    const db = loadDB();
    const current = getCurrentUser();
    const idx = db.rides.findIndex((r) => r._id === id);
    if (idx === -1) throw err('Ride not found', 404);
    db.rides[idx].driver = current._id;
    db.rides[idx].status = RIDE_STATUS.ACCEPTED;
    saveDB(db);
    return { data: { data: { ride: db.rides[idx] } } };
  },

  async startRide(id) {
    await wait();
    const db = loadDB();
    const idx = db.rides.findIndex((r) => r._id === id);
    if (idx === -1) throw err('Ride not found', 404);
    db.rides[idx].status = RIDE_STATUS.IN_PROGRESS;
    saveDB(db);
    return { data: { data: { ride: db.rides[idx] } } };
  },

  async completeRide(id) {
    await wait();
    const db = loadDB();
    const idx = db.rides.findIndex((r) => r._id === id);
    if (idx === -1) throw err('Ride not found', 404);
    db.rides[idx].status = RIDE_STATUS.COMPLETED;
    saveDB(db);
    return { data: { data: { ride: db.rides[idx] } } };
  },

  async getDriverRides() {
    await wait();
    const db = loadDB();
    const current = getCurrentUser();
    const rides = db.rides
      .filter((r) => r.driver === current._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { data: { data: { rides } } };
  },

  // Admin
  async getAll(params = {}) {
    await wait();
    const db = loadDB();
    let rides = [...db.rides].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = rides.length;
    if (params.limit) rides = rides.slice(0, params.limit);
    return { data: { data: { rides, total } } };
  },

  async getById(id) {
    await wait();
    const db = loadDB();
    const ride = db.rides.find((r) => r._id === id);
    if (!ride) throw err('Ride not found', 404);
    return { data: { data: { ride } } };
  },
};

export const MOCK_PASSWORD_HINT = DEMO_PASSWORD;
