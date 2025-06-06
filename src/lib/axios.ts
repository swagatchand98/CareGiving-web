import axios from 'axios';
import { auth } from '@/config/firebase';

// API base URL - replace with your actual backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config: any) => {
    // Debug the request URL
    console.log(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Try to get the Firebase ID token
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        // Get the Firebase ID token (false means don't force refresh)
        const idToken = await currentUser.getIdToken(false);
        if (config.headers) {
          config.headers['Authorization'] = `Bearer ${idToken}`;
          console.log('Using Firebase ID token for authorization');
        }
      } catch (error) {
        console.error('Error getting Firebase ID token:', error);
        // Fall back to token from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.token && config.headers) {
              config.headers['Authorization'] = `Bearer ${user.token}`;
              console.log('Using localStorage token for authorization');
            }
          } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
          }
        }
      }
    } else {
      // No Firebase user, fallback to localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.token && config.headers) {
            config.headers['Authorization'] = `Bearer ${user.token}`;
            console.log('Using localStorage token for authorization (no Firebase user)');
          }
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      } else {
        console.log('No authentication token available for request');
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
          
          // Use the fresh Firebase ID token for the original request
          originalRequest.headers['Authorization'] = `Bearer ${idToken}`;
          
          // Retry the original request
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error getting fresh ID token:', refreshError);
      }
      
      // If we get here, token refresh failed
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
