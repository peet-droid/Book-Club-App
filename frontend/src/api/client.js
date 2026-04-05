import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
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
