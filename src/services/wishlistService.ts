import api from '@/lib/axios';

// Types
export interface WishlistItem {
  _id: string;
  userId: string;
  serviceId: {
    _id: string;
    title: string;
    description: string;
    price: {
      amount: number;
      type: 'fixed' | 'hourly';
    };
    images?: string[];
    providerId: {
      _id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
  };
  createdAt: string;
}

export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
  page: number;
  totalPages: number;
}

// Get user's wishlist
export const getUserWishlist = async (
  page: number = 1,
  limit: number = 10
): Promise<WishlistResponse> => {
  try {
    const response = await api.get(`/wishlist?page=${page}&limit=${limit}`);
    return (response.data as any).data as WishlistResponse;
  } catch (error: any) {
    console.error('Get wishlist error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get wishlist';
  }
};

// Add service to wishlist
export const addToWishlist = async (serviceId: string): Promise<WishlistItem> => {
  try {
    const response = await api.post('/wishlist', { serviceId });
    return (response.data as any).data as WishlistItem;
  } catch (error: any) {
    console.error('Add to wishlist error:', error);
    throw error.response?.data?.message || error.message || 'Failed to add to wishlist';
  }
};

// Remove service from wishlist
export const removeFromWishlist = async (serviceId: string): Promise<void> => {
  try {
    await api.delete(`/wishlist/${serviceId}`);
  } catch (error: any) {
    console.error('Remove from wishlist error:', error);
    throw error.response?.data?.message || error.message || 'Failed to remove from wishlist';
  }
};

// Check if service is in wishlist
export const isInWishlist = async (serviceId: string): Promise<boolean> => {
  try {
    const response = await api.get(`/wishlist/check/${serviceId}`);
    return (response.data as any).isInWishlist;
  } catch (error: any) {
    console.error('Check wishlist error:', error);
    return false;
  }
};
