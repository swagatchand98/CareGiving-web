'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Service } from '@/services/serviceService';

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

  return (
    <Link 
      href={`/services/details/${service._id}`}
      className={`block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}
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
  );
};

export default ServiceCard;
