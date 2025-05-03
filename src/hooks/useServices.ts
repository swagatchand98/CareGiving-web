 'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Service,
  ServiceCategory,
  ServiceFormData,
  ServiceResponse,
  ServicesResponse,
  ServiceCategoriesResponse,
  getServices,
  getServiceById,
  searchServices,
  getServicesByCategory,
  getServiceCategories,
  getServiceCategoryById,
  createService,
  updateService,
  deleteService,
  getProviderServices
} from '@/services/serviceService';

export const useServices = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isServiceSubmitting, setIsServiceSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track if a request is in progress to prevent duplicate calls
  const [isRequestInProgress, setIsRequestInProgress] = useState<{[key: string]: boolean}>({});
  
  // Get all services with pagination and filtering
  const fetchServices = async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      priceType?: string;
    },
    retryCount: number = 0
  ): Promise<ServicesResponse> => {
    // Create a unique key for this request
    const requestKey = `services_${page}_${limit}_${JSON.stringify(filters || {})}`;
    
    // If this exact request is already in progress, return a promise that resolves when it's done
    if (isRequestInProgress[requestKey] && retryCount === 0) {
      console.log('Request already in progress, skipping duplicate call:', requestKey);
      return new Promise<ServicesResponse>((resolve) => {
        const checkInterval = setInterval(async () => {
          if (!isRequestInProgress[requestKey]) {
            clearInterval(checkInterval);
            // Return an empty response to avoid TypeScript errors
            resolve({
              services: [],
              results: 0,
              total: 0,
              page: page,
              totalPages: 0
            });
          }
        }, 100);
      });
    }
    
    // Mark this request as in progress
    setIsRequestInProgress(prev => ({ ...prev, [requestKey]: true }));
    
    // Only set loading state on the initial call, not on retries
    if (retryCount === 0) {
      setIsLoading(true);
      setError(null);
    }
    
    try {
      const response = await getServices(page, limit, filters, retryCount);
      
      // Only update state on the initial call or final successful retry
      if (retryCount === 0) {
        setIsLoading(false);
      }
      
      // Mark request as complete
      setIsRequestInProgress(prev => ({ ...prev, [requestKey]: false }));
      
      return response;
    } catch (err: any) {
      console.error('Error fetching services:', err);
      
      // Handle rate limiting with exponential backoff
      if (err?.response?.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${retryCount + 1}/3)`);
        
        // Wait for the delay period
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry with exponential backoff
        return fetchServices(page, limit, filters, retryCount + 1);
      }
      
      // Only update state on the initial call or final failed retry
      if (retryCount === 0 || retryCount >= 3) {
        setError(err.message || 'Failed to fetch services');
        setIsLoading(false);
      }
      
      // Mark request as complete
      setIsRequestInProgress(prev => ({ ...prev, [requestKey]: false }));
      
      throw err;
    }
  };
  
  // Get service by ID
  const fetchServiceById = async (serviceId: string, retryCount: number = 0) => {
    // Only set loading state on the initial call, not on retries
    if (retryCount === 0) {
      setIsLoading(true);
      setError(null);
    }
    
    try {
      const response = await getServiceById(serviceId, retryCount);
      
      // Only update state on the initial call or final successful retry
      if (retryCount === 0) {
        setIsLoading(false);
      }
      
      return response;
    } catch (err: any) {
      console.error('Error fetching service details:', err);
      
      // Handle rate limiting with exponential backoff
      if (err?.response?.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${retryCount + 1}/3)`);
        
        // Wait for the delay period
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry with exponential backoff
        return fetchServiceById(serviceId, retryCount + 1);
      }
      
      // Only update state on the initial call or final failed retry
      if (retryCount === 0 || retryCount >= 3) {
        setError(err.message || 'Failed to fetch service details');
        setIsLoading(false);
      }
      
      throw err;
    }
  };
  
  // Search services
  const searchForServices = async (
    query?: string,
    filters?: {
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      priceType?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await searchServices(query, filters);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to search services');
      setIsLoading(false);
      throw err;
    }
  };
  
  // Get services by category
  const fetchServicesByCategory = async (categoryId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getServicesByCategory(categoryId);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch services by category');
      setIsLoading(false);
      throw err;
    }
  };
  
  // Get all service categories
  const fetchServiceCategories = async (retryCount: number = 0): Promise<ServiceCategoriesResponse> => {
    // Create a unique key for this request
    const requestKey = 'service_categories';
    
    // If this exact request is already in progress, return a promise that resolves when it's done
    if (isRequestInProgress[requestKey] && retryCount === 0) {
      console.log('Request already in progress, skipping duplicate call:', requestKey);
      return new Promise<ServiceCategoriesResponse>((resolve) => {
        const checkInterval = setInterval(async () => {
          if (!isRequestInProgress[requestKey]) {
            clearInterval(checkInterval);
            // Return an empty response to avoid TypeScript errors
            resolve({
              categories: [],
              results: 0
            });
          }
        }, 100);
      });
    }
    
    // Mark this request as in progress
    setIsRequestInProgress(prev => ({ ...prev, [requestKey]: true }));
    
    // Only set loading state on the initial call, not on retries
    if (retryCount === 0) {
      setIsCategoriesLoading(true);
      setError(null);
    }
    
    try {
      const response = await getServiceCategories();
      
      // Only update state on the initial call or final successful retry
      if (retryCount === 0) {
        setIsCategoriesLoading(false);
      }
      
      // Mark request as complete
      setIsRequestInProgress(prev => ({ ...prev, [requestKey]: false }));
      
      return response;
    } catch (err: any) {
      console.error('Error fetching service categories:', err);
      
      // Handle rate limiting with exponential backoff
      if (err?.response?.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${retryCount + 1}/3)`);
        
        // Wait for the delay period
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry with exponential backoff
        return fetchServiceCategories(retryCount + 1);
      }
      
      // Only update state on the initial call or final failed retry
      if (retryCount === 0 || retryCount >= 3) {
        setError(err.message || 'Failed to fetch service categories');
        setIsCategoriesLoading(false);
      }
      
      // Mark request as complete
      setIsRequestInProgress(prev => ({ ...prev, [requestKey]: false }));
      
      throw err;
    }
  };
  
  // Get service category by ID
  const fetchServiceCategoryById = async (categoryId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getServiceCategoryById(categoryId);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch service category');
      setIsLoading(false);
      throw err;
    }
  };
  
  // Create a new service (provider only)
  const createNewService = async (serviceData: ServiceFormData) => {
    setIsServiceSubmitting(true);
    setError(null);
    
    try {
      // Check if user is a provider
      if (!user || user.role !== 'provider') {
        throw new Error('Only providers can create services');
      }
      
      const response = await createService(serviceData);
      setIsServiceSubmitting(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create service');
      setIsServiceSubmitting(false);
      throw err;
    }
  };
  
  // Update a service (provider only)
  const updateExistingService = async (serviceId: string, serviceData: Partial<ServiceFormData>) => {
    setIsServiceSubmitting(true);
    setError(null);
    
    try {
      // Check if user is a provider
      if (!user || user.role !== 'provider') {
        throw new Error('Only providers can update services');
      }
      
      const response = await updateService(serviceId, serviceData);
      setIsServiceSubmitting(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update service');
      setIsServiceSubmitting(false);
      throw err;
    }
  };
  
  // Delete a service (provider only)
  const deleteExistingService = async (serviceId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is a provider
      if (!user || user.role !== 'provider') {
        throw new Error('Only providers can delete services');
      }
      
      await deleteService(serviceId);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete service');
      setIsLoading(false);
      throw err;
    }
  };
  
  // Get provider's own services (provider only)
  const fetchProviderServices = async (
    page: number = 1,
    limit: number = 10,
    retryCount: number = 0
  ): Promise<ServicesResponse> => {
    // Create a unique key for this request
    const requestKey = `provider_services_${page}_${limit}`;
    
    // If this exact request is already in progress, return a promise that resolves when it's done
    if (isRequestInProgress[requestKey] && retryCount === 0) {
      console.log('Request already in progress, skipping duplicate call:', requestKey);
      return new Promise<ServicesResponse>((resolve) => {
        const checkInterval = setInterval(async () => {
          if (!isRequestInProgress[requestKey]) {
            clearInterval(checkInterval);
            // Return an empty response to avoid TypeScript errors
            resolve({
              services: [],
              results: 0,
              total: 0,
              page: page,
              totalPages: 0
            });
          }
        }, 100);
      });
    }
    
    // Mark this request as in progress
    setIsRequestInProgress(prev => ({ ...prev, [requestKey]: true }));
    
    // Only set loading state on the initial call, not on retries
    if (retryCount === 0) {
      setIsLoading(true);
      setError(null);
    }
    
    try {
      // Check if user is a provider
      if (!user || user.role !== 'provider') {
        throw new Error('Only providers can access their services');
      }
      
      const response = await getProviderServices(page, limit, retryCount);
      
      // Only update state on the initial call or final successful retry
      if (retryCount === 0) {
        setIsLoading(false);
      }
      
      // Mark request as complete
      setIsRequestInProgress(prev => ({ ...prev, [requestKey]: false }));
      
      return response;
    } catch (err: any) {
      console.error('Error fetching provider services:', err);
      
      // Handle rate limiting with exponential backoff
      if (err?.response?.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${retryCount + 1}/3)`);
        
        // Wait for the delay period
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry with exponential backoff
        return fetchProviderServices(page, limit, retryCount + 1);
      }
      
      // Only update state on the initial call or final failed retry
      if (retryCount === 0 || retryCount >= 3) {
        setError(err.message || 'Failed to fetch provider services');
        setIsLoading(false);
      }
      
      // Mark request as complete
      setIsRequestInProgress(prev => ({ ...prev, [requestKey]: false }));
      
      throw err;
    }
  };
  
  return {
    isLoading,
    isCategoriesLoading,
    isServiceSubmitting,
    error,
    fetchServices,
    fetchServiceById,
    searchForServices,
    fetchServicesByCategory,
    fetchServiceCategories,
    fetchServiceCategoryById,
    createNewService,
    updateExistingService,
    deleteExistingService,
    fetchProviderServices
  };
};

export default useServices;
