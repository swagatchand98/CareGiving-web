'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { WishlistItem as WishlistItemType } from '@/services/wishlistService';
import Button from '@/components/common/Button';

interface WishlistItemProps {
  item: WishlistItemType;
  onRemove: (serviceId: string) => void;
  isRemoving: boolean;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ 
  item, 
  onRemove,
  isRemoving
}) => {
  const router = useRouter();
  const { serviceId } = item;
  
  const handleViewDetails = () => {
    if (!serviceId) return;
    router.push(`/services/details/${serviceId.id || serviceId._id}`);
  };
  
  const handleBookNow = () => {
    if (!serviceId) return;
    router.push(`/booking/new?serviceId=${serviceId.id || serviceId._id}`);
  };
  
  const handleRemoveFromWishlist = () => {
    if (!serviceId) return;
    onRemove(serviceId.id || serviceId._id || '');
  };
  
  // Get default image for service
  const getServiceImageUrl = () => {
    // If serviceId is null or undefined, return default image
    if (!serviceId) {
      return '/images/placeholders/caregiver.jpg.svg';
    }
    
    // If service has valid images, use them
    if (serviceId.images && Array.isArray(serviceId.images) && 
        serviceId.images.length > 0 && 
        typeof serviceId.images[0] === 'string' && 
        serviceId.images[0].trim()) {
      return serviceId.images[0];
    }
    
    // Since we don't have category information in the wishlist item,
    // we'll use a generic default image
    return '/images/placeholders/caregiver.jpg.svg';
  };
  
  // If serviceId is null or undefined, show a placeholder
  if (!serviceId) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Service information unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Service Image */}
        <div className="w-full md:w-1/4 h-40 md:h-auto mb-4 md:mb-0 md:mr-4">
          <div className="h-40 aspect-h-5 w-full rounded-md overflow-hidden">
            <img 
              src={getServiceImageUrl()} 
              alt={serviceId?.title || 'Service'} 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        {/* Service Details */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{serviceId?.title || 'Untitled Service'}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {serviceId?.description || 'No description available'}
          </p>
          
          <div className="flex items-center mb-3">
            <span className="font-bold text-lg">
              ${serviceId?.price?.amount?.toFixed(2) || '0.00'}/{serviceId?.price?.type || 'hour'}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Provider: {serviceId?.providerId?.firstName || 'Unknown'} {serviceId?.providerId?.lastName || ''}
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleViewDetails}
              variant="outline"
              className="text-sm px-3 py-1"
            >
              View Details
            </Button>
            
            <Button 
              onClick={handleBookNow}
              variant="primary"
              className="text-sm px-3 py-1"
            >
              Book Now
            </Button>
            
            <Button 
              onClick={handleRemoveFromWishlist}
              variant="secondary"
              className="text-sm px-3 py-1 bg-red-600 text-white hover:bg-red-700 border-red-600"
              disabled={isRemoving}
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;
