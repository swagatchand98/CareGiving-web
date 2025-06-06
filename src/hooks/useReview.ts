'use client';

import { useState, useCallback } from 'react';
import {
  createReview,
  getProviderReviews,
  getServiceReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getReviewById,
  Review,
  ReviewFormData,
  ReviewResponse,
  ReviewsResponse
} from '@/services/reviewService';

export const useReview = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Submit a new review
  const submitReview = useCallback(async (reviewData: ReviewFormData): Promise<ReviewResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await createReview(reviewData);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch reviews for a provider
  const fetchProviderReviews = useCallback(async (
    providerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewsResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getProviderReviews(providerId, page, limit);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch provider reviews');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch reviews for a service
  const fetchServiceReviews = useCallback(async (
    serviceId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewsResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getServiceReviews(serviceId, page, limit);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch service reviews');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user's reviews
  const fetchUserReviews = useCallback(async (
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewsResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getUserReviews(page, limit);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user reviews');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing review
  const editReview = useCallback(async (
    reviewId: string,
    reviewData: Partial<ReviewFormData>
  ): Promise<ReviewResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await updateReview(reviewId, reviewData);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a review
  const removeReview = useCallback(async (
    reviewId: string
  ): Promise<{ providerAverageRating: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await deleteReview(reviewId);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to delete review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a review by ID
  const fetchReviewById = useCallback(async (
    reviewId: string
  ): Promise<{ review: Review }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getReviewById(reviewId);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    submitReview,
    fetchProviderReviews,
    fetchServiceReviews,
    fetchUserReviews,
    editReview,
    removeReview,
    fetchReviewById
  };
};

export default useReview;
