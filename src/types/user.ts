export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'provider' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  addresses?: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

export interface ProviderProfile extends User {
  bio?: string;
  specialties: string[];
  experience: number; // in years
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  availability: Availability[];
  documents: Document[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface Availability {
  id: string;
  providerId: string;
  dayOfWeek: number; // 0-6, where 0 is Sunday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface Document {
  id: string;
  providerId: string;
  type: 'id' | 'certification' | 'background_check' | 'other';
  name: string;
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  notificationSettings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
  currency: string;
  timezone: string;
}
