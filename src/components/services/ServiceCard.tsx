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

  // Get default image or first image from service
  const getImageUrl = () => {
    if (service.images && service.images.length > 0) {
      return service.images[0];
    }
    return '/images/placeholders/service-default.svg';
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
        <div className="relative h-48 w-full">
          <Image 
            src={getImageUrl()}
            alt={service.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
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
