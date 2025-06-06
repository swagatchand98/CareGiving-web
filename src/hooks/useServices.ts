'use client';

import { useState, useCallback, useEffect } from 'react';
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
  
  // Cache for service categories
  const [categoriesCache, setCategoriesCache] = useState<ServiceCategoriesResponse | null>(null);
  const [categoriesCacheTime, setCategoriesCacheTime] = useState<number | null>(null);
  const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes
  
  // Get all service categories with caching and retry logic
  const fetchServiceCategories = useCallback(async (retryCount = 0): Promise<ServiceCategoriesResponse> => {
    // Check if we're already loading categories
    if (isRequestInProgress['categories']) {
      console.log('Categories request already in progress, waiting...');
      // Wait for the existing request to complete
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (!isRequestInProgress['categories']) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);
      });
      
      // If we have cached data after waiting, return it
      if (categoriesCache && categoriesCacheTime && (Date.now() - categoriesCacheTime < CACHE_DURATION)) {
        return categoriesCache;
      }
    }
    
    // Check if we have a valid cache
    if (categoriesCache && categoriesCacheTime && (Date.now() - categoriesCacheTime < CACHE_DURATION)) {
      console.log('Using cached service categories');
      return categoriesCache;
    }
    
    setIsCategoriesLoading(true);
    setError(null);
    setIsRequestInProgress(prev => ({ ...prev, categories: true }));
    
    try {
      console.log(`Fetching service categories (attempt ${retryCount + 1})`);
      const response = await getServiceCategories();
      
      // Cache the response in state and localStorage
      const currentTime = Date.now();
      setCategoriesCache(response);
      setCategoriesCacheTime(currentTime);
      
      // Save to localStorage for persistence across page refreshes
      try {
        localStorage.setItem('serviceCategories', JSON.stringify(response));
        localStorage.setItem('serviceCategoriesTime', currentTime.toString());
      } catch (storageErr) {
        console.error('Error saving categories to localStorage:', storageErr);
        // Continue even if localStorage fails
      }
      
      setIsCategoriesLoading(false);
      setIsRequestInProgress(prev => ({ ...prev, categories: false }));
      return response;
    } catch (err: any) {
      console.error('Error fetching service categories:', err);
      
      // Handle rate limiting with exponential backoff
      if (err?.response?.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${retryCount + 1}/3)`);
        
        // Wait for the delay period
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Reset the in-progress flag before retrying
        setIsRequestInProgress(prev => ({ ...prev, categories: false }));
        setIsCategoriesLoading(false);
        
        // Retry with exponential backoff
        return fetchServiceCategories(retryCount + 1);
      }
      
      setError(err.message || 'Failed to fetch service categories');
      setIsCategoriesLoading(false);
      setIsRequestInProgress(prev => ({ ...prev, categories: false }));
      throw err;
    }
  }, [categoriesCache, categoriesCacheTime, isRequestInProgress]);
  
  // Initialize categories cache on mount - this runs only once
  useEffect(() => {
    // Try to load categories from localStorage first
    try {
      const cachedData = localStorage.getItem('serviceCategories');
      const cachedTime = localStorage.getItem('serviceCategoriesTime');
      
      if (cachedData && cachedTime) {
        const parsedData = JSON.parse(cachedData);
        const parsedTime = parseInt(cachedTime, 10);
        
        // Check if cache is still valid
        if (Date.now() - parsedTime < CACHE_DURATION) {
          console.log('Loading service categories from localStorage');
          setCategoriesCache(parsedData);
          setCategoriesCacheTime(parsedTime);
          return;
        }
      }
    } catch (err) {
      console.error('Error loading categories from localStorage:', err);
      // Continue with fetching from API if localStorage fails
    }
    
    // If no valid cache in localStorage, fetch from API
    // But don't block the UI, just fetch in background
    const initializeCategories = async () => {
      try {
        await getServiceCategories().then(response => {
          // Cache the response in state and localStorage
          const currentTime = Date.now();
          setCategoriesCache(response);
          setCategoriesCacheTime(currentTime);
          
          // Save to localStorage for persistence across page refreshes
          try {
            localStorage.setItem('serviceCategories', JSON.stringify(response));
            localStorage.setItem('serviceCategoriesTime', currentTime.toString());
          } catch (storageErr) {
            console.error('Error saving categories to localStorage:', storageErr);
          }
        });
      } catch (err) {
        console.error('Background fetch of service categories failed:', err);
      }
    };
    
    initializeCategories();
  }, []);
  
  // Get all services with pagination and filtering
  const fetchServices = async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      priceType?: string;
    }
  ): Promise<ServicesResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getServices(page, limit, filters);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err.message || 'Failed to fetch services');
      setIsLoading(false);
      throw err;
    }
  };
  
  // Get service by ID
  const fetchServiceById = async (serviceId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getServiceById(serviceId);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      console.error('Error fetching service details:', err);
      setError(err.message || 'Failed to fetch service details');
      setIsLoading(false);
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
    limit: number = 10
  ): Promise<ServicesResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is a provider
      if (!user || user.role !== 'provider') {
        throw new Error('Only providers can access their services');
      }
      
      const response = await getProviderServices(page, limit);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      console.error('Error fetching provider services:', err);
      setError(err.message || 'Failed to fetch provider services');
      setIsLoading(false);
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
