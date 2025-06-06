'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BookingDetails from '@/components/services/BookingDetails';
import EnhancedHeader from '@/components/layout/EnhancedHeader';
import Footer from '@/components/layout/Footer';

interface BookingDetailsClientProps {
  bookingId: string;
}

export default function BookingDetailsClient({ bookingId }: BookingDetailsClientProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // We're using client-side navigation, so we need to handle this in useEffect
    // This is handled in the AuthContext
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Please log in to view booking details.</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <EnhancedHeader user={user!} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BookingDetails bookingId={bookingId} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
