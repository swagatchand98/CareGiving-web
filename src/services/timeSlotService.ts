import api from '@/lib/axios';

// Types
export interface TimeSlot {
  _id: string;
  providerId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupedTimeSlots {
  [date: string]: TimeSlot[];
}

export interface TimeSlotResponse {
  timeSlot: TimeSlot;
}

export interface TimeSlotCreateData {
  serviceId: string;
  slots: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface TimeSlotUpdateData {
  startTime?: string;
  endTime?: string;
}

export interface BookTimeSlotData {
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  specialInstructions?: string;
}

// Get available time slots for a service
export const getServiceTimeSlots = async (
  serviceId: string,
  params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<{ groupedSlots: GroupedTimeSlots }> => {
  try {
    let url = `/timeslots/service/${serviceId}`;
    
    // Add query parameters if provided
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.date) queryParams.append('date', params.date);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }
    
    const response = await api.get(url);
    return (response.data as any).data;
  } catch (error: any) {
    console.error('Get service time slots error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get time slots';
  }
};

// Get provider's time slots
export const getProviderTimeSlots = async (
  params?: {
    serviceId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<{ groupedSlots: GroupedTimeSlots }> => {
  try {
    let url = '/timeslots/provider';
    
    // Add query parameters if provided
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.serviceId) queryParams.append('serviceId', params.serviceId);
      if (params.date) queryParams.append('date', params.date);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }
    
    const response = await api.get(url);
    return (response.data as any).data;
  } catch (error: any) {
    console.error('Get provider time slots error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get provider time slots';
  }
};

// Create time slots
export const createTimeSlots = async (
  data: TimeSlotCreateData
): Promise<{ timeSlots: TimeSlot[] }> => {
  try {
    const response = await api.post('/timeslots', data);
    return (response.data as any).data;
  } catch (error: any) {
    console.error('Create time slots error:', error);
    throw error.response?.data?.message || error.message || 'Failed to create time slots';
  }
};

// Update a time slot
export const updateTimeSlot = async (
  timeSlotId: string,
  data: TimeSlotUpdateData
): Promise<TimeSlotResponse> => {
  try {
    const response = await api.patch(`/timeslots/${timeSlotId}`, data);
    return (response.data as any).data;
  } catch (error: any) {
    console.error('Update time slot error:', error);
    throw error.response?.data?.message || error.message || 'Failed to update time slot';
  }
};

// Delete a time slot
export const deleteTimeSlot = async (timeSlotId: string): Promise<void> => {
  try {
    await api.delete(`/timeslots/${timeSlotId}`);
  } catch (error: any) {
    console.error('Delete time slot error:', error);
    throw error.response?.data?.message || error.message || 'Failed to delete time slot';
  }
};

// Book a time slot
export const bookTimeSlot = async (
  timeSlotId: string,
  data: BookTimeSlotData
): Promise<{ booking: any; timeSlot: TimeSlot }> => {
  try {
    const response = await api.post(`/timeslots/${timeSlotId}/book`, data);
    return (response.data as any).data;
  } catch (error: any) {
    console.error('Book time slot error:', error);
    throw error.response?.data?.message || error.message || 'Failed to book time slot';
  }
};
