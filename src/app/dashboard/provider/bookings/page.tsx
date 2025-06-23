'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProviderHeader from '@/components/layout/ProviderHeader';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import ProviderBookingsList from '@/components/services/ProviderBookingsList';

const ProviderBookingsPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and is a provider
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/dashboard/provider/bookings');
      } else if (user?.role !== 'provider') {
        router.push('/dashboard');
      } else {
        setIsLoading(false);
      }
    }
  }, [user, authLoading, router, isAuthenticated]);

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is not authenticated, show a message or redirect
  if (!isAuthenticated) {
    return null; // We'll redirect in the useEffect hook
  }
  
  // Ensure user is not null before rendering
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ProviderHeader user={user} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Manage Bookings</h1>
              <p className="text-gray-600">View and manage all your service bookings</p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/provider')}
              variant="outline"
              className="px-6 py-2"
            >
              Back to Dashboard
            </Button>
          </div>
          
          {/* Bookings Filter Tabs */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <button className="px-4 py-2 bg-black text-white rounded-md">
                All Bookings
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-md">
                Pending
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-md">
                Confirmed
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-md">
                In Progress
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-md">
                Completed
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-md">
                Cancelled
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor="dateFilter" className="block text-sm font-medium mb-1">
                  Filter by Date
                </label>
                <input
                  type="date"
                  id="dateFilter"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="serviceFilter" className="block text-sm font-medium mb-1">
                  Filter by Service
                </label>
                <select
                  id="serviceFilter"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="">All Services</option>
                  {/* Service options would be dynamically populated */}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="sortBy" className="block text-sm font-medium mb-1">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="date-desc">Date (Newest First)</option>
                  <option value="date-asc">Date (Oldest First)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="price-asc">Price (Low to High)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" className="mr-2">
                Reset Filters
              </Button>
              <Button>
                Apply Filters
              </Button>
            </div>
          </div>
          
          {/* Bookings List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <ProviderBookingsList limit={10} showViewAll={false} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProviderBookingsPage;
