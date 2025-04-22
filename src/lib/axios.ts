import axios from 'axios';
import { auth } from '@/config/firebase';

// API base URL - replace with your actual backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.token && config.headers) {
          config.headers['Authorization'] = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to an expired token and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Check if we have a Firebase user
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Get a fresh ID token
          const idToken = await currentUser.getIdToken(true);
          
          // Try to refresh the session with the backend
          try {
            const response = await axios.post(
              `${API_BASE_URL}/auth/login`,
              {},
              {
                headers: {
                  'Authorization': `Bearer ${idToken}`
                }
              }
            );
            
            if (response.status === 200) {
              const userData = response.data as { token: string };
              localStorage.setItem('user', JSON.stringify(userData));
              
              // Update the original request with the new token
              originalRequest.headers['Authorization'] = `Bearer ${userData.token}`;
              
              // Retry the original request
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
          }
        }
      } catch (refreshError) {
        console.error('Error getting fresh ID token:', refreshError);
      }
      
      // If we get here, token refresh failed
      // Only redirect to login if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Clear
        localStorage.removeItem('user');
        
        // Don't automatically redirect to login page to avoid disrupting the user experience
        // Instead, let the components handle the unauthorized state
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
