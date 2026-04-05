import axios from 'axios';

export const apiClient = axios.create({
  // Use VITE_BACKEND_URL from active .env file if available, and append '/api'.
  // Defaults to relative '/api' if in production build natively, or localhost:3000 locally.
  baseURL: import.meta.env.VITE_BACKEND_URL 
    ? `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}/api` 
    : (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle errors globally if needed
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data?.error || error.message);
    const apiError = new Error(error.response?.data?.error || 'An unexpected error occurred');
    apiError.details = error.response?.data?.details;
    apiError.status = error.response?.status;
    return Promise.reject(apiError);
  }
);
