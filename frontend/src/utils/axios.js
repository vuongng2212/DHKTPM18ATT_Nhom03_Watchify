import axios from 'axios';

/**
 * Axios instance with default configuration and interceptors
 * Handles authentication, error handling, and request/response transformation
 */

// Get base URL from environment variable or use default
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Adds authentication token to requests if available
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get access token from localStorage
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles responses and errors globally
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = getCookie('refreshToken');

        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
            refreshToken: refreshToken,
          });

          const { token } = response.data;

          // Save new token
          localStorage.setItem('accessToken', token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        } else {
          // No refresh token available, redirect to login
          handleAuthenticationError();
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        console.error('[Token Refresh Error]', refreshError);
        handleAuthenticationError();
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      console.error('[Access Denied] Insufficient permissions');
      // You can show a toast notification here
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('[Not Found] Resource not found');
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('[Server Error] Internal server error');
      // You can show a toast notification here
    }

    // Handle network errors
    if (!error.response) {
      console.error('[Network Error] Unable to reach the server');
      // You can show a toast notification here
    }

    return Promise.reject(error);
  }
);

/**
 * Handle authentication errors
 * Clear tokens and redirect to login
 */
const handleAuthenticationError = () => {
  // Clear tokens
  localStorage.removeItem('accessToken');
  deleteCookie('refreshToken');

  // Redirect to login page
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

/**
 * Get cookie by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

/**
 * Delete cookie by name
 * @param {string} name - Cookie name
 */
const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

/**
 * Helper function to handle API errors
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    // Backend error message
    if (Array.isArray(error.response.data.message)) {
      return error.response.data.message[0];
    }
    return error.response.data.message;
  }

  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const accessToken = localStorage.getItem('accessToken');
  return !!accessToken;
};

/**
 * Export axios instance as default
 */
export default axiosInstance;