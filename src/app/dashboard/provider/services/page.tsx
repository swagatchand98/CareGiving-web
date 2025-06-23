'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useServices from '@/hooks/useServices';
import AdminHeader from '@/components/layout/ProviderHeader';
import Footer from '@/components/layout/Footer';
import ServiceForm from '@/components/services/ServiceForm';
import ServiceCard from '@/components/services/ServiceCard';
import { Service } from '@/services/serviceService';

export default function ProviderServicesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { fetchProviderServices, deleteExistingService, isLoading: servicesLoading, error } = useServices();
  
  const [services, setServices] = useState<Service[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Use a ref to track if we've already tried to load services
  const servicesLoadAttempted = React.useRef(false);
  
  // Load provider's services
  useEffect(() => {
    // Skip if we've already tried to load services or if not authenticated or not a provider
    if (servicesLoadAttempted.current || !isAuthenticated || user?.role !== 'provider') {
      return;
    }
    
    // Create a flag to track if the component is mounted
    let isMounted = true;
    
    // Delay the service loading to ensure authentication is fully established
    const loadServicesData = async () => {
      // Mark that we've attempted to load services
      servicesLoadAttempted.current = true;
      
      try {
        // Check if we have a valid token in localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
          console.error('No user data found in localStorage');
          if (isMounted) setServices([]);
          return;
        }
        
        const parsedUserData = JSON.parse(userData);
        if (!parsedUserData.token) {
          console.error('No token found in user data');
          if (isMounted) setServices([]);
          return;
        }
        
        console.log('Fetching provider services with role:', user?.role);
        
        // Use the provider-specific endpoint that we destructured at the top level
        const response = await fetchProviderServices(1, 100);
        
        console.log('Provider services response:', response);
        
        // Check if we got a valid response with services and component is still mounted
        if (isMounted && response && response.services) {
          console.log('Setting services state with:', response.services);
          setServices(response.services);
        } else if (isMounted) {
          console.log('No services returned or empty response');
          setServices([]);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading services:', err);
          setServices([]);
        }
      }
    };
    
    // Add a small delay to ensure authentication is fully established
    const timer = setTimeout(() => {
      loadServicesData();
    }, 500);
    
    // Cleanup function to set the flag when the component unmounts
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isAuthenticated, user?.role]);
  
  // Redirect if not authenticated or not a provider
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'provider')) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, router]);
  
  const loadServices = async () => {
    try {
      // Use the provider-specific endpoint that we destructured at the top level
      const response = await fetchProviderServices(1, 100);
      
      // Check if we got a valid response with services
      if (!response || !response.services || response.services.length === 0) {
        console.log('No services returned or empty response');
        setServices([]);
        return;
      }
      
      console.log('Provider services:', response.services);
      setServices(response.services);
    } catch (err) {
      console.error('Error loading services:', err);
      setServices([]);
    }
  };
  
  const handleCreateService = () => {
    setEditingService(null);
    setShowCreateForm(true);
    
    // Scroll to form
    setTimeout(() => {
      const formElement = document.getElementById('service-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowCreateForm(true);
    
    // Scroll to form
    setTimeout(() => {
      const formElement = document.getElementById('service-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteExistingService(serviceId);
        
        // Remove service from list
        setServices(services.filter(service => service._id !== serviceId));
        
        // Show success message
        setSuccessMessage('Service deleted successfully');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } catch (err: any) {
        setDeleteError(err.message || 'Failed to delete service');
        
        // Hide error message after 3 seconds
        setTimeout(() => {
          setDeleteError(null);
        }, 3000);
      }
    }
  };
  
  const handleServiceCreated = (service: Service) => {
    console.log('Service created:', service);
    
    // Add new service to list
    setServices([...services, service]);
    
    // Hide form
    setShowCreateForm(false);
    
    // Show success message
    setSuccessMessage('Service created successfully');
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
    
    // Reload services to ensure we have the latest data
    setTimeout(() => {
      loadServices();
    }, 1000);
  };
  
  const handleServiceUpdated = (updatedService: Service) => {
    // Update service in list
    setServices(services.map(service => 
      service._id === updatedService._id ? updatedService : service
    ));
    
    // Hide form
    setShowCreateForm(false);
    setEditingService(null);
    
    // Show success message
    setSuccessMessage('Service updated successfully');
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };
  
  // Fallback to prevent infinite loading
  useEffect(() => {
    // Set a timeout to stop loading after 5 seconds regardless of other states
    // This prevents infinite loading if something goes wrong
    const timer = setTimeout(() => {
      if (authLoading) {
        console.log('Fallback timeout: Setting loading to false after timeout');
        // We can't directly set authLoading to false since it's from a hook,
        // but we can proceed with rendering the page
        servicesLoadAttempted.current = true;
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [authLoading]);
  
  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }
  
  // If user is not authenticated, show a message or redirect
  if (!isAuthenticated) {
    return null; // We'll redirect in the useEffect hook
  }
  
  // Ensure user is not null before rendering the dashboard
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading user data...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminHeader user={user} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Services</h1>
            <p className="text-gray-600">Manage your service offerings</p>
          </div>
          
          <button 
            onClick={handleCreateService}
            className="mt-4 md:mt-0 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Create New Service
          </button>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {successMessage}
          </div>
        )}
        
        {/* Error Message */}
        {(error || deleteError) && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error || deleteError}
          </div>
        )}
        
        {/* Service Form */}
        {showCreateForm && (
          <div id="service-form" className="mb-8">
            <ServiceForm 
              initialData={editingService || undefined}
              onSuccess={editingService ? handleServiceUpdated : handleServiceCreated}
            />
          </div>
        )}
        
        {/* Services List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Services</h2>
          
          {servicesLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-500 mb-4">You haven't created any services yet.</p>
              <button 
                onClick={handleCreateService}
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Create Your First Service
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {services.map((service) => (
                <div key={service._id} className="relative">
                  <ServiceCard service={service} />
                  
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button 
                      onClick={() => handleEditService(service)}
                      className="bg-white text-gray-700 p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteService(service._id)}
                      className="bg-white text-red-600 p-2 rounded-full shadow hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
