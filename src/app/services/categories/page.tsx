'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedHeader from '@/components/layout/EnhancedHeader';
import Footer from '@/components/layout/Footer';
import { ServiceCategory } from '@/types/service';

// Mock data - in a real app, this would come from an API
const mockCategories: ServiceCategory[] = [
  {
    id: '1',
    name: 'Elder Care',
    description: 'Professional care services for seniors',
    icon: '/icons/elder-care.svg',
    imageUrl: '/images/placeholders/elder-care.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Child Care',
    description: 'Reliable childcare services',
    icon: '/icons/child-care.svg',
    imageUrl: '/images/placeholders/child-care.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Special Needs',
    description: 'Specialized care for individuals with special needs',
    icon: '/icons/special-needs.svg',
    imageUrl: '/images/placeholders/special-needs.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Home Healthcare',
    description: 'Medical care services at home',
    icon: '/icons/home-healthcare.svg',
    imageUrl: '/images/placeholders/elder-care.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Respite Care',
    description: 'Temporary relief for primary caregivers',
    icon: '/icons/respite-care.svg',
    imageUrl: '/images/placeholders/caregiver.jpg.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Companion Care',
    description: 'Companionship and emotional support',
    icon: '/icons/companion-care.svg',
    imageUrl: '/images/placeholders/caregiver-baby.jpg.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Dementia Care',
    description: 'Specialized care for individuals with dementia',
    icon: '/icons/dementia-care.svg',
    imageUrl: '/images/placeholders/elder-care.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Palliative Care',
    description: 'End-of-life care and support',
    icon: '/icons/palliative-care.svg',
    imageUrl: '/images/placeholders/elder-care.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '9',
    name: 'Physical Therapy',
    description: 'Rehabilitation services at home',
    icon: '/icons/physical-therapy.svg',
    imageUrl: '/images/placeholders/elder-care.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '10',
    name: 'Occupational Therapy',
    description: 'Help with daily living activities',
    icon: '/icons/occupational-therapy.svg',
    imageUrl: '/images/placeholders/elder-care.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '11',
    name: 'Speech Therapy',
    description: 'Help with communication disorders',
    icon: '/icons/speech-therapy.svg',
    imageUrl: '/images/placeholders/child-care.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '12',
    name: 'Postpartum Care',
    description: 'Support for new mothers and infants',
    icon: '/icons/postpartum-care.svg',
    imageUrl: '/images/placeholders/child-care.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function CategoriesPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<ServiceCategory[]>(mockCategories);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Filter categories based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(mockCategories);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = mockCategories.filter(
        category => 
          category.name.toLowerCase().includes(query) || 
          category.description.toLowerCase().includes(query)
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery]);

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <EnhancedHeader user={user} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Service Categories</h1>
          <p className="text-gray-600">Browse all available care service categories</p>
        </div>
        
        {/* Search bar */}
        <div className="mb-8">
          <div className="max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-3 top-3 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <Link 
              key={category.id} 
              href={`/services/browse?category=${category.id}`}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-40 overflow-hidden">
                <img 
                  src={category.imageUrl || category.icon} 
                  alt={category.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
        
        {/* No results message */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-1">No categories found</h3>
            <p className="text-gray-600">Try adjusting your search query</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
