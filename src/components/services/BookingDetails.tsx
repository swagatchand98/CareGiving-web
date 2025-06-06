'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useBooking from '@/hooks/useBooking';
import useReview from '@/hooks/useReview';
import { BookingResponse } from '@/services/bookingService';
import Button from '../common/Button';
import ReviewForm from '../reviews/ReviewForm';
import ChatInterface from '../chat/ChatInterface';

interface BookingDetailsProps {
  bookingId: string;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ bookingId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { fetchBookingById, updateStatus, cancelUserBooking, isLoading, error } = useBooking();
  
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const { fetchServiceReviews } = useReview();
  
  // Use a ref to track if data has been fetched
  const dataFetchedRef = useRef(false);
  
  useEffect(() => {
    // Only fetch data once
    if (dataFetchedRef.current) return;
    
    const fetchData = async () => {
      await loadBookingDetails();
      
      // Check if a review exists for this booking when it loads
      if (bookingId) {
        await checkForExistingReview();
      }
      
      // Mark data as fetched
      dataFetchedRef.current = true;
    };
    
    fetchData();
  }, [bookingId]);
  
  // Scroll to chat section if URL has #chat hash
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#chat' && chatSectionRef.current) {
      // Wait for the component to fully render
      setTimeout(() => {
        chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [booking]);
  
  // Check if a review already exists for this booking
  const checkForExistingReview = async () => {
    try {
      // We'll use the service reviews endpoint to check if this booking has a review
      // This is a simplification - in a real app, you might have a dedicated endpoint
      if (booking?.booking?.serviceId?._id) {
        const serviceId = booking.booking.serviceId._id;
        const response = await fetchServiceReviews(serviceId);
        
        // Check if any of the reviews are for this booking
        const existingReview = response.reviews.find(
          review => (review as any).bookingId?._id === bookingId
        );
        
        setHasReview(!!existingReview);
      }
    } catch (err) {
      console.error('Error checking for existing review:', err);
    }
  };
  
  // Handle successful review submission
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setHasReview(true);
    // Optionally refresh booking details
    loadBookingDetails();
  };
  
  const loadBookingDetails = async () => {
    try {
      console.log('Fetching booking details for ID:', bookingId);
      console.log('Current user:', user);
      
      const response = await fetchBookingById(bookingId);
      console.log('Booking details response:', response);
      setBooking(response);
      
      // Log the IDs for comparison
      if (response && user) {
        console.log('User ID from context:', user.id);
        console.log('User firebaseUid:', user.firebaseUid);
        console.log('Provider ID from booking:', response.booking.providerId._id);
        console.log('Client ID from booking:', response.booking.userId._id);
      }
    } catch (err) {
      console.error('Error loading booking details:', err);
    }
  };
  
  const handleUpdateStatus = async (newStatus: 'confirmed' | 'in-progress' | 'completed') => {
    setIsUpdatingStatus(true);
    setUpdateError(null);
    
    try {
      await updateStatus(bookingId, newStatus);
      // Refresh booking details after status update
      loadBookingDetails();
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update booking status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  const handleCancelBooking = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setIsUpdatingStatus(true);
      setUpdateError(null);
      
      try {
        await cancelUserBooking(bookingId);
        // Refresh booking details after cancellation
        loadBookingDetails();
      } catch (err: any) {
        setUpdateError(err.message || 'Failed to cancel booking');
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get next status options based on current status
  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return [{ value: 'confirmed', label: 'Confirm' }];
      case 'confirmed':
        return [{ value: 'in-progress', label: 'Start Service' }];
      case 'in-progress':
        return [{ value: 'completed', label: 'Complete' }];
      default:
        return [];
    }
  };
  
  // Check if user is the provider for this booking
  const isProvider = () => {
    if (!user || !booking) return false;
    
    // Get all possible user IDs
    const userIds = [
      user.id,
      user.firebaseUid,
      user.id?.toString(),
      user.firebaseUid?.toString()
    ].filter(Boolean); // Filter out undefined/null values
    
    // Get all possible provider IDs
    const providerIds = [
      booking.booking.providerId._id,
      booking.booking.providerId._id?.toString()
    ].filter(Boolean);
    
    console.log('Provider check - User IDs:', userIds);
    console.log('Provider check - Provider IDs:', providerIds);
    
    // Check if any user ID matches any provider ID
    return userIds.some(uid => providerIds.includes(uid));
  };
  
  // Check if user is the client for this booking
  const isClient = () => {
    if (!user || !booking) return false;
    
    // Get all possible user IDs
    const userIds = [
      user.id,
      user.firebaseUid,
      user.id?.toString(),
      user.firebaseUid?.toString()
    ].filter(Boolean); // Filter out undefined/null values
    
    // Get all possible client IDs
    const clientIds = [
      booking.booking.userId._id,
      booking.booking.userId._id?.toString()
    ].filter(Boolean);
    
    console.log('Client check - User IDs:', userIds);
    console.log('Client check - Client IDs:', clientIds);
    
    // Check if any user ID matches any client ID
    return userIds.some(uid => clientIds.includes(uid));
  };
  
  if (isLoading || !booking) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    // Check if the error is a 403 Forbidden error
    if (error.includes('not authorized')) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          <h3 className="font-semibold mb-2">Access Denied</h3>
          <p>You are not authorized to view this booking. This could be because:</p>
          <ul className="list-disc ml-5 mt-2">
            <li>You are not the client who made this booking</li>
            <li>You are not the provider for this service</li>
            <li>There might be an issue with your account permissions</li>
          </ul>
          <p className="mt-2">Please contact support if you believe this is an error.</p>
        </div>
      );
    }
    
    // For other errors
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        <h3 className="font-semibold mb-2">Error Loading Booking</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-semibold">Booking Details</h2>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(booking.booking.status)}`}>
          {booking.booking.status.charAt(0).toUpperCase() + booking.booking.status.slice(1)}
        </span>
      </div>
      
      {/* Debug Information - Only visible in development */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-6 p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Debug Information</h3>
          <div className="text-xs font-mono overflow-auto">
            <p><strong>User ID:</strong> {user?.id}</p>
            <p><strong>User Firebase UID:</strong> {user?.firebaseUid}</p>
            <p><strong>User Role:</strong> {user?.role}</p>
            <p><strong>Booking User ID:</strong> {booking.booking.userId._id}</p>
            <p><strong>Booking Provider ID:</strong> {booking.booking.providerId._id}</p>
            <p><strong>Is Provider:</strong> {isProvider() ? 'Yes' : 'No'}</p>
            <p><strong>Is Client:</strong> {isClient() ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}
      
      {/* Service Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Service Information</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Service:</p>
              <p className="font-medium">{booking.booking.serviceId.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Price:</p>
              <p className="font-medium">
                ${booking.booking.serviceId.price.amount.toFixed(2)} 
                {booking.booking.serviceId.price.type === 'hourly' ? '/hour' : ' (fixed)'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date & Time:</p>
              <p className="font-medium">{formatDate(booking.booking.dateTime)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration:</p>
              <p className="font-medium">{booking.booking.duration} minutes</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Total Price:</p>
              <p className="font-medium text-lg">${booking.booking.totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Provider Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Provider Information</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name:</p>
              <p className="font-medium">
                {booking.booking.providerId.firstName} {booking.booking.providerId.lastName}
              </p>
            </div>
            {booking.booking.providerId.email && (
              <div>
                <p className="text-sm text-gray-600">Email:</p>
                <p className="font-medium">{booking.booking.providerId.email}</p>
              </div>
            )}
            {booking.booking.providerId.phoneNumber && (
              <div>
                <p className="text-sm text-gray-600">Phone:</p>
                <p className="font-medium">{booking.booking.providerId.phoneNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Client Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Client Information</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name:</p>
              <p className="font-medium">
                {booking.booking.userId.firstName} {booking.booking.userId.lastName}
              </p>
            </div>
            {booking.booking.userId.email && (
              <div>
                <p className="text-sm text-gray-600">Email:</p>
                <p className="font-medium">{booking.booking.userId.email}</p>
              </div>
            )}
            {booking.booking.userId.phoneNumber && (
              <div>
                <p className="text-sm text-gray-600">Phone:</p>
                <p className="font-medium">{booking.booking.userId.phoneNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Service Address */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Service Address</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="font-medium">
            {booking.booking.address.street}, {booking.booking.address.city}, {booking.booking.address.state} {booking.booking.address.zipCode}
            {booking.booking.address.country && `, ${booking.booking.address.country}`}
          </p>
        </div>
      </div>
      
      {/* Special Instructions */}
      {booking.booking.specialInstructions && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Special Instructions</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p>{booking.booking.specialInstructions}</p>
          </div>
        </div>
      )}
      
      {/* Chat Section */}
      <div className="mb-6" ref={chatSectionRef} id="chat">
        
        {/* Show chat interface for confirmed or in-progress bookings */}
        {(booking.booking.status === 'in-progress' || booking.booking.status === 'confirmed') ? (
          <div>
            <ChatInterface 
              bookingId={bookingId} 
              isActive={true} 
            />
          </div>
        ) : booking.booking.status === 'cancelled' ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
            <p>Chat is not available for cancelled bookings.</p>
          </div>
        ) : booking.booking.status === 'completed' ? (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <p className="mb-4">This booking is completed, but you can still view your chat history.</p>
            <Button
              onClick={() => router.push(`/chat/${bookingId}`)}
              variant="outline"
            >
              View Chat History
            </Button>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="mb-4">Chat will be available once your booking is confirmed.</p>
            <Button
              onClick={() => router.push(`/chat/${bookingId}`)}
              variant="primary"
              disabled={booking.booking.status === 'pending'}
            >
              {booking.booking.status === 'pending' ? 'Chat Not Available Yet' : 'Start Chat'}
            </Button>
          </div>
        )}
      </div>
      
      {/* Payment Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
        {booking.transaction && booking.transaction.status !== 'pending' ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Payment Status:</p>
                <p className="font-medium capitalize">{booking.transaction.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method:</p>
                <p className="font-medium capitalize">{booking.transaction.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount:</p>
                <p className="font-medium">${booking.transaction.amount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            {isClient() && booking.booking.status === 'pending' ? (
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="font-medium text-yellow-800 mb-1">Payment Required</p>
                  <p className="text-sm text-yellow-700">
                    Your booking requires payment to be confirmed.
                  </p>
                </div>
                <Button
                  onClick={() => router.push(`/payment/${bookingId}`)}
                  variant="primary"
                >
                  Pay Now (${booking.booking.totalPrice.toFixed(2)})
                </Button>
              </div>
            ) : (
              <p className="text-yellow-700">
                {isClient() 
                  ? "Payment processing. This may take a moment to update."
                  : "Awaiting client payment."}
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Review Section - Only show for completed bookings where the user is the client */}
      {isClient() && booking.booking.status === 'completed' && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Rate Your Experience</h3>
          
          {hasReview ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              <p>Thank you for your review! Your feedback helps other users find great caregivers.</p>
            </div>
          ) : showReviewForm ? (
            <ReviewForm 
              bookingId={bookingId} 
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowReviewForm(false)}
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="mb-4">
                How was your experience with {booking.booking.providerId.firstName}? Your feedback helps other users find great caregivers.
              </p>
              <Button
                onClick={() => setShowReviewForm(true)}
                variant="primary"
              >
                Write a Review
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="mt-8">
        {/* Client Cancel Button - Prominently displayed at the top of actions */}
        {isClient() && (booking.booking.status === 'pending' || booking.booking.status === 'confirmed') && (
          <div className="mb-4 flex justify-between items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <div>
              <h3 className="font-semibold text-red-700">Need to cancel?</h3>
              <p className="text-sm text-red-600">
                You can cancel this booking without penalty until the service begins.
              </p>
            </div>
            <Button
              onClick={handleCancelBooking}
              disabled={isUpdatingStatus}
              variant="secondary"
              className="bg-red-600 text-white hover:bg-red-700 border-red-600"
            >
              {isUpdatingStatus ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </div>
        )}
        
        {/* Other Action Buttons */}
        <div className="flex flex-wrap justify-end gap-3">
          {/* Provider Actions */}
          {isProvider() && getNextStatusOptions(booking.booking.status).map((option) => (
            <Button
              key={option.value}
              onClick={() => handleUpdateStatus(option.value as any)}
              disabled={isUpdatingStatus}
              variant="primary"
            >
              {isUpdatingStatus ? 'Updating...' : option.label}
            </Button>
          ))}
          
          {/* Back Button */}
          <Button
            onClick={() => router.back()}
            variant="outline"
          >
            Back
          </Button>
        </div>
      </div>
      
      {/* Update Error */}
      {updateError && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {updateError}
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
