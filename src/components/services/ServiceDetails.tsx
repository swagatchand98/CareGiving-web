'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Service, ServiceProvider, ServiceCategory } from '@/services/serviceService';
import Button from '../common/Button';

interface ServiceDetailsProps {
  service: Service;
  onBookNow: () => void;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ service, onBookNow }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Format provider name - simplified
  const getProviderName = () => {
    // Simple approach to avoid complex object access that might cause errors
    if (typeof service.providerId === 'string') {
      return 'Provider';
    }
    
    try {
      const provider = service.providerId as ServiceProvider;
      if (provider && provider.firstName && provider.lastName) {
        return `${provider.firstName} ${provider.lastName}`;
      }
      return 'Provider';
    } catch (err) {
      console.error('Error getting provider name:', err);
      return 'Provider';
    }
  };

  // Format category name - simplified
  const getCategoryName = () => {
    // Simple approach to avoid complex object access that might cause errors
    if (typeof service.categoryId === 'string') {
      return 'Category';
    }
    
    try {
      const category = service.categoryId as ServiceCategory;
      if (category && category.name) {
        return category.name;
      }
      return 'Category';
    } catch (err) {
      console.error('Error getting category name:', err);
      return 'Category';
    }
  };

  // Get default image or first image from service - simplified
  const getImageUrl = (index: number) => {
    // Default image as fallback
    const defaultImage = '/images/placeholders/service-default.svg';
    
    try {
      // Simple validation to avoid errors
      if (!service.images || !Array.isArray(service.images)) {
        return defaultImage;
      }
      
      if (index >= service.images.length) {
        return defaultImage;
      }
      
      const url = service.images[index];
      if (typeof url !== 'string' || !url.trim()) {
        return defaultImage;
      }
      
      return url;
    } catch (err) {
      console.error('Error getting image URL:', err);
      return defaultImage;
    }
  };
  
  // Format date - simplified
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    
    try {
      // Simple date formatting to avoid locale issues
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      
      const month = date.toLocaleString('default', { month: 'long' });
      const day = date.getDate();
      const year = date.getFullYear();
      
      return `${month} ${day}, ${year}`;
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Recently';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Image Gallery */}
        <div>
          <div className="relative h-80 w-full mb-4 rounded-lg overflow-hidden">
            <Image 
              src={getImageUrl(selectedImageIndex)}
              alt={service.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          
          {service.images && service.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {service.images.map((image, index) => (
                <button 
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 ${
                    selectedImageIndex === index ? 'ring-2 ring-black' : ''
                  }`}
                >
                  <Image 
                    src={image}
                    alt={`${service.title} - Image ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Service Info */}
        <div>
          <div className="flex items-center mb-2">
            <Link 
              href={typeof service.categoryId === 'string' 
                ? `/services/browse?category=${service.categoryId}` 
                : `/services/browse?category=${service.categoryId._id}`
              }
              className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200"
            >
              {getCategoryName()}
            </Link>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{service.title}</h1>
          
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
              {typeof service.providerId !== 'string' && service.providerId.profilePicture ? (
                <Image 
                  src={service.providerId.profilePicture}
                  alt={getProviderName()}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              ) : (
                <span className="text-sm text-gray-600">
                  {typeof service.providerId !== 'string' && service.providerId.firstName
                    ? service.providerId.firstName.charAt(0).toUpperCase() 
                    : 'P'}
                </span>
              )}
            </div>
            <span className="text-gray-600">{getProviderName()}</span>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Price:</span>
              <span className="font-bold text-xl">
                ${service.price.amount.toFixed(2)}
                <span className="text-sm text-gray-500 font-normal">
                  {service.price.type === 'hourly' ? '/hr' : ''}
                </span>
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Duration:</span>
              <span>
                {service.duration} minutes
                {service.price.type === 'hourly' && ` (${service.duration / 60} hour${service.duration / 60 !== 1 ? 's' : ''})`}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Listed:</span>
              <span>{formatDate(service.createdAt)}</span>
            </div>
          </div>
          
          <Button onClick={onBookNow} fullWidth>
            Book Now
          </Button>
          
          {typeof service.providerId !== 'string' && service.providerId.phoneNumber && (
            <div className="mt-4 text-center">
              <a 
                href={`tel:${service.providerId.phoneNumber}`}
                className="text-blue-600 hover:text-blue-800"
              >
                Contact Provider: {service.providerId.phoneNumber}
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Description */}
      <div className="p-6 border-t border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <p className="whitespace-pre-line">{service.description}</p>
      </div>
      
      {/* Included Services */}
      {service.additionalDetails?.includedServices && service.additionalDetails.includedServices.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Included Services</h2>
          <ul className="list-disc pl-5 space-y-1">
            {service.additionalDetails.includedServices.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Special Requirements */}
      {service.additionalDetails?.specialRequirements && (
        <div className="p-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Special Requirements</h2>
          <p className="whitespace-pre-line">{service.additionalDetails.specialRequirements}</p>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;
