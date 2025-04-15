'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedHeader from '@/components/layout/EnhancedHeader';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import { Service, ServiceCategory } from '@/types/service';

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
  }
];

const mockServices: Service[] = [
  {
    id: '1',
    categoryId: '1',
    name: 'Senior Home Care',
    description: 'Comprehensive care for seniors in the comfort of their own home. Our caregivers provide assistance with daily activities, medication reminders, meal preparation, light housekeeping, and companionship.',
    shortDescription: 'In-home care for seniors',
    imageUrl: '/images/placeholders/elder-care.svg',
    duration: 120,
    basePrice: 50,
    isPopular: true,
    isActive: true,
    tags: ['senior', 'home care', 'elder'],
    requirements: ['Medical history', 'Emergency contact'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: mockCategories[0]
  },
  {
    id: '2',
    categoryId: '2',
    name: 'Babysitting',
    description: 'Professional babysitting services for children of all ages. Our caregivers engage children in age-appropriate activities, prepare meals, assist with homework, and ensure a safe environment.',
    shortDescription: 'Professional babysitting',
    imageUrl: '/images/placeholders/child-care.svg',
    duration: 180,
    basePrice: 40,
    isPopular: true,
    isActive: true,
    tags: ['children', 'babysitting', 'childcare'],
    requirements: ['Child information', 'Emergency contact'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: mockCategories[1]
  },
  {
    id: '3',
    categoryId: '3',
    name: 'Special Needs Support',
    description: 'Specialized care for individuals with special needs or disabilities. Our trained caregivers provide personalized support, assistance with daily activities, and companionship tailored to specific needs.',
    shortDescription: 'Support for special needs',
    imageUrl: '/images/placeholders/special-needs.svg',
    duration: 240,
    basePrice: 60,
    isPopular: true,
    isActive: true,
    tags: ['special needs', 'disability', 'support'],
    requirements: ['Medical history', 'Special requirements', 'Emergency contact'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: mockCategories[2]
  },
  {
    id: '4',
    categoryId: '4',
    name: 'Nursing Care',
    description: 'Professional nursing services at home. Our registered nurses provide medical care, medication administration, wound care, and health monitoring for individuals recovering from surgery or managing chronic conditions.',
    shortDescription: 'In-home nursing care',
    imageUrl: '/images/placeholders/elder-care.svg',
    duration: 120,
    basePrice: 70,
    isPopular: true,
    isActive: true,
    tags: ['nursing', 'medical', 'healthcare'],
    requirements: ['Medical history', 'Prescription details', 'Emergency contact'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: mockCategories[3]
  },
  {
    id: '5',
    categoryId: '1',
    name: 'Overnight Care',
    description: 'Round-the-clock care for seniors who need supervision during the night. Our caregivers provide assistance with nighttime routines, bathroom visits, and ensure safety throughout the night.',
    shortDescription: 'Overnight supervision for seniors',
    imageUrl: '/images/placeholders/elder-care.svg',
    duration: 480,
    basePrice: 200,
    isPopular: false,
    isActive: true,
    tags: ['senior', 'overnight', 'elder'],
    requirements: ['Medical history', 'Emergency contact'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: mockCategories[0]
  },
  {
    id: '6',
    categoryId: '2',
    name: 'After School Care',
    description: 'Reliable after-school care for children. Our caregivers pick up children from school, assist with homework, prepare snacks, and engage them in educational activities until parents return home.',
    shortDescription: 'After-school supervision',
    imageUrl: '/images/placeholders/child-care.svg',
    duration: 180,
    basePrice: 35,
    isPopular: false,
    isActive: true,
    tags: ['children', 'after-school', 'childcare'],
    requirements: ['Child information', 'School details', 'Emergency contact'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: mockCategories[1]
  },
  {
    id: '7',
    categoryId: '3',
    name: 'Autism Support',
    description: 'Specialized care for individuals with autism. Our caregivers are trained in autism-specific approaches and provide structured support, sensory-friendly activities, and assistance with daily routines.',
    shortDescription: 'Support for individuals with autism',
    imageUrl: '/images/placeholders/special-needs.svg',
    duration: 240,
    basePrice: 65,
    isPopular: false,
    isActive: true,
    tags: ['autism', 'special needs', 'support'],
    requirements: ['Medical history', 'Behavioral assessment', 'Emergency contact'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: mockCategories[2]
  },
  {
    id: '8',
    categoryId: '4',
    name: 'Physical Therapy',
    description: 'In-home physical therapy services. Our licensed physical therapists develop personalized rehabilitation programs to improve mobility, strength, and function for individuals recovering from injuries or surgeries.',
    shortDescription: 'In-home rehabilitation',
    imageUrl: '/images/placeholders/elder-care.svg',
    duration: 60,
    basePrice: 90,
    isPopular: false,
    isActive: true,
    tags: ['physical therapy', 'rehabilitation', 'healthcare'],
    requirements: ['Medical history', 'Physician referral', 'Emergency contact'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: mockCategories[3]
  }
];

export default function BrowseServicesPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [filteredServices, setFilteredServices] = useState<Service[]>(mockServices);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Initialize filters from URL params
  useEffect(() => {
    const query = searchParams.get('query');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');

    if (query) setSearchQuery(query);
    if (category) setSelectedCategory(category);
    if (minPrice && maxPrice) setPriceRange([parseInt(minPrice), parseInt(maxPrice)]);
    if (sort) setSortBy(sort);
  }, [searchParams]);

  // Apply filters
  useEffect(() => {
    let filtered = [...mockServices];

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        service => 
          service.name.toLowerCase().includes(query) || 
          service.description.toLowerCase().includes(query) ||
          service.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(service => service.categoryId === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(
      service => service.basePrice >= priceRange[0] && service.basePrice <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'duration':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
    }

    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

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
          <h1 className="text-3xl font-bold mb-2">Browse Services</h1>
          <p className="text-gray-600">Find the perfect care service for your needs</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              
              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Categories</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="all-categories"
                      name="category"
                      className="mr-2"
                      checked={!selectedCategory}
                      onChange={() => setSelectedCategory(null)}
                    />
                    <label htmlFor="all-categories">All Categories</label>
                  </div>
                  {mockCategories.map(category => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        id={`category-${category.id}`}
                        name="category"
                        className="mr-2"
                        checked={selectedCategory === category.id}
                        onChange={() => setSelectedCategory(category.id)}
                      />
                      <label htmlFor={`category-${category.id}`}>{category.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Price Range</h3>
                <div className="flex items-center justify-between mb-2">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="w-full mb-2"
                />
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
              
              {/* Sort By */}
              <div>
                <h3 className="font-medium mb-2">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full bg-white border rounded-md py-2 px-4 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
              Filters
            </button>
            
            {/* Mobile Filters */}
            {isFilterOpen && (
              <div className="mt-4 bg-white rounded-lg shadow-sm p-6">
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Categories</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="mobile-all-categories"
                        name="mobile-category"
                        className="mr-2"
                        checked={!selectedCategory}
                        onChange={() => setSelectedCategory(null)}
                      />
                      <label htmlFor="mobile-all-categories">All Categories</label>
                    </div>
                    {mockCategories.map(category => (
                      <div key={`mobile-${category.id}`} className="flex items-center">
                        <input
                          type="radio"
                          id={`mobile-category-${category.id}`}
                          name="mobile-category"
                          className="mr-2"
                          checked={selectedCategory === category.id}
                          onChange={() => setSelectedCategory(category.id)}
                        />
                        <label htmlFor={`mobile-category-${category.id}`}>{category.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Price Range</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full mb-2"
                  />
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
                
                {/* Sort By */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="duration">Duration</option>
                  </select>
                </div>
                
                <Button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full"
                >
                  Apply Filters
                </Button>
              </div>
            )}
          </div>
          
          {/* Services List */}
          <div className="flex-grow">
            {/* Search bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search services..."
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
            
            {/* Results count */}
            <div className="mb-4">
              <p className="text-gray-600">{filteredServices.length} services found</p>
            </div>
            
            {/* Services grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Link 
                  key={service.id} 
                  href={`/services/details/${service.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={service.imageUrl || '/images/placeholders/service-default.svg'} 
                      alt={service.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {service.category?.name}
                      </span>
                      {service.isPopular && (
                        <span className="ml-2 text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.shortDescription}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">${service.basePrice}/hr</span>
                      <span className="text-sm text-gray-600">{service.duration} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* No results message */}
            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-1">No services found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
