'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Service, ServiceProvider, ServiceCategory } from '@/services/serviceService';
import Button from '../common/Button';
import WishlistButton from './WishlistButton';
import RatingDisplay from '../common/RatingDisplay';
import ReviewList from '../reviews/ReviewList';

interface ServiceDetailsProps {
  service: Service;
  onBookNow: () => void;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ service, onBookNow }) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
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

  // Get all media files (images and videos)
  const getMediaFiles = () => {
    try {
      const mediaFiles = [];
      
      // First check if we have mediaFiles field
      if (service.mediaFiles && Array.isArray(service.mediaFiles) && service.mediaFiles.length > 0) {
        return service.mediaFiles;
      }
      
      // Fall back to legacy images field
      if (service.images && Array.isArray(service.images) && service.images.length > 0) {
        return service.images.map(url => ({
          url,
          type: 'image' as 'image' | 'video' | 'document'
        }));
      }
      
      // Otherwise, use category-based default image
      const categoryName = getCategoryName().toLowerCase();
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
      
      return [{
        url: defaultImageUrl,
        type: 'image' as 'image' | 'video' | 'document'
      }];
    } catch (err) {
      console.error('Error getting media files:', err);
      return [{
        url: '/images/placeholders/caregiver.jpg.svg',
        type: 'image' as 'image' | 'video' | 'document'
      }];
    }
  };
  
  // Get current media file
  const getCurrentMedia = () => {
    const mediaFiles = getMediaFiles();
    if (mediaFiles.length <= selectedMediaIndex) {
      return {
        url: '/images/placeholders/caregiver.jpg.svg',
        type: 'image' as 'image' | 'video' | 'document'
      };
    }
    
    return mediaFiles[selectedMediaIndex];
  };
  
  // Update media type when selected index changes
  React.useEffect(() => {
    const media = getCurrentMedia();
    setMediaType(media.type as 'image' | 'video');
  }, [selectedMediaIndex]);
  
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Hero Section with Media Gallery */}
      <div className="relative">
        {/* Main Media Display */}
        <div className="relative h-96 md:h-[28rem] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
          {mediaType === 'video' ? (
            <video 
              src={getCurrentMedia().url}
              className="w-full h-full object-cover"
              controls
              autoPlay={false}
              poster="/images/placeholders/caregiver.jpg.svg"
            />
          ) : (
            <>
              {getCurrentMedia().url.includes('amazonaws.com') ? (
                <img 
                  src={getCurrentMedia().url}
                  alt={service.title}
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                    isImageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setIsImageLoaded(true)}
                />
              ) : (
                <Image 
                  src={getCurrentMedia().url}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                  className="object-cover transition-all duration-500 group-hover:scale-105"
                  priority
                  onLoad={() => setIsImageLoaded(true)}
                />
              )}
              
              {/* Image overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </>
          )}
          
          {/* Media navigation arrows */}
          {getMediaFiles().length > 1 && (
            <>
              <button
                onClick={() => setSelectedMediaIndex(prev => prev > 0 ? prev - 1 : getMediaFiles().length - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <button
                onClick={() => setSelectedMediaIndex(prev => prev < getMediaFiles().length - 1 ? prev + 1 : 0)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </>
          )}
          
          {/* Media indicator dots */}
          {getMediaFiles().length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {getMediaFiles().map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMediaIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    selectedMediaIndex === index 
                      ? 'bg-white scale-125' 
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Thumbnail Navigation */}
        {getMediaFiles().length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
              {getMediaFiles().map((media, index) => (
                <button 
                  key={index}
                  onClick={() => setSelectedMediaIndex(index)}
                  className={`relative h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                    selectedMediaIndex === index 
                      ? 'ring-2 ring-white shadow-lg scale-105' 
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                >
                  {media.type === 'video' ? (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  ) : (
                    media.url.includes('amazonaws.com') ? (
                      <img 
                        src={media.url}
                        alt={`${service.title} - Media ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image 
                        src={media.url}
                        alt={`${service.title} - Media ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Service Header */}
      <div className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <Link 
              href={typeof service.categoryId === 'string' 
                ? `/services/browse?category=${service.categoryId}` 
                : `/services/browse?category=${service.categoryId._id}`
              }
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
              {getCategoryName()}
            </Link>
            
            {service.rating && (
              <div className="flex items-center">
                <RatingDisplay 
                  rating={service.rating.average} 
                  reviewCount={service.rating.count}
                  size="lg"
                />
              </div>
            )}
          </div>
          
          <WishlistButton 
            serviceId={service._id} 
            showText={true}
          />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">{service.title}</h1>
        
        {/* Provider Info */}
        <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden mr-4 shadow-sm">
            {typeof service.providerId !== 'string' && service.providerId.profilePicture ? (
              <Image 
                src={service.providerId.profilePicture}
                alt={getProviderName()}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-white">
                {typeof service.providerId !== 'string' && service.providerId.firstName
                  ? service.providerId.firstName.charAt(0).toUpperCase() 
                  : 'P'}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{getProviderName()}</h3>
            <p className="text-sm text-gray-600">Service Provider</p>
            {typeof service.providerId !== 'string' && service.providerId.phoneNumber && (
              <a 
                href={`tel:${service.providerId.phoneNumber}`}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-1 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                {service.providerId.phoneNumber}
              </a>
            )}
          </div>
        </div>
        
        {/* Pricing Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Price</p>
                <p className="text-2xl font-bold text-green-900">
                  ${service.price.amount.toFixed(2)}
                  <span className="text-sm text-green-700 font-normal">
                    {service.price.type === 'hourly' ? '/hr' : ''}
                  </span>
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Duration</p>
                <p className="text-xl font-bold text-blue-900">
                  {service.duration} min
                  {service.price.type === 'hourly' && (
                    <span className="block text-sm text-blue-700 font-normal">
                      ({service.duration / 60} hour{service.duration / 60 !== 1 ? 's' : ''})
                    </span>
                  )}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Listed</p>
                <p className="text-lg font-bold text-purple-900">{formatDate(service.createdAt)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to get started?</h3>
            <p className="text-gray-600 mb-4">Book this service with {getProviderName()} today</p>
            <Button 
              onClick={onBookNow} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Book Now - ${service.price.amount.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Description Section */}
      <div className="px-6 md:px-8 pb-6">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Description
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{service.description}</p>
        </div>
      </div>
      
      {/* Included Services */}
      {service.additionalDetails?.includedServices && service.additionalDetails.includedServices.length > 0 && (
        <div className="px-6 md:px-8 pb-6">
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              What's Included
            </h2>
            <ul className="space-y-2">
              {service.additionalDetails.includedServices.map((item, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Special Requirements */}
      {service.additionalDetails?.specialRequirements && (
        <div className="px-6 md:px-8 pb-6">
          <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              Special Requirements
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{service.additionalDetails.specialRequirements}</p>
          </div>
        </div>
      )}
      
      {/* Reviews Section */}
      <div className="px-6 md:px-8 pb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            Customer Reviews
          </h2>
          {typeof service.providerId !== 'string' && (
            <ReviewList 
              providerId={service.providerId._id}
              limit={5}
              showViewAll={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
