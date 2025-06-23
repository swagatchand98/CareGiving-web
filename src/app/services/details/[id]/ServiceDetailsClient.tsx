'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedHeader from '@/components/layout/EnhancedHeader';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import ServiceDetails from '@/components/services/ServiceDetails';
import BookingForm from '@/components/timeslots/BookingForm';
import { Service } from '@/services/serviceService';
import api from '@/lib/axios';

// Mock service data to use as fallback when API fails
const createMockService = (id: string): Service => ({
  _id: id || 'mock-service-id',
  title: 'Service Details',
  description: 'This is a fallback service description. The actual service details could not be loaded due to a server timeout or error. Please try again later or contact support if the issue persists.',
  images: [],
  price: {
    amount: 50,
    type: 'fixed'
  },
  duration: 60,
  providerId: 'provider-id',
  categoryId: 'category-id',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Direct API call function to avoid hooks in useEffect
const fetchServiceById = async (serviceId: string): Promise<any> => {
  try {
    const response = await api.get(`/services/${serviceId}`);
    return response.data ? (response.data as any).data : null;
  } catch (error: any) {
    console.error('Error fetching service:', error);
    throw error;
  }
};

interface ServiceDetailsClientProps {
  serviceId: string;
}

export default function ServiceDetailsClient({ serviceId }: ServiceDetailsClientProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // Use static states to avoid infinite update loops
  const [service, setService] = useState<Service | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load service data - using useCallback to avoid recreation on every render
  const loadService = useCallback(async () => {
    if (!serviceId) {
      setError('Invalid service ID');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to get from localStorage first for faster loading
      try {
        const cachedData = localStorage.getItem(`service_${serviceId}`);
        if (cachedData) {
          const parsedService = JSON.parse(cachedData);
          console.log('Using cached service data:', parsedService);
          setService(parsedService);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error reading from localStorage:', e);
      }
      
      // Create an AbortController for the timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        // Make the API request with the abort signal
        const response = await fetchServiceById(serviceId);
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        if (response && response.service) {
          console.log('Service loaded successfully:', response.service);
          setService(response.service);
          
          // Cache the service data
          try {
            localStorage.setItem(`service_${serviceId}`, JSON.stringify(response.service));
          } catch (e) {
            console.error('Error caching service data:', e);
          }
        } else {
          console.error('Invalid service response:', response);
          // Use mock service as fallback
          const mockService = createMockService(serviceId);
          setService(mockService);
          setError('Service data could not be loaded. Showing fallback content.');
        }
      } catch (err: any) {
        // Clear the timeout since we got an error
        clearTimeout(timeoutId);
        
        console.error('Error loading service:', err);
        
        // Use mock service as fallback
        const mockService = createMockService(serviceId);
        setService(mockService);
        
        if (err.name === 'AbortError') {
          setError('Request timed out. Using fallback content.');
        } else {
          setError('Failed to load service details. Using fallback content.');
        }
      }
    } catch (err: any) {
      console.error('Outer error loading service:', err);
      
      // Use mock service as fallback
      const mockService = createMockService(serviceId);
      setService(mockService);
      setError('An unexpected error occurred. Using fallback content.');
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);
  
  // Use a ref to track if data has been fetched
  const dataFetchedRef = useRef(false);
  
  // Initial load
  useEffect(() => {
    // Only fetch data once
    if (dataFetchedRef.current) return;
    
    if (serviceId) {
      loadService();
      // Mark data as fetched
      dataFetchedRef.current = true;
    }
  }, [serviceId, loadService]);
  
  const handleBookNow = () => {
    console.log('Book Now clicked for service:', service);
    
    if (!service) {
      console.error('Service is null, cannot book');
      return;
    }
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      console.log('User not authenticated, redirecting to login');
      router.push(`/auth/login?redirect=/services/details/${serviceId}`);
      return;
    }
    
    // Show booking form
    console.log('Showing booking form for service:', service._id);
    setShowBookingForm(true);
    
    // Scroll to booking form
    setTimeout(() => {
      const bookingFormElement = document.getElementById('booking-form');
      if (bookingFormElement) {
        console.log('Scrolling to booking form');
        bookingFormElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.error('Booking form element not found');
      }
    }, 100);
  };
  
  if (isLoading || !service) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        {user ? <EnhancedHeader user={user} /> : <PublicHeader />}
        
        <main className="flex-grow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Back Button Skeleton */}
            <div className="mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-12 h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Service Details Skeleton */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  {/* Image Skeleton */}
                  <div className="w-full h-64 sm:h-80 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse mb-6"></div>
                  
                  {/* Title Skeleton */}
                  <div className="h-8 bg-gray-300 rounded-lg w-3/4 mb-4 animate-pulse"></div>
                  
                  {/* Description Skeleton */}
                  <div className="space-y-3 mb-6">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                  </div>
                  
                  {/* Price and Duration Skeleton */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="h-12 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
                    <div className="h-12 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              {/* Booking Form Skeleton */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-4 animate-pulse"></div>
                  <div className="space-y-3 mb-6">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                  </div>
                  <div className="h-12 bg-gray-300 rounded-lg w-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Loading Indicator */}
            <div className="fixed bottom-8 right-8 bg-white rounded-full shadow-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm font-medium text-gray-700">Loading service...</span>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        {user ? <EnhancedHeader user={user} /> : <PublicHeader />}
        
        <main className="flex-grow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-8">
              <button 
                onClick={() => router.back()}
                className="group flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back
              </button>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b border-red-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-red-800">Service Unavailable</h3>
                      <p className="text-sm text-red-600">We encountered an issue loading this service</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-6">
                  <p className="text-gray-700 mb-6 leading-relaxed">{error}</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => loadService()}
                      className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-200 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      Try Again
                    </button>
                    <button 
                      onClick={() => router.push('/services')}
                      className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 transition-all duration-200"
                    >
                      Browse Services
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  // Format provider name
  const getProviderName = () => {
    if (typeof service.providerId === 'string') {
      return 'Provider';
    } else {
      return `${service.providerId.firstName} ${service.providerId.lastName}`;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {user ? <EnhancedHeader user={user} /> : <PublicHeader />}
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-8">
            <button 
              onClick={() => router.back()}
              className="group flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Service Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow duration-300 hover:shadow-md">
                <ServiceDetails 
                  service={service}
                  onBookNow={handleBookNow}
                />
              </div>
            </div>
            
            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {showBookingForm ? (
                  <div 
                    id="booking-form" 
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 animate-in slide-in-from-right-2"
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Book Your Service</h2>
                      <p className="text-sm text-gray-600 mt-1">Select your preferred time slot</p>
                    </div>
                    <div className="p-6">
                      <BookingForm
                        serviceId={service._id}
                        serviceName={service.title}
                        providerId={typeof service.providerId === 'string' ? service.providerId : service.providerId._id}
                        providerName={getProviderName()}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Ready to Book?</h2>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{getProviderName()}</p>
                          <p className="text-sm text-gray-500">Service Provider</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Book this service now to secure your appointment with {getProviderName()}.
                      </p>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Instant confirmation
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Professional service
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Flexible scheduling
                        </div>
                      </div>
                      
                      <button
                        onClick={handleBookNow}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        Book Now
                      </button>
                      
                      {!isAuthenticated && (
                        <p className="text-xs text-gray-500 mt-3 text-center">
                          You'll be asked to sign in to complete your booking
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
