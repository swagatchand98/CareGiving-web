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
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);
  
  // Fetch service categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchServiceCategories();
        if (response && response.categories) {
          setCategories(response.categories);
        }
      } catch (err: any) {
        console.error('Error loading categories:', err);
        setError(err.message || 'Failed to load service categories');
      }
    };
    
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated, fetchServiceCategories]);
  
  // Fetch popular services
  useEffect(() => {
    const loadServices = async () => {
      try {
        // Get popular services (we'll just get the first 4 services for now)
        const response = await fetchServices(1, 4);
        if (response && response.services) {
          setServices(response.services);
        }
      } catch (err: any) {
        console.error('Error loading services:', err);
        setError(err.message || 'Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      loadServices();
    }
  }, [isAuthenticated, fetchServices]);

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <EnhancedHeader user={user} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
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
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <Link href="/bookings" className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
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
                  <Button className="bg-white text-green-600 hover:bg-green-50 px-6 py-2">
                    Try It Now
                  </Button>
                </Link>
              </div>
              <div className="flex-shrink-0">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="w-48 h-32 flex flex-col">
                    <div className="bg-green-100 text-green-800 text-center py-1 font-medium">April 2025</div>
                    <div className="grid grid-cols-7 gap-1 text-xs text-center">
                      <div className="py-1">Su</div>
                      <div className="py-1">Mo</div>
                      <div className="py-1">Tu</div>
                      <div className="py-1">We</div>
                      <div className="py-1">Th</div>
                      <div className="py-1">Fr</div>
                      <div className="py-1">Sa</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-xs text-center flex-1">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} className={`py-1 ${i === 15 ? 'bg-green-500 text-white rounded-full' : ''}`}>
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
        
        {/* Become a Provider CTA */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-md p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h2 className="text-2xl font-bold mb-2">Become a Caregiver</h2>
                <p className="text-blue-100 mb-4">
                  Join our network of professional caregivers and grow your business. 
                  We connect you with clients who need your specialized care services.
                </p>
                <Link href="/auth/provider-register">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2">
                    Register as Provider
                  </Button>
                </Link>
              </div>
              <div className="w-40 h-40 rounded-full overflow-hidden">
                <img 
                  src="/images/placeholders/caregiver.jpg.svg" 
                  alt="Become a Caregiver" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
