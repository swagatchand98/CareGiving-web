'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedHeader from '@/components/layout/EnhancedHeader';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import { ServiceCategory, Service } from '@/types/service';
import { Booking } from '@/types/booking';

// Mock data - in a real app, this would come from an API
const mockCategories: ServiceCategory[] = [
  {
    id: '1',
    name: 'Elder Care',
    description: 'Professional care services for seniors',
    icon: '/icons/elder-care.svg',
    imageUrl: '/images/placeholders/elder-care.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Child Care',
    description: 'Reliable childcare services',
    icon: '/icons/child-care.svg',
    imageUrl: '/images/placeholders/child-care.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Special Needs',
    description: 'Specialized care for individuals with special needs',
    icon: '/icons/special-needs.svg',
    imageUrl: '/images/placeholders/special-needs.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Home Healthcare',
    description: 'Medical care services at home',
    icon: '/icons/home-healthcare.svg',
    imageUrl: '/images/placeholders/elder-care.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Respite Care',
    description: 'Temporary relief for primary caregivers',
    icon: '/icons/respite-care.svg',
    imageUrl: '/images/placeholders/caregiver.jpg.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Companion Care',
    description: 'Companionship and emotional support',
    icon: '/icons/companion-care.svg',
    imageUrl: '/images/placeholders/caregiver-baby.jpg.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockPopularServices: Service[] = [
  {
    id: '1',
    categoryId: '1',
    name: 'Senior Home Care',
    description: 'Comprehensive care for seniors in the comfort of their own home',
    shortDescription: 'In-home care for seniors',
    imageUrl: '/images/placeholders/elder-care.svg',
    duration: 120,
    basePrice: 50,
    isPopular: true,
    isActive: true,
    tags: ['senior', 'home care', 'elder'],
    requirements: ['Medical history', 'Emergency contact'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    categoryId: '2',
    name: 'Babysitting',
    description: 'Professional babysitting services for children of all ages',
    shortDescription: 'Professional babysitting',
    imageUrl: '/images/placeholders/child-care.svg',
    duration: 180,
    basePrice: 40,
    isPopular: true,
    isActive: true,
    tags: ['children', 'babysitting', 'childcare'],
    requirements: ['Child information', 'Emergency contact'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    categoryId: '3',
    name: 'Special Needs Support',
    description: 'Specialized care for individuals with special needs or disabilities',
    shortDescription: 'Support for special needs',
    imageUrl: '/images/placeholders/special-needs.svg',
    duration: 240,
    basePrice: 60,
    isPopular: true,
    isActive: true,
    tags: ['special needs', 'disability', 'support'],
    requirements: ['Medical history', 'Special requirements', 'Emergency contact'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    categoryId: '4',
    name: 'Nursing Care',
    description: 'Professional nursing services at home',
    shortDescription: 'In-home nursing care',
    imageUrl: '/images/placeholders/elder-care.svg',
    duration: 120,
    basePrice: 70,
    isPopular: true,
    isActive: true,
    tags: ['nursing', 'medical', 'healthcare'],
    requirements: ['Medical history', 'Prescription details', 'Emergency contact'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockUpcomingBookings: Booking[] = [
  {
    id: '1',
    userId: 'user1',
    serviceId: '1',
    providerId: 'provider1',
    status: 'confirmed',
    scheduledDate: '2025-04-15',
    scheduledTime: '10:00',
    duration: 120,
    totalPrice: 100,
    paymentStatus: 'completed',
    paymentMethod: 'credit_card',
    addressId: 'address1',
    selectedOptions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    service: mockPopularServices[0],
    provider: {
      id: 'provider1',
      serviceId: '1',
      providerId: 'provider1',
      isAvailable: true,
      rating: 4.8,
      reviewCount: 56,
      provider: {
        id: 'provider1',
        name: 'Jane Smith',
        avatar: '/images/placeholders/caregiver.jpg.svg',
        bio: 'Experienced caregiver with 10+ years of experience',
        experience: 10
      }
    }
  }
];

export default function UserDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recommended');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

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
            
            <Link href="/wishlist" className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
              <span className="font-medium">Wishlist</span>
            </Link>
            
            <Link href="/messages" className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </div>
              <span className="font-medium">Messages</span>
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
        
        {/* Upcoming Bookings Section */}
        {mockUpcomingBookings.length > 0 && (
          <section className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Upcoming Bookings</h2>
              <Link href="/bookings" className="text-blue-600 hover:text-blue-800 font-medium">
                View All
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              {mockUpcomingBookings.map((booking) => (
                <div key={booking.id} className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex items-start">
                    <div className="w-16 h-16 rounded-lg overflow-hidden mr-4">
                      <img 
                        src={booking.service?.imageUrl || '/images/placeholders/service-default.svg'} 
                        alt={booking.service?.name || 'Service'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{booking.service?.name}</h3>
                      <p className="text-gray-600 mb-1">
                        {new Date(booking.scheduledDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })} at {booking.scheduledTime}
                      </p>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                          <img 
                            src={booking.provider?.provider?.avatar || '/images/placeholders/avatar-default.svg'} 
                            alt={booking.provider?.provider?.name || 'Provider'} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm text-gray-600">{booking.provider?.provider?.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-3">
                    <Link href={`/bookings/${booking.id}`}>
                      <Button variant="secondary" className="px-4 py-2 text-sm w-full md:w-auto">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/messages?bookingId=${booking.id}`}>
                      <Button variant="outline" className="px-4 py-2 text-sm w-full md:w-auto">
                        Message
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Service Categories Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Service Categories</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mockCategories.map((category) => (
              <Link 
                key={category.id} 
                href={`/services/browse?category=${category.id}`}
                className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3">
                  <img 
                    src={category.imageUrl || category.icon} 
                    alt={category.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockPopularServices.map((service) => (
              <Link 
                key={service.id} 
                href={`/services/details/${service.id}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-40 overflow-hidden">
                  <img 
                    src={service.imageUrl || '/images/placeholders/service-default.svg'} 
                    alt={service.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{service.shortDescription}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">${service.basePrice}/hr</span>
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
