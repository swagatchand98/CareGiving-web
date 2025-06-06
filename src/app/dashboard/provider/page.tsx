'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProviderHeader from '@/components/layout/ProviderHeader';
import Footer from '@/components/layout/Footer';
import ProviderBookingsList from '@/components/services/ProviderBookingsList';
import api from '@/lib/axios';

export default function ProviderDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // State to track onboarding status
  const [onboardingRequired, setOnboardingRequired] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [onboardingSuccess, setOnboardingSuccess] = useState(false);
  const [documentsSuccess, setDocumentsSuccess] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check for success query parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      if (params.get('onboarding') === 'success') {
        setOnboardingSuccess(true);
        setShowSuccessMessage(true);
        setSuccessMessage('Your profile has been successfully completed! You can now receive service requests.');
        // Remove the query parameter from the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      if (params.get('documents') === 'success') {
        setDocumentsSuccess(true);
        setShowSuccessMessage(true);
        setSuccessMessage('Your documents have been successfully uploaded! They will be reviewed shortly.');
        // Remove the query parameter from the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);
  
  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  // Redirect if not authenticated or not a provider
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (user?.role !== 'provider') {
        router.push('/dashboard');
      } else {
        // Check if onboarding is required
        const checkOnboardingStatus = async () => {
          try {
            const response = await api.get('/providers/onboarding-status', {
              headers: {
                'Authorization': `Bearer ${user.token}`
              }
            });
            
            // Type assertion to handle the unknown type
            const responseData = response.data as { data: { onboardingStatus: { profileComplete: boolean } } };
            const { onboardingStatus } = responseData.data;
            
            // If profile is not complete, redirect to onboarding
            if (!onboardingStatus.profileComplete) {
              setOnboardingRequired(true);
            }
          } catch (error) {
            console.error('Error checking onboarding status:', error);
          } finally {
            setIsCheckingOnboarding(false);
          }
        };
        
        checkOnboardingStatus();
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Redirect to onboarding if required
  useEffect(() => {
    if (onboardingRequired && !isCheckingOnboarding) {
      router.push('/dashboard/provider/onboarding');
    }
  }, [onboardingRequired, isCheckingOnboarding, router]);

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingOnboarding(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading state
  if (isLoading) {
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
      <ProviderHeader user={user} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.firstName}!</p>
          </div>
        </div>
        
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>{successMessage}</span>
            </div>
            <button 
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-700 hover:text-green-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}
        
        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Bookings</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Upcoming</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rating</span>
                <div className="flex items-center">
                  <span className="font-semibold mr-1">0.0</span>
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Name</p>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Phone</p>
                <p className="font-medium">{user.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Service Type</p>
                <p className="font-medium">{user.serviceType || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Experience</p>
                <p className="font-medium">{user.experience || 'Not specified'}</p>
              </div>
              <div className="pt-2 space-y-2">
                <button 
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => router.push('/dashboard/provider/documents')}
                >
                  Upload Documents
                </button>
                <button 
                  className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition-colors"
                  onClick={() => router.push('/dashboard/provider/onboarding')}
                >
                  Update Profile
                </button>
              </div>
            </div>
          </div>
          
          {/* Availability Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Availability</h2>
            <p className="text-gray-600 mb-4">Set your availability by creating time slots for your services. This allows clients to book your services at specific times.</p>
            <Link href="/dashboard/provider/timeslots">
              <button 
                className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Manage Time Slots
              </button>
            </Link>
          </div>
        </div>
        
        {/* Service Management */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Services</h2>
            <a 
              href="/dashboard/provider/services"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Manage Services
            </a>
          </div>
          <p className="text-gray-600 mb-4">
            Create and manage your service offerings. Add detailed descriptions, pricing, and images to attract more clients.
          </p>
          <a 
            href="/dashboard/provider/services"
            className="block w-full bg-black text-white text-center py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Go to Services
          </a>
        </div>
        
        {/* Time Slot Management */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Availability</h2>
            <a 
              href="/dashboard/provider/timeslots"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Manage Time Slots
            </a>
          </div>
          <p className="text-gray-600 mb-4">
            Set your availability by creating time slots for your services. This allows clients to book your services at specific times.
          </p>
          <a 
            href="/dashboard/provider/timeslots"
            className="block w-full bg-black text-white text-center py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Manage Availability
          </a>
        </div>
        
        {/* Service Bookings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <ProviderBookingsList limit={5} showViewAll={true} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
