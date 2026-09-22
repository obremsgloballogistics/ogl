import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL || '/api',
  headers: {

    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('obrems_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('obrems_token');
      localStorage.removeItem('obrems_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
