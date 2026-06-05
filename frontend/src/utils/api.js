import axios from 'axios';
import mockApi from './mockApi';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// Real axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // 402 = subscription expired → redirect to subscription page
    if (err.response?.status === 402) {
      // Only redirect if not already on the subscription page
      if (!window.location.pathname.startsWith('/subscription')) {
        window.location.href = '/subscription?expired=1';
      }
    }
    return Promise.reject(err);
  }
);

// Export either real or mock API transparently
const api = USE_MOCK ? mockApi : axiosInstance;
export default api;
