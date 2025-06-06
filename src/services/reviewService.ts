'use client';

import api from '@/lib/axios';

export interface Review {
  _id: string;
  bookingId: string;
  userId: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFormData {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  review: Review;
  providerAverageRating: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  stats: {
    averageRating: number;
    totalReviews: number;
    distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  results: number;
  total: number;
  page: number;
  totalPages: number;
}

// Create a new review
export const createReview = async (reviewData: ReviewFormData): Promise<ReviewResponse> => {
  try {
    const response = await api.post('/reviews', reviewData);
    return (response.data as any).data as ReviewResponse;
  } catch (error: any) {
    console.error('Create review error:', error);
    throw error.response?.data?.message || error.message || 'Failed to create review';
  }
};

// Get reviews for a provider
export const getProviderReviews = async (
  providerId: string,
  page: number = 1,
  limit: number = 10
): Promise<ReviewsResponse> => {
  try {
    const response = await api.get(`/reviews/provider/${providerId}?page=${page}&limit=${limit}`);
    return (response.data as any).data as ReviewsResponse;
  } catch (error: any) {
    console.error('Get provider reviews error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get provider reviews';
  }
};

// Get reviews for a service
export const getServiceReviews = async (
  serviceId: string,
  page: number = 1,
  limit: number = 10
): Promise<ReviewsResponse> => {
  try {
    const response = await api.get(`/reviews/service/${serviceId}?page=${page}&limit=${limit}`);
    return (response.data as any).data as ReviewsResponse;
  } catch (error: any) {
    console.error('Get service reviews error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get service reviews';
  }
};

// Get user's reviews
export const getUserReviews = async (
  page: number = 1,
  limit: number = 10
): Promise<ReviewsResponse> => {
  try {
    const response = await api.get(`/reviews/user?page=${page}&limit=${limit}`);
    return (response.data as any).data as ReviewsResponse;
  } catch (error: any) {
    console.error('Get user reviews error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get user reviews';
  }
};

// Update a review
export const updateReview = async (
  reviewId: string,
  reviewData: Partial<ReviewFormData>
): Promise<ReviewResponse> => {
  try {
    const response = await api.patch(`/reviews/${reviewId}`, reviewData);
    return (response.data as any).data as ReviewResponse;
  } catch (error: any) {
    console.error('Update review error:', error);
    throw error.response?.data?.message || error.message || 'Failed to update review';
  }
};

// Delete a review
export const deleteReview = async (reviewId: string): Promise<{ providerAverageRating: string }> => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    return (response.data as any).data as { providerAverageRating: string };
  } catch (error: any) {
    console.error('Delete review error:', error);
    throw error.response?.data?.message || error.message || 'Failed to delete review';
  }
};

// Get a review by ID
export const getReviewById = async (reviewId: string): Promise<{ review: Review }> => {
  try {
    const response = await api.get(`/reviews/${reviewId}`);
    return (response.data as any).data as { review: Review };
  } catch (error: any) {
    console.error('Get review error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get review';
  }
};
