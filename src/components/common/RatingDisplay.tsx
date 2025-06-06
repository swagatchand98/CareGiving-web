'use client';

import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount,
  showCount = true,
  size = 'md',
  className = ''
}) => {
  // Round rating to nearest half
  const roundedRating = Math.round(rating * 2) / 2;
  
  // Determine star size based on the size prop
  const getStarSize = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3';
      case 'lg': return 'w-6 h-6';
      case 'md':
      default: return 'w-4 h-4';
    }
  };
  
  // Determine text size based on the size prop
  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      case 'md':
      default: return 'text-sm';
    }
  };
  
  const starSize = getStarSize();
  const textSize = getTextSize();
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          // Full star
          if (star <= roundedRating) {
            return <StarIcon key={star} className={`${starSize} text-yellow-400`} />;
          }
          // Half star
          else if (star - 0.5 === roundedRating) {
            return (
              <div key={star} className="relative">
                <StarOutlineIcon className={`${starSize} text-yellow-400`} />
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <StarIcon className={`${starSize} text-yellow-400`} />
                </div>
              </div>
            );
          }
          // Empty star
          else {
            return <StarOutlineIcon key={star} className={`${starSize} text-gray-300`} />;
          }
        })}
      </div>
      
      {showCount && (
        <div className={`ml-2 ${textSize} text-gray-600`}>
          <span className="font-medium">{rating.toFixed(1)}</span>
          {reviewCount !== undefined && (
            <span className="ml-1">({reviewCount})</span>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;
