'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import useBooking from '@/hooks/useBooking';
import ChatInterface from '@/components/chat/ChatInterface';
import Button from '@/components/common/Button';

interface ChatClientProps {
  bookingId: string;
}

const ChatClient: React.FC<ChatClientProps> = ({ bookingId }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { fetchBookingById, isLoading: bookingLoading, error: bookingError } = useBooking();
  
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track if data has been fetched
  const dataFetchedRef = useRef(false);
  
  // Fetch booking details when component mounts
  useEffect(() => {
    // Only fetch data once
    if (dataFetchedRef.current) return;
    
    if (isAuthenticated && bookingId) {
      loadBookingDetails();
      // Mark data as fetched
      dataFetchedRef.current = true;
    }
  }, [isAuthenticated, bookingId]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined' && bookingId) {
      router.push(`/auth/login?redirect=/chat/${bookingId}`);
    }
  }, [isAuthenticated, router, bookingId]);
  
  const loadBookingDetails = async () => {
    if (!bookingId) {
      setError('Invalid booking ID');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchBookingById(bookingId);
      setBooking(response);
    } catch (err: any) {
      console.error('Error loading booking details:', err);
      setError(err.message || 'Failed to load booking details');
    } finally {
      setIsLoading(false);
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
    
    // Check if any user ID matches any client ID
    return userIds.some(uid => clientIds.includes(uid));
  };
  
  // Check if chat is active based on booking status
  const isChatActive = () => {
    if (!booking) return false;
    return booking.booking.status === 'confirmed' || booking.booking.status === 'in-progress';
  };
  
  // Show loading state while checking authentication or loading booking
  if (!isAuthenticated || isLoading || !bookingId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error || bookingError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
            <p className="text-red-600">{error || bookingError}</p>
            <Button 
              onClick={() => router.back()}
              variant="outline"
              className="mt-4"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show unauthorized state if user is neither client nor provider
  if (booking && !isClient() && !isProvider()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            <h3 className="font-semibold mb-2">Access Denied</h3>
            <p>You are not authorized to view this chat. This could be because:</p>
            <ul className="list-disc ml-5 mt-2">
              <li>You are not the client who made this booking</li>
              <li>You are not the provider for this service</li>
              <li>There might be an issue with your account permissions</li>
            </ul>
            <div className="mt-4">
              <Button 
                onClick={() => router.push('/chats')}
                variant="outline"
              >
                View All Chats
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chat with {isClient() ? booking.booking.providerId.firstName : booking.booking.userId.firstName}
            </h1>
            <p className="text-gray-600">
              Service: {booking.booking.serviceId.title}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => router.push(`/booking/${bookingId}`)}
              variant="outline"
              className="text-sm"
            >
              View Booking
            </Button>
            <Button
              onClick={() => router.push('/chats')}
              variant="outline"
              className="text-sm"
            >
              All Chats
            </Button>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            booking.booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
            booking.booking.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
            booking.booking.status === 'completed' ? 'bg-green-100 text-green-800' :
            booking.booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            Booking Status: {booking.booking.status.charAt(0).toUpperCase() + booking.booking.status.slice(1)}
          </span>
        </div>
        
        {/* Chat Interface */}
        {booking.booking.status === 'cancelled' ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
            <p>Chat is not available for cancelled bookings.</p>
          </div>
        ) : (
          bookingId && (
            <ChatInterface 
              bookingId={bookingId} 
              isActive={isChatActive()} 
            />
          )
        )}
        
        {/* Booking Info */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Booking Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Date & Time:</p>
              <p className="font-medium">
                {new Date(booking.booking.dateTime).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration:</p>
              <p className="font-medium">{booking.booking.duration} minutes</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {isClient() ? 'Provider:' : 'Client:'}
              </p>
              <p className="font-medium">
                {isClient() 
                  ? `${booking.booking.providerId.firstName} ${booking.booking.providerId.lastName}`
                  : `${booking.booking.userId.firstName} ${booking.booking.userId.lastName}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatClient;
