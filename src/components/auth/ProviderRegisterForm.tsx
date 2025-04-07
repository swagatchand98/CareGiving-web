'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '@/contexts/AuthContext';

const ProviderRegisterForm: React.FC = () => {
  const { register } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    experience: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    serviceType?: string;
    experience?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors: {
      name?: string;
      email?: string;
      phone?: string;
      serviceType?: string;
      experience?: string;
      password?: string;
      confirmPassword?: string;
      general?: string;
    } = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.serviceType) {
      newErrors.serviceType = 'Service type is required';
    }
    
    if (!formData.experience) {
      newErrors.experience = 'Experience is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Handle registration logic
    setIsSubmitting(true);
    try {
      // In a real app, we would register as a provider with additional fields
      await register(formData.name, formData.email, formData.password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        general: 'Failed to register. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Handle Google sign-up logic
    console.log('Google sign-up clicked');
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Background image with text */}
      <div className="hidden md:flex md:w-1/2 bg-cover bg-center relative" 
           style={{ backgroundImage: "url('/images/placeholders/caregiver.jpg.svg')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white p-12">
          <div className="absolute top-8 left-8">
            <div className="text-2xl font-bold">Logo</div>
          </div>
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold mb-4">Join Our Network of Professional Caregivers</h1>
          </div>
          <div className="absolute bottom-4 text-xs opacity-70 text-center w-full">
            Terms and Conditions Apply*
          </div>
        </div>
      </div>
      
      {/* Right side - Registration form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Provider Registration</h2>
            <p className="text-gray-600">Fill the fields below to join as a service provider.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="(123) 456-7890"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              required
            />
            
            <div className="mb-4">
              <label 
                htmlFor="serviceType" 
                className="block text-sm font-medium mb-1"
              >
                Service Type<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="serviceType"
                name="serviceType"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.serviceType}
                onChange={handleChange}
                required
              >
                <option value="">Select a service type</option>
                <option value="elder-care">Elder Care</option>
                <option value="child-care">Child Care</option>
                <option value="special-needs">Special Needs Care</option>
                <option value="medical">Medical Care</option>
                <option value="other">Other</option>
              </select>
              {errors.serviceType && <p className="mt-1 text-xs text-red-500">{errors.serviceType}</p>}
            </div>
            
            <div className="mb-4">
              <label 
                htmlFor="experience" 
                className="block text-sm font-medium mb-1"
              >
                Years of Experience<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="experience"
                name="experience"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.experience}
                onChange={handleChange}
                required
              >
                <option value="">Select years of experience</option>
                <option value="0-1">Less than 1 year</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
              {errors.experience && <p className="mt-1 text-xs text-red-500">{errors.experience}</p>}
            </div>
            
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
            
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
              {isSubmitting ? 'Registering...' : 'Register as Provider'}
            </Button>
            
            <div className="text-center my-4">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
            
            <Button 
              type="button" 
              variant="google" 
              fullWidth
              onClick={handleGoogleSignUp}
              disabled={isSubmitting}
            >
              <img 
                src="/icons/google.svg" 
                alt="Google" 
                className="w-5 h-5"
                onError={(e) => {
                  e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg';
                }}
              />
              Sign up with Google
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-black font-medium hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegisterForm;
