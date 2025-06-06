'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import useServices from '@/hooks/useServices';
import useBooking from '@/hooks/useBooking';
import EnhancedHeader from '@/components/layout/EnhancedHeader';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import UserBookingsList from '@/components/services/UserBookingsList';
import { Service, ServiceCategory } from '@/services/serviceService';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import InteractiveSlider from '@/components/user/dashboard/interactiveSlider';
import { TextField } from '@mui/material';

export default function UserDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recommended');
  
  // Services state
  const { 
    fetchServices, 
    fetchServiceCategories, 
    isLoading: servicesLoading, 
    isCategoriesLoading,
    error: servicesError 
  } = useServices();
  
  const { 
    fetchUserBookings, 
    isLoading: bookingsLoading, 
    error: bookingsError 
  } = useBooking();
  
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);
  
  // Use a ref to track if we've already tried to load categories
  const categoriesLoadAttempted = React.useRef(false);
  
  // Fetch service categories
  useEffect(() => {
    // Skip if we've already tried to load categories or if not authenticated
    if (categoriesLoadAttempted.current || !isAuthenticated) {
      return;
    }
    
    // Create a flag to track if the component is mounted
    let isMounted = true;
    
    const loadCategories = async () => {
      // Mark that we've attempted to load categories
      categoriesLoadAttempted.current = true;
      
      try {
        console.log('Fetching service categories...');
        const response = await fetchServiceCategories();
        console.log('Service categories response:', response);
        
        // Only update state if the component is still mounted
        if (isMounted && response && response.categories) {
          console.log('Setting categories state with:', response.categories);
          setCategories(response.categories);
        }
      } catch (err: any) {
        // Only update state if the component is still mounted
        if (isMounted) {
          console.error('Error loading categories:', err);
          setError(err.message || 'Failed to load service categories');
        }
      }
    };
    
    loadCategories();
    
    // Cleanup function to set the flag when the component unmounts
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);
  
  // Use a ref to track if we've already tried to load services
  const servicesLoadAttempted = React.useRef(false);
  
  // Fetch popular services
  useEffect(() => {
    // Skip if we've already tried to load services or if not authenticated
    if (servicesLoadAttempted.current || !isAuthenticated) {
      return;
    }
    
    // Create a flag to track if the component is mounted
    let isMounted = true;
    
    const loadServices = async () => {
      // Mark that we've attempted to load services
      servicesLoadAttempted.current = true;
      
      try {
        console.log('Fetching popular services...');
        // Get popular services (we'll just get the first 4 services for now)
        const response = await fetchServices(1, 4);
        console.log('Services response:', response);
        
        // Only update state if the component is still mounted
        if (isMounted && response && response.services) {
          console.log('Setting services state with:', response.services);
          setServices(response.services);
        }
      } catch (err: any) {
        // Only update state if the component is still mounted
        if (isMounted) {
          console.error('Error loading services:', err);
          setError(err.message || 'Failed to load services');
        }
      } finally {
        // Only update state if the component is still mounted
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadServices();
    
    // Cleanup function to set the flag when the component unmounts
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Set isLoading to false when authentication is complete
  useEffect(() => {
    if (!authLoading) {
      // If authentication is complete and user is not authenticated, 
      // we should stop loading since we'll redirect
      if (!isAuthenticated) {
        setIsLoading(false);
      }
    }
  }, [authLoading, isAuthenticated]);
  
  // Fallback to prevent infinite loading
  useEffect(() => {
    // Set a timeout to stop loading after 5 seconds regardless of other states
    // This prevents infinite loading if something goes wrong
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('Fallback timeout: Setting isLoading to false after timeout');
        setIsLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  // Show loading state
  if ((isLoading && authLoading) || (!authLoading && isAuthenticated && !user)) {
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
      <EnhancedHeader user={user} />

        {/* Welcome Section */}
        <section className='flex-grow container mx-auto px-4 pt-8'>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
              <p className="text-gray-600">Find and book the care services you need.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/services/browse">
                <Button className="px-6 py-2">Book a Service</Button>
              </Link>
            </div>
          </div>
        </section>

      <div className='-ml-15'>
        <InteractiveSlider/>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="mb-10">  
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <Link href="/dashboard/user/bookings" className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <span className="font-medium">My Bookings</span>
            </Link>
            
            <Link href="/services/browse" className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span className="font-medium">Book by Time</span>
            </Link>
            
            <Link href="/wishlist" className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
              <span className="font-medium">Wishlist</span>
            </Link>
            
            <Link href="/profile" className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <span className="font-medium">Profile</span>
            </Link>
          </div>
        </section>
        
        {/* New Feature Highlight */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow-md p-6 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="mb-6 md:mb-0 md:mr-8 flex-1">
                <h2 className="text-2xl font-bold mb-2">New: Book Services by Time Slot</h2>
                <p className="text-green-50 mb-4">
                  Now you can book services at specific times that work for you! Browse available time slots from our providers and schedule your care services with precision.
                </p>
                <Link href="/services/browse">
                  <div className="bg-white text-green-600 hover:bg-green-50 px-6 py-2 size-fit rounded-md text-center font-medium transition-colors">
                    Try It Now
                  </div>
                </Link>
              </div>
              <div className='h-50 w-50'>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateCalendar
                    value={date}
                    onChange={(newValue) => {
                      setDate(newValue);
                    }}
                    disablePast
                    views={['day']}
                    sx={{
                    transform: 'scale(0.6)',
                    transformOrigin: 'top left',
                    width: 'fit-content',
                    bgcolor: '#f5f5f5',        // background color
                    color: '#1a237e',          // base text color
                    borderRadius: 2,
                    p: 1,
                  }}
                  />
                </LocalizationProvider>
              </div>
            </div>
          </div>
        </section>
        
        {/* Service Categories Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Service Categories</h2>
          
          {isCategoriesLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No service categories available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link 
                  key={category._id} 
                  href={`/services/browse?category=${category._id}`}
                  className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-3">
                    <img 
                      src={category.iconUrl || '/images/placeholders/service-default.svg'} 
                      alt={category.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
        
        {/* Services Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Services</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setActiveTab('recommended')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'recommended' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Recommended
              </button>
              <button 
                onClick={() => setActiveTab('popular')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'popular' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Popular
              </button>
              <button 
                onClick={() => setActiveTab('nearby')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'nearby' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Nearby
              </button>
            </div>
          </div>
          
          {servicesLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No services available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <Link 
                  key={service._id} 
                  href={`/services/details/${service._id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={(service.images && service.images.length > 0) ? service.images[0] : '/images/placeholders/service-default.svg'} 
                      alt={service.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{service.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{service.description.substring(0, 60)}...</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">${service.price.amount}/{service.price.type}</span>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span className="text-sm text-gray-600 ml-1">4.8 (56)</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link href="/services/browse">
              <Button variant="outline" className="px-6 py-2">
                View All Services
              </Button>
            </Link>
          </div>
        </section>

        {/* Upcoming Bookings Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Bookings</h2>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <UserBookingsList limit={3} showViewAll={true} />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
