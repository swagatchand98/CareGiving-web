export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  shortDescription?: string;
  imageUrl?: string;
  duration: number; // in minutes
  basePrice: number;
  isPopular: boolean;
  isActive: boolean;
  tags: string[];
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
  category?: ServiceCategory;
}

export interface ServiceOption {
  id: string;
  serviceId: string;
  name: string;
  description?: string;
  additionalPrice: number;
  duration: number; // additional minutes
  isRequired: boolean;
  isActive: boolean;
}

export interface ServiceReview {
  id: string;
  serviceId: string;
  bookingId: string;
  userId: string;
  providerId: string;
  rating: number; // 1-5
  comment?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface ServiceProvider {
  id: string;
  serviceId: string;
  providerId: string;
  isAvailable: boolean;
  customPrice?: number;
  customDuration?: number;
  rating: number;
  reviewCount: number;
  provider?: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    experience: number;
  };
}

export interface ServiceSearch {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'popularity';
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in km
  };
}
