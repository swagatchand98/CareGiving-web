'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useServices from '@/hooks/useServices';
import { ServiceCategory } from '@/services/serviceService';

interface CategoryListProps {
  onCategorySelect?: (categoryId: string) => void;
  selectedCategoryId?: string;
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  onCategorySelect,
  selectedCategoryId
}) => {
  const { fetchServiceCategories, isLoading, error } = useServices();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchServiceCategories();
        setCategories(response.categories);
      } catch (err: any) {
        console.error('Error loading categories:', err);
        // Error handling is now done in the hook
      }
    };
    
    loadCategories();
  }, [fetchServiceCategories]);
  
  // Get default image or icon for category
  const getCategoryImage = (category: ServiceCategory) => {
    if (category.iconUrl) {
      return category.iconUrl;
    }
    return '/images/placeholders/service-default.svg';
  };
  
  if (isLoading) {
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
  
  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No service categories found.</p>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Service Categories</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <div 
            key={category._id}
            onClick={() => onCategorySelect && onCategorySelect(category._id)}
            className={`
              bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center 
              ${onCategorySelect ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
              ${selectedCategoryId === category._id ? 'ring-2 ring-black' : ''}
            `}
          >
            <div className="w-16 h-16 rounded-full overflow-hidden mb-3">
              <Image 
                src={getCategoryImage(category)}
                alt={category.name}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <span className="font-medium">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
