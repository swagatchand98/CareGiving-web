import axios from 'axios';
import { auth } from '@/config/firebase';

// API base URL - replace with your actual backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds (increased from 10 seconds)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request queue to track in-flight requests and manage request timing
const requestQueue = new Map();
// Track the last request time to add delays between requests
let lastRequestTime = 0;
// Minimum time between requests in milliseconds
const MIN_REQUEST_INTERVAL = 500; // Increased from 300ms to 500ms
// Simple response cache to reduce duplicate requests
const responseCache = new Map();
// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;
// Global retry counter to track how many retries we've done
let globalRetryCount = 0;
// Maximum number of global retries before backing off more aggressively
const MAX_GLOBAL_RETRIES = 10;

// Request interceptor for API calls
api.interceptors.request.use(
  async (config: any) => {
    // Debug the request URL
    console.log(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Create a unique key for this request
    const requestKey = `${config.method}_${config.url}`;
    
    // For GET requests, check if we have a cached response
    if (config.method === 'get' && !config._isRetry && !config._bypassCache) {
      const cacheKey = `${config.method}_${config.url}_${JSON.stringify(config.params || {})}`;
      const cachedResponse = responseCache.get(cacheKey);
      
      if (cachedResponse) {
        const { data, timestamp } = cachedResponse;
        const now = Date.now();
        
        // Check if the cache is still valid
        if (now - timestamp < CACHE_TTL) {
          console.log(`Using cached response for: ${config.url}`);
          // Return a promise that resolves with the cached response
          return Promise.resolve({
            ...config,
            data,
            status: 200,
            statusText: 'OK (cached)',
            headers: {},
            _fromCache: true
          });
        } else {
          // Cache expired, remove it
          responseCache.delete(cacheKey);
        }
      }
    }
    
    // Check if this is a retry request (don't deduplicate retries)
    if (!config._isRetry) {
      // Check if an identical request is already in progress
      if (requestQueue.has(requestKey)) {
        console.log(`Duplicate request detected: ${requestKey}`);
        
        // Instead of rejecting, we'll wait for the original request to complete
        // and then make a new request with a small delay
        await new Promise(resolve => {
          const checkInterval = setInterval(() => {
            if (!requestQueue.has(requestKey)) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 100);
        });
        
        // Add a small delay before making the duplicate request
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log(`Proceeding with previously duplicate request: ${requestKey}`);
      }
      
      // Add this request to the queue
      requestQueue.set(requestKey, Date.now());
    }
    
    // Add a delay between requests to avoid rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const delayTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`Adding ${delayTime}ms delay between requests`);
      await new Promise(resolve => setTimeout(resolve, delayTime));
    }
    
    // Update the last request time
    lastRequestTime = Date.now();
    
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
        console.warn('No authentication token available for request');
      }
    }
    
    // Debug the final headers
    console.log('Request headers:', config.headers);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    // Remove the request from the queue when it completes successfully
    const requestKey = `${response.config.method}_${response.config.url}`;
    requestQueue.delete(requestKey);
    
    // Cache successful GET responses
    if (response.config.method === 'get' && !(response as any)._fromCache) {
      const cacheKey = `${response.config.method}_${response.config.url}_${JSON.stringify(response.config.params || {})}`;
      responseCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      console.log(`Cached response for: ${response.config.url}`);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Remove the request from the queue when it fails
    if (originalRequest) {
      const requestKey = `${originalRequest.method}_${originalRequest.url}`;
      requestQueue.delete(requestKey);
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.log('Request timed out:', originalRequest?.url);
      
      // For GET requests, try to use a cached response if available
      if (originalRequest?.method === 'get') {
        const cacheKey = `${originalRequest.method}_${originalRequest.url}_${JSON.stringify(originalRequest.params || {})}`;
        const cachedResponse = responseCache.get(cacheKey);
        
        if (cachedResponse) {
          console.log(`Using cached response after timeout for: ${originalRequest.url}`);
          return Promise.resolve({
            ...originalRequest,
            data: cachedResponse.data,
            status: 200,
            statusText: 'OK (cached after timeout)',
            headers: {},
            _fromCache: true
          });
        }
      }
      
      // If no cache is available and we haven't retried too many times
      if (originalRequest && (!originalRequest._timeoutRetryCount || originalRequest._timeoutRetryCount < 2)) {
        // Initialize or increment timeout retry count
        originalRequest._timeoutRetryCount = (originalRequest._timeoutRetryCount || 0) + 1;
        
        console.log(`Retrying timed out request: ${originalRequest.url} (Attempt ${originalRequest._timeoutRetryCount}/2)`);
        
        // Retry with a longer timeout
        originalRequest.timeout = originalRequest.timeout * 1.5; // Increase timeout by 50%
        
        // Add a flag to indicate this is a retry
        originalRequest._isRetry = true;
        
        // Retry the request
        return api(originalRequest);
      }
    }
    
    // Handle rate limiting (429 Too Many Requests)
    if (error.response?.status === 429) {
      // Initialize retry count if not already set
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0;
      }
      
      // Increment retry count
      originalRequest._retryCount++;
      
      // Increment global retry counter
      globalRetryCount++;
      
      // Only retry up to 3 times per request
      if (originalRequest._retryCount <= 3) {
        const retryCount = originalRequest._retryCount;
        
        // If we've had too many global retries, back off more aggressively
        let baseDelay = Math.pow(2, retryCount) * 1500; // 3s, 6s, 12s (base case)
        
        if (globalRetryCount > MAX_GLOBAL_RETRIES) {
          // Add additional delay based on how many global retries we've done
          const extraDelay = (globalRetryCount - MAX_GLOBAL_RETRIES) * 1000;
          baseDelay += extraDelay;
          console.log(`Adding extra ${extraDelay}ms delay due to high global retry count (${globalRetryCount})`);
        }
        
        // Add jitter to avoid thundering herd
        const jitter = Math.random() * 1000; // Add up to 1000ms of random jitter
        const delay = baseDelay + jitter;
        
        console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${retryCount}/3)`);
        console.log(`Request URL: ${originalRequest.method} ${originalRequest.url}`);
        console.log(`Global retry count: ${globalRetryCount}`);
        
        // Wait for the delay period
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Add a flag to indicate this is a retry
        originalRequest._isRetry = true;
        
        // Retry the request
        return api(originalRequest);
      } else {
        // If we've exceeded the retry limit, try to use a cached response if available
        if (originalRequest.method === 'get') {
          const cacheKey = `${originalRequest.method}_${originalRequest.url}_${JSON.stringify(originalRequest.params || {})}`;
          const cachedResponse = responseCache.get(cacheKey);
          
          if (cachedResponse) {
            console.log(`Using cached response after max retries for: ${originalRequest.url}`);
            return Promise.resolve({
              ...originalRequest,
              data: cachedResponse.data,
              status: 200,
              statusText: 'OK (cached after retry failure)',
              headers: {},
              _fromCache: true
            });
          }
        }
      }
    }
    
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
              const userData = response.data;
              localStorage.setItem('user', JSON.stringify(userData));
              
              // Use the fresh Firebase ID token for the original request
              originalRequest.headers['Authorization'] = `Bearer ${idToken}`;
              
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
