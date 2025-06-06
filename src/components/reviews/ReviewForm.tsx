'use client';

import React, { useState } from 'react';
import { useReview } from '@/hooks/useReview';
import { ReviewFormData } from '@/services/reviewService';
import Button from '@/components/common/Button';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface ReviewFormProps {
  bookingId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  bookingId,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const { submitReview, isLoading, error } = useReview();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleRatingHover = (hoveredRating: number) => {
    setHoverRating(hoveredRating);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (rating === 0) {
      setFormError('Please select a rating');
      return;
    }
    
    setFormError(null);
    
    try {
      const reviewData: ReviewFormData = {
        bookingId,
        rating,
        comment: comment.trim() || undefined
      };
      
      await submitReview(reviewData);
      setSuccessMessage('Thank you for your review!');
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setFormError('Failed to submit review. Please try again.');
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => {
      const displayRating = hoverRating || rating;
      return (
        <button
          key={star}
          type="button"
          onClick={() => handleRatingClick(star)}
          onMouseEnter={() => handleRatingHover(star)}
          onMouseLeave={handleRatingLeave}
          className="focus:outline-none"
          aria-label={`Rate ${star} stars out of 5`}
        >
          {star <= displayRating ? (
            <StarIcon className="w-8 h-8 text-yellow-400" />
          ) : (
            <StarOutlineIcon className="w-8 h-8 text-gray-400" />
          )}
        </button>
      );
    });
  };

  const getRatingText = () => {
    const displayRating = hoverRating || rating;
    switch (displayRating) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Select a rating';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Rate Your Experience</h2>
      
      {successMessage ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {successMessage}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {(error || formError) && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {formError || error}
            </div>
          )}
          
          {/* Rating Stars */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate your experience?
            </label>
            <div className="flex items-center space-x-1">
              {renderStars()}
            </div>
            <p className="mt-1 text-sm text-gray-600">{getRatingText()}</p>
          </div>
          
          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Share your experience (optional)
            </label>
            <textarea
              id="comment"
              name="comment"
              value={comment}
              onChange={handleCommentChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Tell us about your experience with this service..."
            />
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;
