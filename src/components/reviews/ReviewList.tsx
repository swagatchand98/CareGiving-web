'use client';

import React, { useState, useEffect } from 'react';
import { useReview } from '@/hooks/useReview';
import { Review, ReviewsResponse } from '@/services/reviewService';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import Button from '@/components/common/Button';

interface ReviewListProps {
  providerId?: string;
  serviceId?: string;
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({
  providerId,
  serviceId,
  limit = 5,
  showViewAll = false,
  className = ''
}) => {
  const { fetchProviderReviews, fetchServiceReviews, isLoading, error } = useReview();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewsResponse['stats'] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        let response: ReviewsResponse;
        
        if (providerId) {
          response = await fetchProviderReviews(providerId, page, limit);
        } else if (serviceId) {
          response = await fetchServiceReviews(serviceId, page, limit);
        } else {
          throw new Error('Either providerId or serviceId must be provided');
        }
        
        setReviews(response.reviews);
        setStats(response.stats);
        setTotalPages(response.totalPages);
        setTotalReviews(response.total);
      } catch (err) {
        console.error('Error loading reviews:', err);
      }
    };
    
    loadReviews();
  }, [providerId, serviceId, page, limit, fetchProviderReviews, fetchServiceReviews]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <StarIcon className="w-4 h-4 text-yellow-400" />
            ) : (
              <StarOutlineIcon className="w-4 h-4 text-gray-400" />
            )}
          </span>
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;
    
    const { distribution } = stats;
    const maxCount = Math.max(
      distribution[5],
      distribution[4],
      distribution[3],
      distribution[2],
      distribution[1]
    );
    
    return (
      <div className="space-y-2 mb-6">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = distribution[rating as keyof typeof distribution];
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center">
              <span className="w-12 text-sm text-gray-600">{rating} stars</span>
              <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="w-8 text-sm text-gray-600 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Rating Summary */}
      {stats && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="text-4xl font-bold mr-4">{stats.averageRating.toFixed(1)}</div>
            <div>
              <div className="flex mb-1">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <div className="text-sm text-gray-600">
                Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          </div>
          
          {/* Rating Distribution */}
          {renderRatingDistribution()}
        </div>
      )}
      
      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center mb-1">
                  {renderStars(review.rating)}
                  <span className="ml-2 text-sm font-medium">
                    {review.rating === 5 ? 'Excellent' :
                     review.rating === 4 ? 'Very Good' :
                     review.rating === 3 ? 'Good' :
                     review.rating === 2 ? 'Fair' : 'Poor'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {/* If we have user data from populated fields */}
                  {(review as any).userId?.firstName ? (
                    <span>
                      {(review as any).userId.firstName} {(review as any).userId.lastName?.charAt(0)}.
                    </span>
                  ) : (
                    <span>Anonymous</span>
                  )}
                  <span className="mx-1">•</span>
                  <span>{formatDate(review.createdAt)}</span>
                </div>
              </div>
            </div>
            
            {review.comment && (
              <p className="text-gray-700 mt-2">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || isLoading}
              className="px-3 py-1"
            >
              Previous
            </Button>
            
            <span className="px-4 py-2 text-sm">
              Page {page} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || isLoading}
              className="px-3 py-1"
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* View All Link */}
      {showViewAll && totalReviews > limit && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => {
              // This would typically navigate to a page with all reviews
              // For now, we'll just increase the limit
              // In a real app, you'd use router.push to navigate to a reviews page
              console.log('View all reviews clicked');
            }}
          >
            View All {totalReviews} Reviews
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
