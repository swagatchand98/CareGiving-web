'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PaymentHistory from '@/components/payment/PaymentHistory';
import Button from '@/components/common/Button';

const PaymentHistoryPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/payment/history');
      return;
    }

    setIsLoading(false);
  }, [user, authLoading, router]);

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment History</h1>
        <Button
          onClick={() => router.push('/dashboard/user')}
          variant="outline"
        >
          Back to Dashboard
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <PaymentHistory />
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
