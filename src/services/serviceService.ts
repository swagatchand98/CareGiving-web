import api from '@/lib/axios';

// Types
export interface ServiceCategory {
  _id: string;
  name: string;
  description: string;
  iconUrl?: string;
  tasks?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceProvider {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  phoneNumber?: string;
}

export interface MediaFile {
  url: string;
  type: 'image' | 'video' | 'document';
  name?: string;
}

export interface Service {
  _id: string;
  providerId: string | ServiceProvider;
  categoryId: string | ServiceCategory;
  title: string;
  description: string;
  images: string[];  // Legacy field for backward compatibility
  mediaFiles?: MediaFile[];  // New field for better media type handling
  price: {
    amount: number;
    type: 'fixed' | 'hourly';
  };
  duration: number;
  additionalDetails?: {
    specialRequirements?: string;
    includedServices?: string[];
  };
  rating?: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ServiceResponse {
  service: Service;
}

export interface ServicesResponse {
  services: Service[];
  results: number;
  total: number;
  page: number;
  totalPages: number;
}

export interface ServiceCategoriesResponse {
  categories: ServiceCategory[];
  results: number;
}

export interface ServiceFormData {
  title: string;
  description: string;
  categoryId: string;
  priceAmount: number;
  priceType: 'fixed' | 'hourly';
  duration: number;
  specialRequirements?: string;
  includedServices?: string[];
  images?: File[];
}

// Get all services with pagination and filtering
export const getServices = async (
  page: number = 1,
  limit: number = 10,
  filters?: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    priceType?: string;
  }
): Promise<ServicesResponse> => {
  try {
    let url = `/services?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.categoryId) url += `&categoryId=${filters.categoryId}`;
      if (filters.minPrice) url += `&minPrice=${filters.minPrice}`;
      if (filters.maxPrice) url += `&maxPrice=${filters.maxPrice}`;
      if (filters.priceType) url += `&priceType=${filters.priceType}`;
    }
    
    const response = await api.get(url);
    return (response.data as any).data as ServicesResponse;
  } catch (error: any) {
    console.error('Get services error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get services';
  }
};

// Get service by ID
export const getServiceById = async (serviceId: string): Promise<ServiceResponse> => {
  try {
    const response = await api.get(`/services/${serviceId}`);
    return (response.data as any).data as ServiceResponse;
  } catch (error: any) {
    console.error('Get service error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get service details';
  }
};

// Search services
export const searchServices = async (
  query?: string,
  filters?: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    priceType?: string;
  }
): Promise<ServicesResponse> => {
  try {
    let url = '/services/search';
    const params = new URLSearchParams();
    
    if (query) params.append('query', query);
    
    if (filters) {
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.priceType) params.append('priceType', filters.priceType);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return (response.data as any).data as ServicesResponse;
  } catch (error: any) {
    console.error('Search services error:', error);
    throw error.response?.data?.message || error.message || 'Failed to search services';
  }
};

// Get services by category
export const getServicesByCategory = async (categoryId: string): Promise<ServicesResponse> => {
  try {
    const response = await api.get(`/services/category/${categoryId}`);
    return (response.data as any).data as ServicesResponse;
  } catch (error: any) {
    console.error('Get services by category error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get services by category';
  }
};

// Get all service categories
export const getServiceCategories = async (): Promise<ServiceCategoriesResponse> => {
  try {
    const response = await api.get('/services/categories');
    return (response.data as any).data as ServiceCategoriesResponse;
  } catch (error: any) {
    console.error('Get service categories error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get service categories';
  }
};

// Get service category by ID
export const getServiceCategoryById = async (categoryId: string): Promise<{ category: ServiceCategory }> => {
  try {
    const response = await api.get(`/services/categories/${categoryId}`);
    return (response.data as any).data as { category: ServiceCategory };
  } catch (error: any) {
    console.error('Get service category error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get service category';
  }
};

// Create a new service (provider only)
export const createService = async (serviceData: ServiceFormData): Promise<ServiceResponse> => {
  try {
    console.log('Creating service with data:', serviceData);
    
    const formData = new FormData();
    
    // Append text fields
    formData.append('title', serviceData.title);
    formData.append('description', serviceData.description);
    formData.append('categoryId', serviceData.categoryId);
    formData.append('priceAmount', serviceData.priceAmount.toString());
    formData.append('priceType', serviceData.priceType);
    formData.append('duration', serviceData.duration.toString());
    
    if (serviceData.specialRequirements) {
      formData.append('specialRequirements', serviceData.specialRequirements);
    }
    
    if (serviceData.includedServices && serviceData.includedServices.length > 0) {
      serviceData.includedServices.forEach(service => {
        formData.append('includedServices', service);
      });
    }
    
    // Append images
    if (serviceData.images && serviceData.images.length > 0) {
      console.log(`Appending ${serviceData.images.length} images to form data`);
      serviceData.images.forEach((image, index) => {
        formData.append('images', image);
        console.log(`Appended image ${index + 1}: ${image.name}`);
      });
    }
    
    // Debug FormData contents
    console.log('FormData entries:');
    for (const pair of (formData as any).entries()) {
      console.log(`${pair[0]}: ${pair[1] instanceof File ? pair[1].name : pair[1]}`);
    }
    
    console.log('Sending POST request to /services');
    const response = await api.post('/services', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Service created successfully:', response.data);
    return (response.data as any).data as ServiceResponse;
  } catch (error: any) {
    console.error('Create service error:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error.response?.data?.message || error.message || 'Failed to create service';
  }
};

// Update a service (provider only)
export const updateService = async (serviceId: string, serviceData: Partial<ServiceFormData>): Promise<ServiceResponse> => {
  try {
    const formData = new FormData();
    
    // Append text fields if they exist
    if (serviceData.title) formData.append('title', serviceData.title);
    if (serviceData.description) formData.append('description', serviceData.description);
    if (serviceData.categoryId) formData.append('categoryId', serviceData.categoryId);
    if (serviceData.priceAmount) formData.append('priceAmount', serviceData.priceAmount.toString());
    if (serviceData.priceType) formData.append('priceType', serviceData.priceType);
    if (serviceData.duration) formData.append('duration', serviceData.duration.toString());
    if (serviceData.specialRequirements) formData.append('specialRequirements', serviceData.specialRequirements);
    
    if (serviceData.includedServices && serviceData.includedServices.length > 0) {
      serviceData.includedServices.forEach(service => {
        formData.append('includedServices', service);
      });
    }
    
    // Append images if they exist
    if (serviceData.images && serviceData.images.length > 0) {
      serviceData.images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    const response = await api.patch(`/services/${serviceId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return (response.data as any).data as ServiceResponse;
  } catch (error: any) {
    console.error('Update service error:', error);
    throw error.response?.data?.message || error.message || 'Failed to update service';
  }
};

// Delete a service (provider only)
export const deleteService = async (serviceId: string): Promise<void> => {
  try {
    await api.delete(`/services/${serviceId}`);
  } catch (error: any) {
    console.error('Delete service error:', error);
    throw error.response?.data?.message || error.message || 'Failed to delete service';
  }
};

// Get provider's own services (provider only)
export const getProviderServices = async (
  page: number = 1,
  limit: number = 10
): Promise<ServicesResponse> => {
  try {
    console.log('Fetching provider services');
    const url = `/providers/services?page=${page}&limit=${limit}`;
    
    const response = await api.get(url);
    console.log('Provider services response:', response.data);
    return (response.data as any).data as ServicesResponse;
  } catch (error: any) {
    console.error('Get provider services error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get provider services';
  }
};
