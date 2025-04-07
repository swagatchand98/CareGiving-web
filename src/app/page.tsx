'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Button from '@/components/common/Button';

export default function Home() {
  const { isAuthenticated, isLoading, loginWithGoogle } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-100 to-gray-200 py-20">
          <div className="container mx-auto px-4 relative">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Personalized Care for Personalized Life
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Professional caregiving services tailored to your unique needs. 
                  Our experienced caregivers provide compassionate care with love and dedication.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/services/browse">
                    <Button className="px-8 py-3 text-lg">
                      Browse Services
                    </Button>
                  </Link>
                  <Link href="/auth/provider-register">
                    <Button variant="secondary" className="px-8 py-3 text-lg">
                      Become a Caregiver
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-10">
                <div className="rounded-lg h-80 md:h-96 w-full overflow-hidden">
                  <img 
                    src="/images/placeholders/hero.svg" 
                    alt="Caregiving Services" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Priority Section (Based on the image) */}
        <section className="min-h-screen relative overflow-hidden flex items-center py-12 sm:py-16 md:py-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="flex flex-col md:flex-row items-center justify-between w-full mb-12 sm:mb-16 md:mb-24 max-w-7xl mx-auto">
                {/* Left Image */}
                <div className="w-3/4 sm:w-2/3 md:w-1/4 mb-10 sm:mb-12 md:mb-0 max-w-[250px]">
                  <img 
                    src="/images/placeholders/caregiver.jpg.svg" 
                    alt="Elder Care" 
                    className="w-full mx-auto"
                  />
                </div>
                
                {/* Center Text */}
                <div className="w-full sm:w-4/5 md:w-2/4 text-center px-2 sm:px-4 mb-10 sm:mb-12 md:mb-0">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-4 sm:mb-6">
                    Your Loved Ones is Our Priority
                  </h2>
                  <p className="text-lg sm:text-xl md:text-2xl text-gray-600">
                    Compassionate care delivered to your doorstep.
                  </p>
                </div>
                
                {/* Right Image */}
                <div className="w-3/4 sm:w-2/3 md:w-1/4 mt-4 sm:mt-6 md:mt-0 max-w-[250px]">
                  <img 
                    src="/images/placeholders/caregiver-baby.jpg.svg" 
                    alt="Child Care" 
                    className="w-full mx-auto"
                  />
                </div>
              </div>
              
              {/* Stats Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-4xl flex flex-col md:flex-row justify-between items-center mb-12 sm:mb-16 md:mb-24 mx-auto">
                {/* Stat 1 */}
                <div className="flex items-center mb-8 sm:mb-10 md:mb-0 w-full md:w-auto">
                  <div className="mr-4 sm:mr-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-14 sm:h-14">
                        <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C14.1217 20 16.1566 19.1571 17.6569 17.6569C19.1571 16.1566 20 14.1217 20 12C20 9.87827 19.1571 7.84344 17.6569 6.34315C16.1566 4.84285 14.1217 4 12 4C9.87827 4 7.84344 4.84285 6.34315 6.34315C4.84285 7.84344 4 9.87827 4 12C4 14.1217 4.84285 16.1566 6.34315 17.6569C7.84344 19.1571 9.87827 20 12 20ZM13 12H17V14H11V7H13V12Z" fill="#4B5563"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-bold mb-1">2,000+</h3>
                    <p className="text-base sm:text-lg text-gray-600">services</p>
                  </div>
                </div>
                
                {/* Stat 2 */}
                <div className="flex items-center mb-8 sm:mb-10 md:mb-0 w-full md:w-auto">
                  <div className="mr-4 sm:mr-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-14 sm:h-14">
                        <path d="M12 20.9L4.5 15.2C3.9 14.7 3.5 14.2 3.2 13.6C2.9 13 2.8 12.4 2.8 11.7C2.8 11 2.9 10.4 3.2 9.8C3.5 9.2 3.9 8.7 4.5 8.2L12 2.5L19.5 8.2C20.1 8.7 20.5 9.2 20.8 9.8C21.1 10.4 21.2 11 21.2 11.7C21.2 12.4 21.1 13 20.8 13.6C20.5 14.2 20.1 14.7 19.5 15.2L12 20.9ZM12 18.5L18.2 13.8C18.6 13.5 18.9 13.1 19.1 12.7C19.3 12.3 19.4 11.9 19.4 11.4C19.4 10.9 19.3 10.5 19.1 10.1C18.9 9.7 18.6 9.3 18.2 9L12 4.3L5.8 9C5.4 9.3 5.1 9.7 4.9 10.1C4.7 10.5 4.6 10.9 4.6 11.4C4.6 11.9 4.7 12.3 4.9 12.7C5.1 13.1 5.4 13.5 5.8 13.8L12 18.5Z" fill="#4B5563"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-bold mb-1">10+</h3>
                    <p className="text-base sm:text-lg text-gray-600">Cities</p>
                  </div>
                </div>
                
                {/* Stat 3 */}
                <div className="flex items-center w-full md:w-auto">
                  <div className="mr-4 sm:mr-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-14 sm:h-14">
                        <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM11.003 16L18.073 8.929L16.659 7.515L11.003 13.172L8.174 10.343L6.76 11.757L11.003 16Z" fill="#10B981"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-bold mb-1">5,000+</h3>
                    <p className="text-base sm:text-lg text-gray-600">Verified service provided</p>
                  </div>
                </div>
              </div>
              
              {/* Quick Sign Up Button */}
              <div className="text-center">
                <button 
                  onClick={handleGoogleSignIn}
                  className="flex items-center justify-center gap-2 sm:gap-3 bg-white border border-gray-300 rounded-lg px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg text-gray-700 font-medium shadow-md hover:bg-gray-50 transition-colors"
                >
                  <img 
                    src="/icons/google.svg" 
                    alt="Google" 
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    onError={(e) => {
                      e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg';
                    }}
                  />
                  Sign in with Google
                </button>
              </div>
            </div>
          </div>
          
          {/* Decorative Images */}
          <div className="hidden md:block absolute bottom-6 sm:bottom-8 md:bottom-10 left-4 sm:left-6 md:left-10 w-48 sm:w-60 md:w-72 opacity-70">
            <img 
              src="/images/placeholders/special-needs.svg" 
              alt="Decorative" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="hidden md:block absolute bottom-6 sm:bottom-8 md:bottom-10 right-4 sm:right-6 md:right-10 w-48 sm:w-60 md:w-72 opacity-70">
            <img 
              src="/images/placeholders/child-care.svg" 
              alt="Decorative" 
              className="w-full h-full object-contain"
            />
          </div>
        </section>

        {/* App Promotion Section */}
        <section className="min-h-screen relative flex items-center py-12 sm:py-16 md:py-0"
          style={{
            background: "linear-gradient(180deg, rgba(112, 226, 255, 0.5) 0%, rgba(183, 241, 255, 0.75) 25%, #FFFFFF 50%)"
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center h-full">
              {/* Heading */}
              <div className="text-center mb-12 sm:mb-16 md:mb-20 max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-4 sm:mb-6 mt-6 sm:mt-8 md:mt-10">
                  What's waiting for you on the app?
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600">
                  Our app is packed with features that enable you to experience services like never before
                </p>
              </div>
              
              {/* App Features with Phone Mockup */}
              <div className="relative w-full max-w-6xl mx-auto">
                {/* Phone Mockup in Center */}
                <div className="relative z-10 flex justify-center mb-8 md:mb-0">
                  <div className="w-56 sm:w-64 md:w-72 lg:w-80 relative">
                    <svg viewBox="0 0 320 640" className="w-full drop-shadow-xl">
                      {/* Outer frame/border */}
                      <rect x="30" y="10" width="260" height="520" rx="40" fill="#1a1a1a" />
                      
                      {/* Inner screen area */}
                      <rect x="38" y="18" width="244" height="504" rx="34" fill="white" />
                      
                      {/* Front camera / notch */}
                      <rect x="128" y="24" width="64" height="16" rx="8" fill="#1a1a1a" />
                      
                      {/* Side buttons (left) */}
                      <rect x="24" y="80" width="6" height="40" rx="2" fill="#1a1a1a" />
                      <rect x="24" y="140" width="6" height="40" rx="2" fill="#1a1a1a" />
                      
                      {/* Side buttons (right) */}
                      <rect x="290" y="100" width="6" height="50" rx="2" fill="#1a1a1a" />
                      
                      {/* App screen */}
                      <rect x="50" y="50" width="220" height="440" rx="8" fill="#f0f9ff" />
                    </svg>
                  </div>
                </div>
                
                {/* Feature Boxes - Mobile Optimized */}
                <div className="md:absolute inset-0 w-full h-full">
                  {/* For mobile: stacked feature boxes */}
                  <div className="grid grid-cols-1 gap-4 mt-8 md:hidden">
                    <div className="bg-white rounded-lg shadow-md p-4 mx-auto w-full max-w-xs">
                      <h3 className="font-semibold text-blue-900">Find Caregivers</h3>
                      <p className="text-sm text-gray-600">Search and filter by skills and availability</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 mx-auto w-full max-w-xs">
                      <h3 className="font-semibold text-blue-900">Book Services</h3>
                      <p className="text-sm text-gray-600">Schedule appointments with just a few taps</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 mx-auto w-full max-w-xs">
                      <h3 className="font-semibold text-blue-900">Secure Payments</h3>
                      <p className="text-sm text-gray-600">Pay safely through our encrypted platform</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 mx-auto w-full max-w-xs">
                      <h3 className="font-semibold text-blue-900">Real-time Updates</h3>
                      <p className="text-sm text-gray-600">Get notifications about your bookings</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 mx-auto w-full max-w-xs">
                      <h3 className="font-semibold text-blue-900">Rate & Review</h3>
                      <p className="text-sm text-gray-600">Share your experience with other users</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 mx-auto w-full max-w-xs">
                      <h3 className="font-semibold text-blue-900">24/7 Support</h3>
                      <p className="text-sm text-gray-600">Get help whenever you need it</p>
                    </div>
                  </div>
                  
                  {/* For desktop: positioned feature boxes */}
                  <div className="hidden md:block">
                    {/* Top Left Feature */}
                    <div className="absolute top-0 left-0 md:left-16 lg:left-24 w-40 md:w-48 bg-white rounded-lg shadow-md p-4 transform -translate-y-1/4 md:translate-x-0 pointer-events-auto">
                      <h3 className="font-semibold text-blue-900">Find Caregivers</h3>
                      <p className="text-sm text-gray-600">Search and filter by skills and availability</p>
                    </div>
                    
                    {/* Top Right Feature */}
                    <div className="absolute top-0 right-0 md:right-16 lg:right-24 w-40 md:w-48 bg-white rounded-lg shadow-md p-4 transform -translate-y-1/4 md:translate-x-0 pointer-events-auto">
                      <h3 className="font-semibold text-blue-900">Book Services</h3>
                      <p className="text-sm text-gray-600">Schedule appointments with just a few taps</p>
                    </div>
                    
                    {/* Middle Left Feature */}
                    <div className="absolute top-1/2 left-0 md:left-8 lg:left-16 w-40 md:w-48 bg-white rounded-lg shadow-md p-4 transform -translate-y-1/2 md:translate-x-0 pointer-events-auto">
                      <h3 className="font-semibold text-blue-900">Secure Payments</h3>
                      <p className="text-sm text-gray-600">Pay safely through our encrypted platform</p>
                    </div>
                    
                    {/* Middle Right Feature */}
                    <div className="absolute top-1/2 right-0 md:right-8 lg:right-16 w-40 md:w-48 bg-white rounded-lg shadow-md p-4 transform -translate-y-1/2 md:translate-x-0 pointer-events-auto">
                      <h3 className="font-semibold text-blue-900">Real-time Updates</h3>
                      <p className="text-sm text-gray-600">Get notifications about your bookings</p>
                    </div>
                    
                    {/* Bottom Left Feature */}
                    <div className="absolute bottom-0 left-0 md:left-16 lg:left-24 w-40 md:w-48 bg-white rounded-lg shadow-md p-4 transform translate-y-1/4 md:translate-x-0 pointer-events-auto">
                      <h3 className="font-semibold text-blue-900">Rate & Review</h3>
                      <p className="text-sm text-gray-600">Share your experience with other users</p>
                    </div>
                    
                    {/* Bottom Right Feature */}
                    <div className="absolute bottom-0 right-0 md:right-16 lg:right-24 w-40 md:w-48 bg-white rounded-lg shadow-md p-4 transform translate-y-1/4 md:translate-x-0 pointer-events-auto">
                      <h3 className="font-semibold text-blue-900">24/7 Support</h3>
                      <p className="text-sm text-gray-600">Get help whenever you need it</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Download Buttons */}
              <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 flex flex-col sm:flex-row gap-4 justify-center">
                <button className="flex items-center justify-center gap-2 bg-black text-white rounded-lg px-4 sm:px-6 py-2 sm:py-3 hover:bg-gray-800 transition-colors">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5227 19.2952C17.2877 19.7782 17.0243 20.2322 16.7339 20.6572C16.3538 21.2522 16.0393 21.6792 15.7895 21.9402C15.4054 22.3472 14.9903 22.5552 14.5433 22.5662C14.2363 22.5662 13.8583 22.4822 13.4107 22.3112C12.9618 22.1412 12.5479 22.0572 12.1669 22.0572C11.7658 22.0572 11.3389 22.1412 10.8863 22.3112C10.4323 22.4822 10.0693 22.5732 9.7956 22.5842C9.3693 22.6062 8.9447 22.3922 8.5213 21.9402C8.2515 21.6572 7.9233 21.2142 7.5379 20.6102C7.1264 19.9652 6.7856 19.2292 6.5159 18.3992C6.2262 17.5112 6.0806 16.6492 6.0806 15.8152C6.0806 14.8602 6.2762 14.0492 6.6674 13.3842C6.9781 12.8522 7.3925 12.4332 7.9116 12.1272C8.4307 11.8212 8.9968 11.6652 9.6107 11.6542C9.9407 11.6542 10.3708 11.7542 10.9033 11.9492C11.4345 12.1452 11.7645 12.2452 11.8933 12.2452C11.9895 12.2452 12.3683 12.1272 13.0259 11.8932C13.6473 11.6752 14.1745 11.5812 14.6098 11.6102C15.7422 11.6812 16.5902 12.1002 17.1495 12.8712C16.1414 13.4822 15.6431 14.3422 15.6541 15.4472C15.6638 16.3162 15.9895 17.0352 16.6286 17.6002C16.9168 17.8672 17.2399 18.0742 17.5998 18.2232C17.5748 18.5872 17.5498 18.9422 17.5227 19.2952ZM14.7293 6.0882C14.7293 6.7662 14.4696 7.3932 13.9529 7.9672C13.3339 8.6302 12.5724 9.0162 11.7547 8.9532C11.7431 8.8702 11.7364 8.7822 11.7364 8.6892C11.7364 8.0422 12.0344 7.3382 12.5813 6.7662C12.8541 6.4772 13.1951 6.2342 13.6043 6.0372C14.0123 5.8432 14.3978 5.7382 14.7609 5.7272C14.7726 5.8472 14.7293 5.9672 14.7293 6.0882Z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm sm:text-lg font-semibold">App Store</div>
                  </div>
                </button>
                <button className="flex items-center justify-center gap-2 bg-black text-white rounded-lg px-4 sm:px-6 py-2 sm:py-3 hover:bg-gray-800 transition-colors">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5227 8.79674C17.4637 8.8557 15.1641 10.1395 15.1641 12.5C15.1641 15.1724 17.8164 16.2607 17.8524 16.2777C17.8434 16.3097 17.4997 17.5395 16.6201 18.7964C15.8334 19.9089 15.0137 21.0214 13.7539 21.0214C12.4941 21.0214 12.1774 20.3056 10.7539 20.3056C9.36328 20.3056 8.86328 21.0214 7.67969 21.0214C6.49609 21.0214 5.63672 19.9429 4.81641 18.8304C3.91016 17.5736 3.14453 15.5575 3.14453 13.6454C3.14453 10.5878 5.11328 8.9812 7.05078 8.9812C8.27734 8.9812 9.29297 9.76367 10.0586 9.76367C10.7871 9.76367 11.9277 8.93164 13.3242 8.93164C13.8242 8.93164 15.8594 8.97949 17.5227 8.79674ZM12.8516 7.08789C13.3516 6.48633 13.7109 5.65429 13.7109 4.82227C13.7109 4.71484 13.7019 4.60742 13.6836 4.5C12.7773 4.53613 11.7168 5.08008 11.1348 5.75977C10.6797 6.29199 10.2324 7.12402 10.2324 7.96777C10.2324 8.08691 10.2504 8.20606 10.2594 8.24219C10.3184 8.25391 10.4082 8.26562 10.498 8.26562C11.3125 8.26562 12.3164 7.74512 12.8516 7.08789Z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-sm sm:text-lg font-semibold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Service Card 1 */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="rounded-lg h-40 mb-4 overflow-hidden">
                  <img 
                    src="/images/placeholders/elder-care.svg" 
                    alt="Elder Care" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">Elder Care</h3>
                <p className="text-gray-600 mb-4">
                  Compassionate care for seniors in the comfort of their own homes.
                </p>
                <Link href="/services/details/elder-care" className="text-black font-medium hover:underline">
                  Learn More →
                </Link>
              </div>
              
              {/* Service Card 2 */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="rounded-lg h-40 mb-4 overflow-hidden">
                  <img 
                    src="/images/placeholders/child-care.svg" 
                    alt="Child Care" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">Child Care</h3>
                <p className="text-gray-600 mb-4">
                  Professional and loving care for children of all ages.
                </p>
                <Link href="/services/details/child-care" className="text-black font-medium hover:underline">
                  Learn More →
                </Link>
              </div>
              
              {/* Service Card 3 */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="rounded-lg h-40 mb-4 overflow-hidden">
                  <img 
                    src="/images/placeholders/special-needs.svg" 
                    alt="Special Needs Care" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">Special Needs Care</h3>
                <p className="text-gray-600 mb-4">
                  Specialized care for individuals with special needs or disabilities.
                </p>
                <Link href="/services/details/special-needs" className="text-black font-medium hover:underline">
                  Learn More →
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Service Provider Registration Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                <h2 className="text-3xl font-bold mb-6">Become a Service Provider</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Join our network of professional caregivers and grow your business. We connect you with clients who need your specialized care services.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Flexible scheduling that works around your availability</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Competitive pay rates with weekly payments</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Professional development and training opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Support from our dedicated provider success team</span>
                  </li>
                </ul>
                <Link href="/auth/provider-register">
                  <Button className="px-8 py-3 text-lg">
                    Register as Provider
                  </Button>
                </Link>
              </div>
              <div className="md:w-1/2">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mr-4">
                      <span className="text-xl font-bold">$</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Earn More</h3>
                      <p className="text-gray-600">Set your own rates and availability</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mr-4">
                      <span className="text-xl font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Simple Onboarding</h3>
                      <p className="text-gray-600">Quick application and verification process</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mr-4">
                      <span className="text-xl font-bold">★</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Build Your Reputation</h3>
                      <p className="text-gray-600">Grow your business with client reviews</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-black text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied clients who have found the perfect caregiving solution for their needs.
            </p>
            <Link href="/auth/register">
              <Button className="px-8 py-3 text-lg bg-white text-black hover:bg-gray-100">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
