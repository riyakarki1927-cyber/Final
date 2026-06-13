import api from './api';
import { USE_MOCK_API } from '@/utils/constants';
import { mockUserApi } from './mockApi';

const realUserService = {
  getProfile:    ()    => api.get('/users/me'),
  updateProfile: (d)   => api.patch('/users/me',          d),
  uploadAvatar:  (f)   => {
    const fd = new FormData(); fd.append('avatar', f);
    return api.patch('/users/me/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  changePassword:(d)   => api.patch('/users/me/password', d),

  // Admin
  getAll:        (p)   => api.get('/users',                { params: p }),
  getById:       (id)  => api.get(`/users/${id}`),
  block:         (id)  => api.patch(`/users/${id}/block`),
  unblock:       (id)  => api.patch(`/users/${id}/unblock`),
  delete:        (id)  => api.delete(`/users/${id}`),
};

const userService = USE_MOCK_API
  ? {
      getProfile:    ()    => mockUserApi.getProfile(),
      updateProfile: (d)   => mockUserApi.updateProfile(d),
      uploadAvatar:  (f)   => mockUserApi.uploadAvatar(f),
      changePassword:(d)   => mockUserApi.changePassword(d),
      getAll:        (p)   => mockUserApi.getAll(p),
      getById:       (id)  => mockUserApi.getById(id),
      block:         (id)  => mockUserApi.block(id),
      unblock:       (id)  => mockUserApi.unblock(id),
      delete:        (id)  => mockUserApi.delete(id),
    }
  : realUserService;

export default userService;
