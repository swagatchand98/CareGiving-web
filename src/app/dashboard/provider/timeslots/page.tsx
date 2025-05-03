'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeader from '@/components/layout/AdminHeader';
import Footer from '@/components/layout/Footer';
import TimeSlotManager from '@/components/timeslots/TimeSlotManager';

export default function ProviderTimeSlotsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Redirect if not authenticated or not a provider
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (user?.role !== 'provider') {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);
  
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
      <AdminHeader user={user} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Time Slots</h1>
            <p className="text-gray-600">Create and manage availability for your services</p>
          </div>
        </div>
        
        <TimeSlotManager providerId={user.id} />
      </main>
      
      <Footer />
    </div>
  );
}
