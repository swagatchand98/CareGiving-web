import { Address } from './user';
import { Service, ServiceOption, ServiceProvider } from './service';

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  providerId: string;
  status: BookingStatus;
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // in minutes
  totalPrice: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  addressId: string;
  notes?: string;
  cancellationReason?: string;
  selectedOptions: string[]; // Array of option IDs
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  service?: Service;
  provider?: ServiceProvider;
  address?: Address;
  options?: ServiceOption[];
}

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled_by_user' 
  | 'cancelled_by_provider' 
  | 'cancelled_by_admin' 
  | 'no_show';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

export interface BookingTimeSlot {
  date: string;
  slots: {
    time: string; // HH:MM format
    isAvailable: boolean;
  }[];
}

export interface BookingRequest {
  serviceId: string;
  providerId: string;
  scheduledDate: string;
  scheduledTime: string;
  addressId: string;
  selectedOptions: string[];
  notes?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  transactionId?: string;
  paymentIntentId?: string;
  receiptUrl?: string;
  refundAmount?: number;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingRequirements {
  specialInstructions?: string;
  allergies?: string[];
  medicalConditions?: string[];
  preferences?: {
    [key: string]: string | boolean | number;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}
