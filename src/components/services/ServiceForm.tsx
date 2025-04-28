'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useServices from '@/hooks/useServices';
import { Service, ServiceCategory, ServiceFormData } from '@/services/serviceService';
import Button from '../common/Button';

interface ServiceFormProps {
  initialData?: Service;
  onSuccess?: (service: Service) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ 
  initialData,
  onSuccess
}) => {
  const router = useRouter();
  const { 
    fetchServiceCategories, 
    createNewService, 
    updateExistingService, 
    isCategoriesLoading,
    isServiceSubmitting, 
    error 
  } = useServices();
  
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    categoryId: typeof initialData?.categoryId === 'string' 
      ? initialData.categoryId 
      : initialData?.categoryId?._id || '',
    priceAmount: initialData?.price.amount || 0,
    priceType: initialData?.price.type || 'fixed',
    duration: initialData?.duration || 60,
    specialRequirements: initialData?.additionalDetails?.specialRequirements || '',
    includedServices: initialData?.additionalDetails?.includedServices || []
  });
  
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [availableTasks, setAvailableTasks] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [previewImages, setPreviewImages] = useState<string[]>(
    initialData?.images || []
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Use refs to track state and prevent infinite loops
  const defaultCategoriesSetRef = React.useRef(false);
  const initialCategorySetRef = React.useRef(false);
  const mountedRef = React.useRef(false);
  
  // Memoize the initial category ID to avoid dependency issues
  const initialCategoryId = React.useMemo(() => formData.categoryId, []);
  
  // Memoize the loadCategories function to avoid recreating it on every render
  const loadCategories = React.useCallback(async () => {
    try {
      const response = await fetchServiceCategories();
      
      // Set categories
      const loadedCategories = response.categories;
      setCategories(loadedCategories);
      
      // Set initial category if needed
      if (!initialCategorySetRef.current && initialCategoryId && loadedCategories.length > 0) {
        initialCategorySetRef.current = true;
        const category = loadedCategories.find(c => c._id === initialCategoryId);
        if (category) {
          setSelectedCategory(category);
          setAvailableTasks(category.tasks || []);
        }
      }
    } catch (err: any) {
      console.error('Error loading categories:', err);
      
      // If all API attempts failed, use default categories
      if (!defaultCategoriesSetRef.current) {
        defaultCategoriesSetRef.current = true;
        const now = new Date().toISOString();
        const defaultCategories = [
          { 
            _id: 'elder-care', 
            name: 'Elder Care', 
            description: 'Services for elderly individuals',
            tasks: ['Companionship', 'Medication Reminders'],
            createdAt: now,
            updatedAt: now
          },
          { 
            _id: 'child-care', 
            name: 'Child Care', 
            description: 'Services for children',
            tasks: ['Babysitting', 'Homework Help'],
            createdAt: now,
            updatedAt: now
          },
          { 
            _id: 'special-needs', 
            name: 'Special Needs Care', 
            description: 'Services for individuals with special needs',
            tasks: ['Therapy Assistance', 'Daily Activities'],
            createdAt: now,
            updatedAt: now
          }
        ];
        
        setCategories(defaultCategories);
        
        // Set initial category if needed
        if (!initialCategorySetRef.current && initialCategoryId) {
          initialCategorySetRef.current = true;
          const category = defaultCategories.find(c => c._id === initialCategoryId);
          if (category) {
            setSelectedCategory(category);
            setAvailableTasks(category.tasks || []);
          }
        }
      }
    }
  }, [fetchServiceCategories, initialCategoryId]);
  
  // Load categories and set initial category - all in one effect
  useEffect(() => {
    // Skip if already mounted to prevent infinite loops
    if (mountedRef.current) return;
    mountedRef.current = true;
    
    loadCategories();
    
    // This effect should only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    
    // Find the selected category
    const category = categories.find(c => c._id === categoryId);
    
    // Batch state updates to reduce re-renders
    const newIncludedServices: string[] = [];
    const newSelectedCategory = category || null;
    const newAvailableTasks = category ? (category.tasks || []) : [];
    
    // Update all states at once
    setFormData(prev => ({ 
      ...prev, 
      categoryId,
      includedServices: newIncludedServices
    }));
    setSelectedCategory(newSelectedCategory);
    setAvailableTasks(newAvailableTasks);
  };
  
  // Handle included services change
  const handleIncludedServiceChange = (task: string) => {
    // Create a new array to avoid reference issues
    const includedServices = [...(formData.includedServices || [])];
    
    // Toggle the task
    const taskIndex = includedServices.indexOf(task);
    if (taskIndex >= 0) {
      includedServices.splice(taskIndex, 1);
    } else {
      includedServices.push(task);
    }
    
    // Update formData with the new array
    setFormData(prev => ({
      ...prev,
      includedServices
    }));
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Create preview URLs for the images
      const newPreviewImages = files.map(file => URL.createObjectURL(file));
      
      setPreviewImages(prev => [...prev, ...newPreviewImages]);
      setImageFiles(prev => [...prev, ...files]);
    }
  };
  
  // Remove image
  const handleRemoveImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'priceAmount' ? parseFloat(value) : value
    }));
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.categoryId) {
      errors.categoryId = 'Category is required';
    }
    
    if (!formData.priceAmount || formData.priceAmount <= 0) {
      errors.priceAmount = 'Price must be greater than 0';
    }
    
    if (!formData.duration || formData.duration <= 0) {
      errors.duration = 'Duration must be greater than 0';
    }
    
    return errors;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isServiceSubmitting) {
      return;
    }
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Add images to form data
      const formDataWithImages = {
        ...formData,
        images: imageFiles
      };
      
      let service;
      
      if (initialData) {
        // Update existing service
        service = await updateExistingService(initialData._id, formDataWithImages);
        setSuccessMessage('Service updated successfully!');
      } else {
        // Create new service
        service = await createNewService(formDataWithImages);
        setSuccessMessage('Service created successfully!');
      }
      
      // Clear form after successful submission
      if (!initialData) {
        // Use a timeout to delay state updates until after the current render cycle
        setTimeout(() => {
          setFormData({
            title: '',
            description: '',
            categoryId: '',
            priceAmount: 0,
            priceType: 'fixed',
            duration: 60,
            specialRequirements: '',
            includedServices: []
          });
          setPreviewImages([]);
          setImageFiles([]);
          setSelectedCategory(null);
          setAvailableTasks([]);
        }, 0);
      }
      
      // Call onSuccess callback if provided
      if (onSuccess && service) {
        onSuccess(service.service);
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setFormErrors({
        general: err.message || 'An error occurred while saving the service'
      });
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">
        {initialData ? 'Edit Service' : 'Create New Service'}
      </h2>
      
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
          {successMessage}
        </div>
      )}
      
      {/* Error Message */}
      {formErrors.general && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {formErrors.general}
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Service Title<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="e.g., Senior Home Care"
          />
          {formErrors.title && (
            <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>
          )}
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
            Category<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {formErrors.categoryId && (
            <p className="mt-1 text-xs text-red-500">{formErrors.categoryId}</p>
          )}
        </div>
        
        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="priceAmount" className="block text-sm font-medium mb-1">
              Price<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="priceAmount"
                name="priceAmount"
                value={formData.priceAmount}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            {formErrors.priceAmount && (
              <p className="mt-1 text-xs text-red-500">{formErrors.priceAmount}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="priceType" className="block text-sm font-medium mb-1">
              Price Type<span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="priceType"
              name="priceType"
              value={formData.priceType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Rate</option>
            </select>
          </div>
        </div>
        
        {/* Duration */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium mb-1">
            Duration (minutes)<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="60"
            min="1"
          />
          {formErrors.duration && (
            <p className="mt-1 text-xs text-red-500">{formErrors.duration}</p>
          )}
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description<span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="Describe your service in detail..."
          ></textarea>
          {formErrors.description && (
            <p className="mt-1 text-xs text-red-500">{formErrors.description}</p>
          )}
        </div>
        
        {/* Included Services */}
        {selectedCategory && availableTasks.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Included Services
            </label>
            <div className="space-y-2">
              {availableTasks.map((task) => (
                <label key={task} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(formData.includedServices || []).includes(task)}
                    onChange={() => handleIncludedServiceChange(task)}
                    className="mr-2"
                  />
                  <span>{task}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {/* Special Requirements */}
        <div>
          <label htmlFor="specialRequirements" className="block text-sm font-medium mb-1">
            Special Requirements (Optional)
          </label>
          <textarea
            id="specialRequirements"
            name="specialRequirements"
            value={formData.specialRequirements}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="Any special requirements or information clients should know..."
          ></textarea>
        </div>
        
        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Service Images
          </label>
          
          {/* Image Preview */}
          {previewImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {previewImages.map((image, index) => (
                <div key={index} className="relative w-24 h-24">
                  <Image
                    src={image}
                    alt={`Preview ${index + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-2">
            <label className="block w-full px-4 py-2 border border-gray-300 rounded-md text-center cursor-pointer hover:bg-gray-50">
              <span className="text-gray-600">Upload Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <p className="mt-1 text-xs text-gray-500">
              You can upload multiple images. Maximum 5 images.
            </p>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-black text-white rounded-md font-medium transition-colors focus:outline-none hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isServiceSubmitting}
            
          >
            {isServiceSubmitting ? 'Saving...' : initialData ? 'Update Service' : 'Create Service'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
