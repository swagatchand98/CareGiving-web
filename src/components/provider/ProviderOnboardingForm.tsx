'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Input from '../common/Input';
import Button from '../common/Button';
import { ProviderOnboardingData, ServiceArea } from '@/services/authService';
import api from '@/lib/axios';

const ProviderOnboardingForm: React.FC = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<ProviderOnboardingData>({
    bio: '',
    serviceCategories: [],
    certifications: [],
    yearsOfExperience: 0,
    hourlyRate: 0,
    serviceAreas: [] as ServiceArea[], // Explicitly typed as ServiceArea[]
    languagesSpoken: [],
    availability: []
  });
  
  const [errors, setErrors] = useState<{
    serviceCategories?: string;
    yearsOfExperience?: string;
    hourlyRate?: string;
    serviceAreas?: string;
    general?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceTypeOptions, setServiceTypeOptions] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<string[]>([]);
  const [selectedServiceAreas, setSelectedServiceAreas] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState('');
  
  // Common language options
  const languageOptions = [
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Japanese',
    'Korean',
    'Arabic',
    'Russian',
    'Hindi',
    'Portuguese',
    'Italian'
  ];
  
  // Common service areas (cities)
  const serviceAreaOptions = [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
    'Dallas',
    'San Jose',
    'Austin',
    'Jacksonville',
    'Other'
  ];

  useEffect(() => {
    // Check if user is authenticated and is a provider
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    if (user.role !== 'provider') {
      router.push('/dashboard');
      return;
    }
    
    // Check if onboarding status is already completed
    const checkOnboardingStatus = async () => {
      try {
        if (!token) return;
        
        const response = await api.get('/providers/onboarding-status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Type assertion to handle the unknown type
        const responseData = response.data as { data: { onboardingStatus: { profileComplete: boolean } } };
        const { onboardingStatus } = responseData.data;
        
        if (onboardingStatus.profileComplete) {
          // If profile is already complete, redirect to dashboard
          router.push('/dashboard/provider');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };
    
    checkOnboardingStatus();
  }, [user, router, token]);
  
  // Store categories data for mapping names to IDs
  const [categoriesData, setCategoriesData] = useState<Array<{ _id: string; name: string; }>>([]);
  
  // Fetch service categories from backend
  useEffect(() => {
    const fetchServiceCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await api.get('/services/categories');
        // Type assertion for the response data
        const responseData = response.data as { 
          data: { 
            categories: Array<{ _id: string; name: string; }> 
          } 
        };
        
        // Store the full categories data for later use
        setCategoriesData(responseData.data.categories);
        
        // Extract category names from the response
        const categoryNames = responseData.data.categories.map(category => category.name);
        setServiceTypeOptions(categoryNames);
      } catch (error) {
        console.error('Error fetching service categories:', error);
        // Set some default categories in case of error
        setServiceTypeOptions([
          'Elder Care',
          'Child Care',
          'Special Needs Care',
          'Medical Care',
          'Physical Therapy',
          'Companion Care',
          'Other'
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchServiceCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'yearsOfExperience' || name === 'hourlyRate' 
        ? parseFloat(value) 
        : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };
  
  const handleServiceCategoryChange = (category: string) => {
    setSelectedServiceCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter(item => item !== category);
      } else {
        return [...prev, category];
      }
    });
    
    // Clear error when user selects a category
    if (errors.serviceCategories) {
      setErrors((prev) => ({
        ...prev,
        serviceCategories: undefined,
      }));
    }
  };
  
  const handleServiceAreaChange = (area: string) => {
    setSelectedServiceAreas((prev) => {
      if (prev.includes(area)) {
        return prev.filter(item => item !== area);
      } else {
        return [...prev, area];
      }
    });
    
    // Clear error when user selects an area
    if (errors.serviceAreas) {
      setErrors((prev) => ({
        ...prev,
        serviceAreas: undefined,
      }));
    }
  };
  
  const handleLanguageChange = (language: string) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(language)) {
        return prev.filter(item => item !== language);
      } else {
        return [...prev, language];
      }
    });
  };
  
  const handleAddCertification = () => {
    if (newCertification.trim()) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCertification.trim()]
      }));
      setNewCertification('');
    }
  };
  
  const handleRemoveCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format service areas as objects with city and state properties
    const formattedServiceAreas = selectedServiceAreas.map(area => {
      // For simplicity, we'll use a default state for each city
      // In a real app, you might want to have a proper city-state mapping or selection
      return {
        city: area,
        state: "Default State" // This should be replaced with actual state data in a real app
      };
    });
    
    // Map selected category names to their corresponding IDs using cached categoriesData
    const serviceCategoryIds = selectedServiceCategories.map(selectedCategory => {
      const category = categoriesData.find(cat => cat.name === selectedCategory);
      return category ? category._id : null;
    }).filter((id): id is string => id !== null); // Type guard to filter out nulls
    
    // Update form data with selected values
    const updatedFormData = {
      ...formData,
      serviceCategories: serviceCategoryIds, // Now sending array of ObjectIds
      serviceAreas: formattedServiceAreas, // Now formatted as objects with city and state
      languagesSpoken: selectedLanguages
    };
    
    // Simple validation
    const newErrors: {
      serviceCategories?: string;
      yearsOfExperience?: string;
      hourlyRate?: string;
      serviceAreas?: string;
      general?: string;
    } = {};
    
    if (!updatedFormData.serviceCategories.length) {
      newErrors.serviceCategories = 'Please select at least one service category';
    }
    
    if (!updatedFormData.yearsOfExperience) {
      newErrors.yearsOfExperience = 'Years of experience is required';
    }
    
    if (!updatedFormData.hourlyRate) {
      newErrors.hourlyRate = 'Hourly rate is required';
    }
    
    if (!updatedFormData.serviceAreas.length) {
      newErrors.serviceAreas = 'Please select at least one service area';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Handle onboarding submission
    setIsSubmitting(true);
    try {
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Submit onboarding data to backend
      await api.post('/providers/onboarding', updatedFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Redirect to provider dashboard
      router.push('/dashboard/provider?onboarding=success');
    } catch (error: any) {
      console.error('Provider onboarding error:', error);
      setErrors({
        general: error.response?.data?.message || error.message || 'Failed to complete onboarding. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Provider Profile</h1>
            <p className="text-gray-600">
              Please provide additional information to complete your profile and start receiving service requests.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bio */}
            <div className="mb-4">
              <label 
                htmlFor="bio" 
                className="block text-sm font-medium mb-1"
              >
                Bio (Optional)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Tell us about yourself, your qualifications, and your caregiving experience"
                value={formData.bio || ''}
                onChange={handleChange}
              ></textarea>
            </div>
            
            {/* Service Categories */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Service Categories<span className="text-red-500 ml-1">*</span>
              </label>
              
              {isLoadingCategories ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  <span className="ml-2 text-gray-600">Loading categories...</span>
                </div>
              ) : serviceTypeOptions.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {serviceTypeOptions.map((category) => (
                    <div key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={selectedServiceCategories.includes(category)}
                        onChange={() => handleServiceCategoryChange(category)}
                        className="mr-2"
                      />
                      <label htmlFor={`category-${category}`}>{category}</label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
                  No service categories found. Please try again later or contact support.
                </div>
              )}
              
              {errors.serviceCategories && (
                <p className="mt-1 text-xs text-red-500">{errors.serviceCategories}</p>
              )}
            </div>
            
            {/* Certifications */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Certifications (Optional)
              </label>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Add a certification"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={handleAddCertification}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-r-md hover:bg-gray-300"
                >
                  Add
                </button>
              </div>
              {formData.certifications && formData.certifications.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Added Certifications:</p>
                  <ul className="space-y-1">
                    {formData.certifications.map((cert, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span>{cert}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCertification(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Years of Experience */}
            <div className="mb-4">
              <label 
                htmlFor="yearsOfExperience" 
                className="block text-sm font-medium mb-1"
              >
                Years of Experience<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                id="yearsOfExperience"
                name="yearsOfExperience"
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.yearsOfExperience || ''}
                onChange={handleChange}
                required
              />
              {errors.yearsOfExperience && (
                <p className="mt-1 text-xs text-red-500">{errors.yearsOfExperience}</p>
              )}
            </div>
            
            {/* Hourly Rate */}
            <div className="mb-4">
              <label 
                htmlFor="hourlyRate" 
                className="block text-sm font-medium mb-1"
              >
                Hourly Rate ($)<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                id="hourlyRate"
                name="hourlyRate"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.hourlyRate || ''}
                onChange={handleChange}
                required
              />
              {errors.hourlyRate && (
                <p className="mt-1 text-xs text-red-500">{errors.hourlyRate}</p>
              )}
            </div>
            
            {/* Service Areas */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Service Areas<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {serviceAreaOptions.map((area) => (
                  <div key={area} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`area-${area}`}
                      checked={selectedServiceAreas.includes(area)}
                      onChange={() => handleServiceAreaChange(area)}
                      className="mr-2"
                    />
                    <label htmlFor={`area-${area}`}>{area}</label>
                  </div>
                ))}
              </div>
              {errors.serviceAreas && (
                <p className="mt-1 text-xs text-red-500">{errors.serviceAreas}</p>
              )}
            </div>
            
            {/* Languages Spoken */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Languages Spoken (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {languageOptions.map((language) => (
                  <div key={language} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`language-${language}`}
                      checked={selectedLanguages.includes(language)}
                      onChange={() => handleLanguageChange(language)}
                      className="mr-2"
                    />
                    <label htmlFor={`language-${language}`}>{language}</label>
                  </div>
                ))}
              </div>
            </div>
            
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {errors.general}
              </div>
            )}
            
            <Button 
              type="submit" 
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Complete Profile'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProviderOnboardingForm;
