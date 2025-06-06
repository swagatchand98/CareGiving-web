'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../common/Button';

interface PaymentConfirmationProps {
  bookingId: string;
  amount: number;
  serviceName: string;
  providerName: string;
  dateTime: string;
  onClose?: () => void;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  bookingId,
  amount,
  serviceName,
  providerName,
  dateTime,
  onClose
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Simulate loading
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setShowConfetti(true);
    }, 1500);

    // Auto-redirect to booking details after 5 seconds
    const redirectTimer = setTimeout(() => {
      if (!isLoading) {
        handleViewBooking();
      }
    }, 6500); // 1.5s loading + 5s viewing confirmation

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(redirectTimer);
    };
  }, [isLoading]);

  const handleViewBooking = () => {
    router.push(`/booking/${bookingId}`);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/dashboard/user');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      ) : (
        <div className="text-center">
          {showConfetti && (
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {/* This would be replaced with an actual confetti animation in a real implementation */}
              <div className="confetti-animation"></div>
            </div>
          )}
          
          <div className="mb-4 text-green-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 mx-auto" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          <h2 className="text-2xl font-semibold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your payment. Your booking has been confirmed.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-lg mb-2">Booking Details</h3>
            <div className="text-left">
              <p className="mb-1"><span className="font-medium">Service:</span> {serviceName}</p>
              <p className="mb-1"><span className="font-medium">Provider:</span> {providerName}</p>
              <p className="mb-1"><span className="font-medium">Date & Time:</span> {dateTime}</p>
              <p className="mb-1"><span className="font-medium">Amount Paid:</span> ${(amount / 100).toFixed(2)}</p>
              <p className="mb-1"><span className="font-medium">Booking ID:</span> {bookingId}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleViewBooking}
              className="flex-1"
            >
              View Booking
            </Button>
            <Button 
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentConfirmation;
