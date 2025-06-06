'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PaymentForm from '@/components/payment/PaymentForm';
import PaymentConfirmation from '@/components/payment/PaymentConfirmation';
import { getBookingPaymentDetails } from '@/services/paymentService';
import { useBooking } from '@/hooks/useBooking';
import EnhancedHeader from '@/components/layout/EnhancedHeader';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';

interface PaymentClientProps {
  bookingId: string;
}

const PaymentClient: React.FC<PaymentClientProps> = ({ bookingId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { fetchBookingById } = useBooking();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Use a ref to track if data has been fetched
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch data once
    if (dataFetchedRef.current) return;
    
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError('Invalid booking ID');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Use Promise.all to make parallel requests
        const [paymentDetails, booking] = await Promise.all([
          getBookingPaymentDetails(bookingId),
          fetchBookingById(bookingId)
        ]);
        
        // Process payment details
        if (paymentDetails.payments && paymentDetails.payments.length > 0) {
          const completedPayment = paymentDetails.payments.find(
            (payment: any) => payment.status === 'completed' && payment.type === 'booking'
          );
          
          if (completedPayment) {
            setPaymentComplete(true);
          }
        }
        
        // Set booking details
        setBookingDetails(booking);
        
        // Mark data as fetched
        dataFetchedRef.current = true;
        
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching booking details:', err);
        setError(err.message || 'Failed to load booking details');
        setIsLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, fetchBookingById]);

  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
  };

  const handlePaymentError = (error: any) => {
    setError(error.message || 'Payment processing failed');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {user ? <EnhancedHeader user={user} /> : <PublicHeader />}
        
        <main className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </main>
        
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {user ? <EnhancedHeader user={user} /> : <PublicHeader />}
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button 
              onClick={() => router.back()} 
              className="mt-2 text-blue-500 underline"
            >
              Go Back
            </button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {user ? <EnhancedHeader user={user} /> : <PublicHeader />}
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>Booking not found or you don't have permission to access it.</p>
            <button 
              onClick={() => router.push('/dashboard/user')} 
              className="mt-2 text-blue-500 underline"
            >
              Go to Dashboard
            </button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {user ? <EnhancedHeader user={user} /> : <PublicHeader />}
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-black"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back
            </button>
          </div>
          
          <h1 className="text-3xl font-bold mb-6">Complete Your Payment</h1>
          
          {paymentComplete ? (
            <PaymentConfirmation
              bookingId={bookingId}
              amount={bookingDetails.totalPrice}
              serviceName={bookingDetails.service?.title || 'Service'}
              providerName={`${bookingDetails.provider?.firstName || ''} ${bookingDetails.provider?.lastName || ''}`}
              dateTime={new Date(bookingDetails.dateTime).toLocaleString()}
            />
          ) : (
            <div>
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                <h2 className="text-xl font-semibold mb-2">Booking Summary</h2>
                <div>
                  <p className="mb-1"><span className="font-medium">Service:</span> {bookingDetails.service?.title || 'Service'}</p>
                  <p className="mb-1"><span className="font-medium">Provider:</span> {`${bookingDetails.provider?.firstName || ''} ${bookingDetails.provider?.lastName || ''}`}</p>
                  <p className="mb-1"><span className="font-medium">Date & Time:</span> {new Date(bookingDetails.dateTime).toLocaleString()}</p>
                  <p className="mb-1"><span className="font-medium">Duration:</span> {bookingDetails.duration} minutes</p>
                  <p className="mb-1"><span className="font-medium">Total Price:</span> ${(bookingDetails.totalPrice / 100).toFixed(2)}</p>
                </div>
              </div>
              
              <PaymentForm
                bookingId={bookingId}
                amount={bookingDetails.totalPrice}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentClient;
