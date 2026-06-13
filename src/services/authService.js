import api from './api';
import { USE_MOCK_API } from '@/utils/constants';
import { mockAuth } from './mockApi';

const realAuthService = {
  login:    (data)    => api.post('/auth/login',    data),
  register: (data)    => api.post('/auth/register', data),
  logout:   ()        => api.post('/auth/logout'),
  getMe:    ()        => api.get('/auth/me'),
  refresh:  (refresh) => api.post('/auth/refresh',  { refreshToken: refresh }),
};

const authService = USE_MOCK_API
  ? {
      login:    (data)    => mockAuth.login(data),
      register: (data)    => mockAuth.register(data),
      logout:   ()        => mockAuth.logout(),
      getMe:    ()        => mockAuth.getMe(),
      refresh:  (refresh) => mockAuth.refresh(refresh),
    }
  : realAuthService;

export default authService;
