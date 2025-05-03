'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '../common/Button';
import { ProviderAddress } from '@/services/authService';
import api from '@/lib/axios';

const DocumentUploadForm: React.FC = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  
  const [documents, setDocuments] = useState<File[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [address, setAddress] = useState<ProviderAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  const [errors, setErrors] = useState<{
    documents?: string;
    profilePicture?: string;
    address?: string;
    general?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePictureRef = useRef<HTMLInputElement>(null);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setAddress((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors.address) {
      setErrors((prev) => ({
        ...prev,
        address: undefined,
      }));
    }
  };
  
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setDocuments((prev) => [...prev, ...newFiles]);
      
      // Clear error when user uploads documents
      if (errors.documents) {
        setErrors((prev) => ({
          ...prev,
          documents: undefined,
        }));
      }
    }
  };
  
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfilePicture(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear error when user uploads profile picture
      if (errors.profilePicture) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: undefined,
        }));
      }
    }
  };
  
  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    setPreviewUrl(null);
  };

  const validateForm = () => {
    const newErrors: {
      documents?: string;
      profilePicture?: string;
      address?: string;
      general?: string;
    } = {};
    
    if (documents.length === 0) {
      newErrors.documents = 'Please upload at least one document';
    }
    
    if (!profilePicture) {
      newErrors.profilePicture = 'Please upload a profile picture';
    }
    
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      newErrors.address = 'Please fill in all required address fields';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Handle document upload
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // 1. Upload address
      await api.post('/providers/address', address, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUploadProgress(25);
      
      // 2. Upload profile picture
      if (profilePicture) {
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);
        
        await api.post('/providers/profile-picture', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      setUploadProgress(50);
      
      // 3. Upload documents
      if (documents.length > 0) {
        const formData = new FormData();
        documents.forEach((doc) => {
          formData.append('documents', doc);
        });
        
        await api.post('/providers/documents', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      setUploadProgress(100);
      
      // Redirect to provider dashboard
      router.push('/dashboard/provider?documents=success');
    } catch (error: any) {
      console.error('Document upload error:', error);
      setErrors({
        general: error.response?.data?.message || error.message || 'Failed to upload documents. Please try again later.'
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
            <h1 className="text-3xl font-bold mb-2">Upload Required Documents</h1>
            <p className="text-gray-600">
              Please upload your documents and provide your address to complete your profile.
            </p>
          </div>
          
          {isSubmitting && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                {uploadProgress < 100 ? 'Uploading...' : 'Upload complete!'}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Address Section */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Your Address</h2>
              
              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor="street" 
                    className="block text-sm font-medium mb-1"
                  >
                    Street Address<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    value={address.street}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label 
                      htmlFor="city" 
                      className="block text-sm font-medium mb-1"
                    >
                      City<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      value={address.city}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="state" 
                      className="block text-sm font-medium mb-1"
                    >
                      State<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      value={address.state}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label 
                      htmlFor="zipCode" 
                      className="block text-sm font-medium mb-1"
                    >
                      Zip Code<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      value={address.zipCode}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="country" 
                      className="block text-sm font-medium mb-1"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      value={address.country}
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>
              </div>
              
              {errors.address && (
                <p className="mt-2 text-xs text-red-500">{errors.address}</p>
              )}
            </div>
            
            {/* Profile Picture Section */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
              
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  {previewUrl ? (
                    <img 
                      className="h-32 w-32 object-cover rounded-full" 
                      src={previewUrl} 
                      alt="Profile preview" 
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <input
                    type="file"
                    id="profilePicture"
                    ref={profilePictureRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                  />
                  
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => profilePictureRef.current?.click()}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      {profilePicture ? 'Change Picture' : 'Upload Picture'}
                    </button>
                    
                    {profilePicture && (
                      <button
                        type="button"
                        onClick={handleRemoveProfilePicture}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                  
                  {errors.profilePicture && (
                    <p className="mt-1 text-xs text-red-500">{errors.profilePicture}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Documents Section */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Documents</h2>
              <p className="text-gray-600 mb-4">
                Please upload your certifications, licenses, or any other relevant documents.
              </p>
              
              <input
                type="file"
                id="documents"
                ref={fileInputRef}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                multiple
                onChange={handleDocumentChange}
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Upload Documents
              </button>
              
              <p className="text-sm text-gray-500 mt-2">
                PDF, DOC, DOCX, JPG, JPEG or PNG. Max size 5MB per file.
              </p>
              
              {errors.documents && (
                <p className="mt-1 text-xs text-red-500">{errors.documents}</p>
              )}
              
              {documents.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Uploaded Documents:</h3>
                  <ul className="space-y-2">
                    {documents.map((doc, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span className="truncate max-w-xs">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(index)}
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
            
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {errors.general}
              </div>
            )}
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push('/dashboard/provider')}
              >
                Skip for Now
              </Button>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Uploading...' : 'Complete Registration'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadForm;
