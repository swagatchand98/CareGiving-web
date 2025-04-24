'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useBooking from '@/hooks/useBooking';
import { BookingResponse } from '@/services/bookingService';
import Button from '../common/Button';

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
  
  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);
  
  const loadBookingDetails = async () => {
    try {
      const response = await fetchBookingById(bookingId);
      setBooking(response);
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
    return user && booking && user.id === booking.booking.providerId._id;
  };
  
  // Check if user is the client for this booking
  const isClient = () => {
    return user && booking && user.id === booking.booking.userId._id;
  };
  
  if (isLoading || !booking) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
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
      
      {/* Payment Information */}
      {booking.transaction && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
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
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3 mt-8">
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
        
        {/* Client Actions */}
        {isClient() && (booking.booking.status === 'pending' || booking.booking.status === 'confirmed') && (
          <Button
            onClick={handleCancelBooking}
            disabled={isUpdatingStatus}
            variant="secondary"
            className="bg-red-600 text-white hover:bg-red-700 border-red-600"
          >
            {isUpdatingStatus ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        )}
        
        {/* Back Button */}
        <Button
          onClick={() => router.back()}
          variant="outline"
        >
          Back
        </Button>
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
