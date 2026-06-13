import axios from 'axios';
import { API_URL, STORAGE_KEYS } from '@/utils/constants';
import { storage } from '@/utils/helpers';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = storage.get(STORAGE_KEYS.TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      [STORAGE_KEYS.TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.USER].forEach(k =>
        storage.remove(k),
      );
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default api;
