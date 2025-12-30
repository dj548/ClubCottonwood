import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://makerhub-api-production.up.railway.app/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minute default timeout
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    // Extract meaningful error message
    const errorMessage = error.response?.data?.details
      || error.response?.data?.error
      || error.response?.data?.message
      || error.message
      || 'An unknown error occurred';
    const enhancedError = new Error(errorMessage);
    return Promise.reject(enhancedError);
  }
);
