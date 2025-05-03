'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookingFormData,
  Booking,
  BookingResponse,
  BookingsResponse,
  createBooking,
  getUserBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
} from '@/services/bookingService';

export const useBooking = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create a new booking
  const createNewBooking = async (bookingData: BookingFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await createBooking(bookingData);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
      setIsLoading(false);
      throw err;
    }
  };
  
  // Get bookings for the current user
  const fetchUserBookings = async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getUserBookings(page, limit, filters);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
      setIsLoading(false);
      throw err;
    }
  };
  
  // Get bookings for the current provider
  const fetchProviderBookings = async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is a provider
      if (!user || user.role !== 'provider') {
        throw new Error('Only providers can access this feature');
      }
      
      const response = await getProviderBookings(page, limit, filters);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch provider bookings');
      setIsLoading(false);
      throw err;
    }
  };
  
  // Get booking details by ID
  const fetchBookingById = async (bookingId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getBookingById(bookingId);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch booking details');
      setIsLoading(false);
      throw err;
    }
  };
  
  // Update booking status
  const updateStatus = async (
    bookingId: string,
    status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await updateBookingStatus(bookingId, status);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update booking status');
      setIsLoading(false);
      throw err;
    }
  };
  
  // Cancel a booking
  const cancelUserBooking = async (bookingId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await cancelBooking(bookingId);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
      setIsLoading(false);
      throw err;
    }
  };
  
  return {
    isLoading,
    error,
    createNewBooking,
    fetchUserBookings,
    fetchProviderBookings,
    fetchBookingById,
    updateStatus,
    cancelUserBooking
  };
};

export default useBooking;
