'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedHeader from '@/components/layout/EnhancedHeader';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import PaymentHistory from '@/components/payment/PaymentHistory';

const UserPaymentHistoryPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard/user/payment-history');
      return;
    }

    setIsLoading(false);
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
      <EnhancedHeader user={user} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Payment History</h1>
              <p className="text-gray-600">View all your payment transactions</p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/user')}
              variant="outline"
              className="px-6 py-2"
            >
              Back to Dashboard
            </Button>
          </div>
          
          {/* Payment History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <PaymentHistory />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserPaymentHistoryPage;
