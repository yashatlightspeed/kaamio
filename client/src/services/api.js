import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — inject token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kaamio_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kaamio_token');
      localStorage.removeItem('kaamio_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
