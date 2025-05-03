'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // Use static states to avoid infinite update loops
  const [service, setService] = useState<Service | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load service data - using useCallback to avoid recreation on every render
  const loadService = useCallback(async () => {
    if (!id) {
      setError('Invalid service ID');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to get from localStorage first for faster loading
      try {
        const cachedData = localStorage.getItem(`service_${id}`);
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
        const response = await fetchServiceById(id as string);
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        if (response && response.service) {
          console.log('Service loaded successfully:', response.service);
          setService(response.service);
          
          // Cache the service data
          try {
            localStorage.setItem(`service_${id}`, JSON.stringify(response.service));
          } catch (e) {
            console.error('Error caching service data:', e);
          }
        } else {
          console.error('Invalid service response:', response);
          // Use mock service as fallback
          const mockService = createMockService(id as string);
          setService(mockService);
          setError('Service data could not be loaded. Showing fallback content.');
        }
      } catch (err: any) {
        // Clear the timeout since we got an error
        clearTimeout(timeoutId);
        
        console.error('Error loading service:', err);
        
        // Use mock service as fallback
        const mockService = createMockService(id as string);
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
      const mockService = createMockService(id as string);
      setService(mockService);
      setError('An unexpected error occurred. Using fallback content.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);
  
  // Initial load
  useEffect(() => {
    loadService();
  }, [loadService]);
  
  const handleBookNow = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push(`/auth/login?redirect=/services/details/${id}`);
      return;
    }
    
    // Show booking form
    setShowBookingForm(true);
    
    // Scroll to booking form
    setTimeout(() => {
      const bookingFormElement = document.getElementById('booking-form');
      if (bookingFormElement) {
        bookingFormElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  if (isLoading || !service) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {user ? <EnhancedHeader user={user} /> : <PublicHeader />}
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-black"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back
            </button>
          </div>
          
          <div className="flex flex-col justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600">Loading service details...</p>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {user ? <EnhancedHeader user={user} /> : <PublicHeader />}
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-black"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back
            </button>
          </div>
          
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-md">
            <h3 className="font-semibold mb-2">Error</h3>
            <p>{error}</p>
            <button 
              onClick={() => loadService()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {user ? <EnhancedHeader user={user} /> : <PublicHeader />}
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-black"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Service Details */}
          <div className="lg:col-span-2">
            <ServiceDetails 
              service={service}
              onBookNow={handleBookNow}
            />
          </div>
          
          {/* Booking Form */}
          <div className="lg:col-span-1">
            {showBookingForm ? (
              <div id="booking-form">
                <BookingForm
                  serviceId={service._id}
                  serviceName={service.title}
                  providerId={typeof service.providerId === 'string' ? service.providerId : service.providerId._id}
                  providerName={getProviderName()}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Ready to Book?</h2>
                <p className="text-gray-600 mb-6">
                  Book this service now to secure your appointment with {getProviderName()}.
                </p>
                <button
                  onClick={handleBookNow}
                  className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Book Now
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
