'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  TimeSlot,
  GroupedTimeSlots,
  TimeSlotCreateData,
  TimeSlotUpdateData,
  BookTimeSlotData,
  getServiceTimeSlots,
  getProviderTimeSlots,
  createTimeSlots,
  updateTimeSlot,
  deleteTimeSlot,
  bookTimeSlot
} from '@/services/timeSlotService';

export const useTimeSlots = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get available time slots for a service
  const fetchServiceTimeSlots = async (
    serviceId: string,
    params?: {
      date?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getServiceTimeSlots(serviceId, params);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch time slots');
      setIsLoading(false);
      throw err;
    }
  };
  
  // Get provider's time slots
  const fetchProviderTimeSlots = async (
    params?: {
      serviceId?: string;
      date?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is a provider
      if (!user || user.role !== 'provider') {
        throw new Error('Only providers can access their time slots');
      }
      
      const response = await getProviderTimeSlots(params);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch provider time slots');
      setIsLoading(false);
      throw err;
    }
  };
  
  // Create time slots
  const createNewTimeSlots = async (data: TimeSlotCreateData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is a provider
      if (!user || user.role !== 'provider') {
        throw new Error('Only providers can create time slots');
      }
      
      const response = await createTimeSlots(data);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create time slots');
      setIsLoading(false);
      throw err;
    }
  };
  
  // Update a time slot
  const updateExistingTimeSlot = async (
    timeSlotId: string,
    data: TimeSlotUpdateData
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is a provider
      if (!user || user.role !== 'provider') {
        throw new Error('Only providers can update time slots');
      }
      
      const response = await updateTimeSlot(timeSlotId, data);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update time slot');
      setIsLoading(false);
      throw err;
    }
  };
  
  // Delete a time slot
  const deleteExistingTimeSlot = async (timeSlotId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is a provider
      if (!user || user.role !== 'provider') {
        throw new Error('Only providers can delete time slots');
      }
      
      await deleteTimeSlot(timeSlotId);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete time slot');
      setIsLoading(false);
      throw err;
    }
  };
  
  // Book a time slot
  const bookAvailableTimeSlot = async (
    timeSlotId: string,
    data: BookTimeSlotData
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      if (!user) {
        throw new Error('You must be logged in to book a time slot');
      }
      
      const response = await bookTimeSlot(timeSlotId, data);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to book time slot');
      setIsLoading(false);
      throw err;
    }
  };
  
  return {
    isLoading,
    error,
    fetchServiceTimeSlots,
    fetchProviderTimeSlots,
    createNewTimeSlots,
    updateExistingTimeSlot,
    deleteExistingTimeSlot,
    bookAvailableTimeSlot
  };
};

export default useTimeSlots;
