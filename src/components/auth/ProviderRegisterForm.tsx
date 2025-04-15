'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ProviderRegistrationData } from '@/services/authService';

const ProviderRegisterForm: React.FC = () => {
  const { registerProvider, registerProviderWithGoogle } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
      password?: string;
      confirmPassword?: string;
      general?: string;
    } = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
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
      // Create provider data object
      const providerData: ProviderRegistrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber
      };
      
      // Register as a provider
      await registerProvider(formData.email, formData.password, providerData);
      
      // Redirect to provider dashboard
      router.push('/dashboard/provider');
    } catch (error: any) {
      console.error('Provider registration error:', error);
      setErrors({
        general: error.message || 'Failed to register as a provider. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsSubmitting(true);
    try {
      // Create provider data object
      const providerData: ProviderRegistrationData = {
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        phoneNumber: formData.phoneNumber || ''
      };
      
      // Check if required fields are filled
      if (!providerData.phoneNumber) {
        setErrors({
          general: 'Please provide your phone number before signing up with Google'
        });
        setIsSubmitting(false);
        return;
      }
      
      // Register as a provider with Google
      await registerProviderWithGoogle(providerData);
      
      // Redirect to provider dashboard
      router.push('/dashboard/provider');
    } catch (error: any) {
      console.error('Provider Google registration error:', error);
      setErrors({
        general: error.message || 'Failed to register as a provider with Google. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <p className="text-gray-500 mt-2 text-sm">After registration, you'll need to complete your profile with additional information.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
              />
              
              <Input
                label="Last Name"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                required
              />
            </div>
            
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
              name="phoneNumber"
              type="tel"
              placeholder="(123) 456-7890"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              required
            />
            
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
            
            <div className="text-center mt-2">
              <p className="text-gray-600">
                Looking to register as a client?{' '}
                <Link href="/auth/register" className="text-black font-medium hover:underline">
                  Register as Client
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
