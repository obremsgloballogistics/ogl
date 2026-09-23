import axios from 'axios';

const runtimeEnv = (import.meta as ImportMeta & {
  env?: { PROD?: boolean; VITE_API_BASE_URL?: string; VITE_API_URL?: string };
}).env;
const configuredApiBaseUrl = runtimeEnv?.VITE_API_BASE_URL || runtimeEnv?.VITE_API_URL;
const defaultApiBaseUrl = runtimeEnv?.PROD ? 'https://ogl-backend.onrender.com/api' : '/api';

const api = axios.create({
  baseURL: configuredApiBaseUrl || defaultApiBaseUrl,
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
