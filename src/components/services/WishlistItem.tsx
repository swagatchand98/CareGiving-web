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
    router.push(`/services/details/${serviceId._id}`);
  };
  
  const handleBookNow = () => {
    router.push(`/booking/new?serviceId=${serviceId._id}`);
  };
  
  const handleRemoveFromWishlist = () => {
    onRemove(serviceId._id);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Service Image */}
        <div className="w-full md:w-1/4 h-40 md:h-auto mb-4 md:mb-0 md:mr-4">
          <div className="h-full w-full rounded-md overflow-hidden">
            <img 
              src={(serviceId.images && serviceId.images.length > 0) 
                ? serviceId.images[0] 
                : '/images/placeholders/service-default.svg'} 
              alt={serviceId.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Service Details */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{serviceId.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {serviceId.description}
          </p>
          
          <div className="flex items-center mb-3">
            <span className="font-bold text-lg">
              ${serviceId.price.amount.toFixed(2)}/{serviceId.price.type}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Provider: {serviceId.providerId.firstName} {serviceId.providerId.lastName}
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
