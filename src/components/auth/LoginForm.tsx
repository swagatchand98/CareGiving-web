'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '@/contexts/AuthContext';

const LoginForm: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
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
      email?: string;
      password?: string;
      general?: string;
    } = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Handle login logic
    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase error codes
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            setErrors({ email: 'Invalid email format' });
            break;
          case 'auth/user-disabled':
            setErrors({ general: 'This account has been disabled' });
            break;
          case 'auth/user-not-found':
            setErrors({ email: 'No account found with this email' });
            break;
          case 'auth/wrong-password':
            setErrors({ password: 'Incorrect password' });
            break;
          case 'auth/too-many-requests':
            setErrors({ general: 'Too many failed login attempts. Please try again later.' });
            break;
          default:
            setErrors({ general: error.message || 'Failed to login. Please try again.' });
        }
      } else {
        setErrors({
          general: error.message || 'Failed to login. Please check your credentials and try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setErrors({
        general: error.message || 'Failed to login with Google. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    try {
      await login('demo@example.com', 'password123');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Demo login error:', error);
      setErrors({
        general: 'Failed to login with demo account. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Background image with text */}
      <div className="hidden md:flex md:w-1/2 bg-cover bg-center relative">
      <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0 rounded-r-2xl"
          onLoadedData={() => console.log("Video loaded successfully")}
          onError={(e) => console.error("Video error:", e)}
        >
          <source src="/videos/loginVdo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/80 bg-opacity-40 flex flex-col justify-center items-center text-white p-12 z-10 rounded-r-2xl"
        style={{boxShadow: "30px 0px 80px -10px rgba(0, 0, 0, 0.8)"}}
        >
          <div className="absolute top-8 left-8">
            <div className="text-2xl font-bold">Logo</div>
          </div>
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold mb-4">Care with Compassion, Serve with Love</h1>
          </div>
          <div className="absolute bottom-4 text-xs opacity-70 text-center w-full">
            Terms and Conditions Apply*
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-gray-600">Fill the field below to continue.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            
            <div className="flex justify-end">
              <Link href="/auth/reset-password" className="text-sm text-red-500 hover:underline">
                Forgot Password?
              </Link>
            </div>
            
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                {errors.general}
              </div>
            )}
            
            <Button 
              type="submit" 
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
            
            <div className="text-center my-4">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
            
            <Button 
              type="button" 
              variant="google" 
              fullWidth
              onClick={handleGoogleSignIn}
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
              Sign in with Google
            </Button>

            <div className="text-center mt-4">
              <p className="text-gray-600">
                Dont't have an account?{' '}
                <Link href="/auth/register" className="text-black font-medium hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
