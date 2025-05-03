import api from '@/lib/axios';

// Types
export interface BookingFormData {
  serviceId: string;
  dateTime: string;
  duration: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  specialInstructions?: string;
}

export interface Booking {
  _id: string;
  serviceId: {
    _id: string;
    title: string;
    description: string;
    price: {
      amount: number;
      type: 'fixed' | 'hourly';
    };
    images?: string[];
  };
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    profilePicture?: string;
    phoneNumber?: string;
  };
  providerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    profilePicture?: string;
    phoneNumber?: string;
  };
  dateTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  specialInstructions?: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  bookingId: string;
  userId: string;
  providerId: string;
  amount: number;
  platformCommission: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface BookingResponse {
  booking: Booking;
  transaction?: Transaction;
}

export interface BookingsResponse {
  bookings: Booking[];
  results: number;
  total: number;
  page: number;
  totalPages: number;
}

// Create a new booking
export const createBooking = async (bookingData: BookingFormData): Promise<BookingResponse> => {
  try {
    const response = await api.post('/bookings', bookingData);
    return (response.data as any).data as BookingResponse;
  } catch (error: any) {
    console.error('Create booking error:', error);
    throw error.response?.data?.message || error.message || 'Failed to create booking';
  }
};

// Get all bookings for the logged-in user
export const getUserBookings = async (
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<BookingsResponse> => {
  try {
    let url = `/bookings/user?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;
    }
    
    const response = await api.get(url);
    return (response.data as any).data as BookingsResponse;
  } catch (error: any) {
    console.error('Get user bookings error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get bookings';
  }
};

// Get all bookings for the logged-in provider
export const getProviderBookings = async (
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<BookingsResponse> => {
  try {
    let url = `/bookings/provider?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;
    }
    
    const response = await api.get(url);
    return (response.data as any).data as BookingsResponse;
  } catch (error: any) {
    console.error('Get provider bookings error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get bookings';
  }
};

// Get booking by ID
export const getBookingById = async (bookingId: string): Promise<BookingResponse> => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return (response.data as any).data as BookingResponse;
  } catch (error: any) {
    console.error('Get booking error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get booking details';
  }
};

// Update booking status
export const updateBookingStatus = async (
  bookingId: string,
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
): Promise<BookingResponse> => {
  try {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status });
    return (response.data as any).data as BookingResponse;
  } catch (error: any) {
    console.error('Update booking status error:', error);
    throw error.response?.data?.message || error.message || 'Failed to update booking status';
  }
};

// Cancel booking
export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    await api.delete(`/bookings/${bookingId}`);
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    throw error.response?.data?.message || error.message || 'Failed to cancel booking';
  }
};
