'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Service } from '@/services/serviceService';
import WishlistButton from './WishlistButton';
import RatingDisplay from '../common/RatingDisplay';

interface ServiceCardProps {
  service: Service;
  className?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, className = '' }) => {
  // Format provider name
  const getProviderName = () => {
    if (typeof service.providerId === 'string') {
      return 'Provider';
    } else {
      return `${service.providerId.firstName} ${service.providerId.lastName}`;
    }
  };

  // Format category name
  const getCategoryName = () => {
    if (typeof service.categoryId === 'string') {
      return 'Category';
    } else {
      return service.categoryId.name;
    }
  };

  // Get media file (image or video) or default image
  const getMediaFile = () => {
    // First check if we have mediaFiles with images
    if (service.mediaFiles && Array.isArray(service.mediaFiles) && service.mediaFiles.length > 0) {
      // Find the first image
      const firstImage = service.mediaFiles.find(file => file.type === 'image');
      if (firstImage && firstImage.url) {
        return {
          url: firstImage.url,
          type: 'image'
        };
      }
      
      // If no image found, use the first video thumbnail
      const firstVideo = service.mediaFiles.find(file => file.type === 'video');
      if (firstVideo && firstVideo.url) {
        return {
          url: firstVideo.url,
          type: 'video'
        };
      }
    }
    
    // Fall back to legacy images field
    if (service.images && Array.isArray(service.images) && 
        service.images.length > 0 && 
        typeof service.images[0] === 'string' && 
        service.images[0].trim()) {
      return {
        url: service.images[0],
        type: 'image'
      };
    }
    
    // Otherwise, use category-based default image
    const categoryName = getCategoryName().toLowerCase();
    
    // Map category names to their respective placeholder images
    let defaultImageUrl = '/images/placeholders/caregiver.jpg.svg'; // Generic fallback
    
    if (categoryName.includes('companion')) {
      defaultImageUrl = '/images/placeholders/caregiver.jpg.svg';
    } else if (categoryName.includes('child') || categoryName.includes('baby')) {
      defaultImageUrl = '/images/placeholders/caregiver-baby.jpg.svg';
    } else if (categoryName.includes('elder') || categoryName.includes('alzheimer') || categoryName.includes('dementia')) {
      defaultImageUrl = '/images/placeholders/elder-care.svg';
    } else if (categoryName.includes('special') || categoryName.includes('disability')) {
      defaultImageUrl = '/images/placeholders/special-needs.svg';
    } else if (categoryName.includes('pet')) {
      defaultImageUrl = '/images/placeholders/elder-care.svg';
    } else if (categoryName.includes('nursing') || categoryName.includes('medical') || categoryName.includes('recovery') || categoryName.includes('hospitalization')) {
      defaultImageUrl = '/images/placeholders/elder-care.svg';
    }
    
    return {
      url: defaultImageUrl,
      type: 'image'
    };
  };

  // Handle wishlist button click to prevent navigation
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className={`relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Wishlist button - positioned absolutely */}
      <div className="absolute top-2 right-2 z-10" onClick={handleWishlistClick}>
        <WishlistButton serviceId={service._id} />
      </div>
      
      <Link 
        href={`/services/details/${service._id}`}
        className="block"
      >
        <div className="aspect-w-4 aspect-h-5 w-full">
          {getMediaFile().type === 'video' ? (
            <div className="w-full h-full">
              <video 
                src={getMediaFile().url}
                className="object-cover w-full h-full rounded-t-lg"
                muted
                playsInline
                loop
                autoPlay={false}
                poster="/images/placeholders/caregiver.jpg.svg"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            // Check if the URL is from S3 (contains amazonaws.com)
            getMediaFile().url.includes('amazonaws.com') ? (
              <img 
                src={getMediaFile().url}
                alt={service.title}
                className="object-cover w-full h-full rounded-t-lg"
              />
            ) : (
              <div className="relative w-full h-0" style={{ paddingBottom: '125%' }}>
                <Image 
                  src={getMediaFile().url}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded-t-lg"
                />
              </div>
            )
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-center mb-2">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {getCategoryName()}
            </span>
          </div>
          
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{service.title}</h3>
          
          {/* Rating Display */}
          {service.rating && (
            <div className="mb-1">
              <RatingDisplay 
                rating={service.rating.average} 
                reviewCount={service.rating.count}
                size="sm"
              />
            </div>
          )}
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
          
          <div className="flex justify-between items-center">
            <span className="font-bold">
              ${service.price.amount.toFixed(2)}
              <span className="text-xs text-gray-500 font-normal">
                {service.price.type === 'hourly' ? '/hr' : ''}
              </span>
            </span>
            
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
                {typeof service.providerId !== 'string' && service.providerId.profilePicture ? (
                  <Image 
                    src={service.providerId.profilePicture}
                    alt={getProviderName()}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-600">
                    {typeof service.providerId !== 'string' 
                      ? service.providerId.firstName.charAt(0).toUpperCase() 
                      : 'P'}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600 line-clamp-1">{getProviderName()}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ServiceCard;
