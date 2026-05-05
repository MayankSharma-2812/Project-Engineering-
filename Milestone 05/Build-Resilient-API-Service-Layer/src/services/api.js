import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      console.warn("Global 401 handler: Unauthorized access - possibly expired token.");
      // In a real app, you might redirect to login or clear the token
      // window.location.href = '/login';
    } else if (status === 403) {
      console.error("Global 403 handler: Forbidden access.");
    } else if (status >= 500) {
      console.error("Global 5xx handler: Server error occurred.");
    }

    return Promise.reject(error);
  }
);

// API Service functions
export const productService = {
  getProducts: () => api.get('/products'),
  getProductById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getProductsByCategory: (category) => api.get(`/products/category/${category}`),
};

export const cartService = {
  getUserCart: (userId) => api.get(`/carts/user/${userId}`),
  addToCart: (cartData) => api.post('/carts', cartData),
  deleteCartItem: (cartId) => api.delete(`/carts/${cartId}`),
};

export const userService = {
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  updateUserProfile: (userId, userData) => api.put(`/users/${userId}`, userData),
};

export default api;
