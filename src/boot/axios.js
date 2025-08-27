import { boot } from 'quasar/wrappers';
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: (process.env.VUE_APP_API_URL || 'http://localhost:3000') + '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  timeout: 30000 // 30 seconds
});

// Request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    
    // If token exists and Authorization header is not already set
    if (token && !config.headers.Authorization) {
      // Ensure token has Bearer prefix
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = authToken;
      
      // For debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Adding Authorization header to request:', {
          url: config.url,
          method: config.method,
          hasToken: !!token,
          tokenPrefix: token.substring(0, 10) + '...'
        });
      }
    }
    
    // Ensure credentials are sent with every request
    config.withCredentials = true;
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // For debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Log error details for debugging
    console.error('API Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Clear auth data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userToken');
      
      // Only redirect if not already on a login page
      const isLoginPage = ['/login', '/admin/login'].includes(window.location.pathname);
      if (!isLoginPage) {
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        window.location.href = isAdminRoute ? '/admin/login' : '/login';
      }
    }
    
    // For other errors, include more details in the error message
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.message || `Request failed with status ${status}`;
      error.message = errorMessage;
      error.details = data;
    }
    
    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
