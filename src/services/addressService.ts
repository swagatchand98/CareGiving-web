import api from '@/lib/axios';

// Types
export interface Address {
  _id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  landmark?: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddressResponse {
  address: Address;
}

export interface AddressesResponse {
  addresses: Address[];
  results: number;
}

export interface CreateAddressData {
  type: 'home' | 'work' | 'other';
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isDefault?: boolean;
  landmark?: string;
  instructions?: string;
}

export interface UpdateAddressData {
  type?: 'home' | 'work' | 'other';
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
  landmark?: string;
  instructions?: string;
}

// Get all addresses for the logged-in user
export const getUserAddresses = async (): Promise<AddressesResponse> => {
  try {
    const response = await api.get('/addresses');
    return (response.data as any).data as AddressesResponse;
  } catch (error: any) {
    console.error('Get addresses error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get addresses';
  }
};

// Get address by ID
export const getAddressById = async (addressId: string): Promise<AddressResponse> => {
  try {
    const response = await api.get(`/addresses/${addressId}`);
    return (response.data as any).data as AddressResponse;
  } catch (error: any) {
    console.error('Get address error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get address';
  }
};

// Create a new address
export const createAddress = async (addressData: CreateAddressData): Promise<AddressResponse> => {
  try {
    const response = await api.post('/addresses', addressData);
    return (response.data as any).data as AddressResponse;
  } catch (error: any) {
    console.error('Create address error:', error);
    throw error.response?.data?.message || error.message || 'Failed to create address';
  }
};

// Update an address
export const updateAddress = async (addressId: string, addressData: UpdateAddressData): Promise<AddressResponse> => {
  try {
    const response = await api.patch(`/addresses/${addressId}`, addressData);
    return (response.data as any).data as AddressResponse;
  } catch (error: any) {
    console.error('Update address error:', error);
    throw error.response?.data?.message || error.message || 'Failed to update address';
  }
};

// Delete an address
export const deleteAddress = async (addressId: string): Promise<void> => {
  try {
    await api.delete(`/addresses/${addressId}`);
  } catch (error: any) {
    console.error('Delete address error:', error);
    throw error.response?.data?.message || error.message || 'Failed to delete address';
  }
};

// Set an address as default
export const setDefaultAddress = async (addressId: string): Promise<AddressResponse> => {
  try {
    const response = await api.patch(`/addresses/${addressId}/default`);
    return (response.data as any).data as AddressResponse;
  } catch (error: any) {
    console.error('Set default address error:', error);
    throw error.response?.data?.message || error.message || 'Failed to set default address';
  }
};

// Get user's default address
export const getDefaultAddress = async (): Promise<AddressResponse | null> => {
  try {
    const response = await api.get('/addresses/default');
    return (response.data as any).data as AddressResponse;
  } catch (error: any) {
    console.error('Get default address error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get default address';
  }
};
