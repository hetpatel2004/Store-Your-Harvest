import axios from 'axios';

const computeBaseURL = () => {
  let url = import.meta.env.VITE_API_URL || '/api';
  if (typeof url === 'string') {
    url = url.trim().replace(/\/+$/, '');
    // If external host provided without /api (e.g. https://my-backend.vercel.app), append /api
    if (url.startsWith('http') && !url.endsWith('/api')) {
      url = `${url}/api`;
    }
  }
  return url;
};

const api = axios.create({
  baseURL: computeBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token and normalize url
api.interceptors.request.use(
  (config) => {
    // Avoid double /api if config.url starts with /api/
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }

    const token = localStorage.getItem('agricold_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh session
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to validate/retrieve user session with existing token
        const res = await api.get('/auth/me', {
          headers: {
            Authorization: originalRequest?.headers?.Authorization,
          },
        });
        if (res.data.success) {
          // Session still valid, continue with original request
          return api(originalRequest);
        }
      } catch (refreshErr) {
        // Session expired, clear tokens
        if (localStorage.getItem('agricold_token')) {
          localStorage.removeItem('agricold_token');
          localStorage.removeItem('agricold_user');
        }
      }
    }

    // Handle other errors with user-friendly messages
    if (error.response) {
      // Server responded with a status outside 2xx range
      const status = error.response.status;
      const data = error.response.data;

      // Handle specific status codes
      if (status === 404) {
        // Not found - route or resource doesn't exist
        // Could log or show friendly message
      } else if (status === 500) {
        // Server error - might be temporary
      }
    } else if (error.request) {
      // Network error - no response received
      // This happens when server is not running
    }

    return Promise.reject(error);
  }
);

export default api;
