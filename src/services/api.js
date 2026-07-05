import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Product APIs
// Product APIs
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  getListings: (id) => api.get(`/products/${id}/listings`),
  addListing: (id, data) => api.post(`/products/${id}/listings`, data),
  getLowSale: () => api.get('/products/low-sale'),
  getNoSale: () => api.get('/products/no-sale'),
};

// Recommendation APIs
export const recommendationAPI = {
  getAll: () => api.get('/recommendations'),
  getPending: () => api.get('/recommendations/pending'),
  generate: (marketplaceProductId) => api.post(`/recommendations/generate/${marketplaceProductId}`),
  generateAll: () => api.post('/recommendations/generate-all'),
  approve: (id, comments) => api.patch(`/recommendations/${id}/approve`, { comments }),
  reject: (id, comments) => api.patch(`/recommendations/${id}/reject`, { comments }),
};

export default api;
