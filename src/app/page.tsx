'use client';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSplashScreenEffect } from '@/hooks/useSplashScreenEffect';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Button from '@/components/common/Button';
import { initAllAnimations, initTypedText } from '@/lib/animation-utils';
import Image from 'next/image';
import caregiver from '../../public/images/caregiver1.jpeg'
import '../styles/animations.css';

export default function Home() {
  const { user, isAuthenticated, isLoading, loginWithGoogle } = useAuth();
  const router = useRouter();
  const typedTextRef = useRef(null);
  const [animationsInitialized, setAnimationsInitialized] = useState(false);
  
  // Use splash screen effect - it will show on first visit and hide after content loads
  useSplashScreenEffect({
    hideAfterLoad: true,
    dependencies: [isLoading, isAuthenticated, user]
  });

  // Redirect to appropriate dashboard based on role if authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Check user role and redirect accordingly
      if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (user.role === 'provider') {
        router.push('/dashboard/provider');
      } else {
        // Default to user dashboard
        router.push('/dashboard/user');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Initialize animations
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !animationsInitialized) {
      // Initialize all animations
      initAllAnimations();
      
      // Initialize typed text effect for the hero heading
      if (typedTextRef.current) {
        const texts = [
          "Personalized Care for Personalized Life",
          "Professional Care When You Need It Most",
          "Compassionate Caregiving for Your Family"
        ];
        initTypedText(typedTextRef.current, texts, { 
          typeSpeed: 70,
          backSpeed: 40,
          backDelay: 2000
        });
      }
      
      setAnimationsInitialized(true);
    }
  }, [isLoading, isAuthenticated, animationsInitialized]);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      const userData = await loginWithGoogle();
      
      // Redirect based on user role
      if (userData.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (userData.role === 'provider') {
        router.push('/dashboard/provider');
      } else {
        // Default to user dashboard
        router.push('/dashboard/user');
      }
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
      <PublicHeader />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex">
          <div className="container mx-auto px-6 md:px-12 z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-50">
              {/* Left Column - Heading */}
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-[42px] font-extrabold text-gray-900 mb-6 leading-14">
                  <span>Bringing Joy to Your Home,</span> <br />
                  <span className="">One Smile at a Time</span>
                </h1>
              </div>
              
              {/* Right Column - Description */}
              <div className='flex flex-col items-end'>
                <p className="text-lg text-gray-700 mb-6 min-h-30 w-100">
                  We Provide compassionate home services and caregiving solutions, delivering personalized care and support to families and individuals in need. We're dedicated to enhancing.
                </p>
              </div>
            </div>
          </div>
          
          {/* Caregiver Cards Section - Infinite Scroll */}
          <div className="absolute -bottom-10 left-0 right-0 overflow-hidden pb-24">
            <motion.div
              className="flex"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear",
                },
              }}
            >
              {/* First set of cards */}
              <div className="flex space-x-5 px-3">
                {/* Card 1 */}
                <div className="min-h-[380px] rounded-3xl w-[260px] flex-shrink-0 overflow-hidden shadow-lg transform hover:-translate-y-2 transition-all duration-300">
                  <Image 
                    src={caregiver}
                    alt="Caregiver"
                    className="object-cover h-full w-full"
                    priority
                    fill
                  />
                </div>

                {/* Card 2 */}
                <div className="min-h-[380px] rounded-3xl w-[260px] flex-shrink-0 overflow-hidden shadow-lg transform hover:-translate-y-2 transition-all duration-300">
                  <Image 
                    src={caregiver}
                    alt="Caregiver"
                    className="object-cover h-full w-full"
                    priority
                    fill
                  />
                </div>

                {/* Card 3 */}
                <div className="min-h-[380px] rounded-3xl w-[260px] flex-shrink-0 overflow-hidden shadow-lg transform hover:-translate-y-2 transition-all duration-300">
                  <Image 
                    src={caregiver}
                    alt="Caregiver"
                    className="object-cover h-full w-full"
                    priority
                    fill
                  />
                </div>

                {/* Card 4 */}
                <div className="min-h-[380px] rounded-3xl w-[260px] flex-shrink-0 overflow-hidden shadow-lg transform hover:-translate-y-2 transition-all duration-300">
                  <Image 
                    src={caregiver}
                    alt="Caregiver"
                    className="object-cover h-full w-full"
                    priority
                    fill
                  />
                </div>

                {/* Card 5 */}
                <div className="min-h-[380px] rounded-3xl w-[260px] flex-shrink-0 overflow-hidden shadow-lg transform hover:-translate-y-2 transition-all duration-300">
                  <Image 
                    src={caregiver}
                    alt="Caregiver"
                    className="object-cover h-full w-full"
                    priority
                    fill
                  />
                </div>
              </div>

              {/* Duplicate set of cards for seamless looping */}
              <div className="flex space-x-5 px-3">
                {/* Card 1 */}
                <div className="min-h-[380px] rounded-3xl w-[260px] flex-shrink-0 overflow-hidden shadow-lg transform hover:-translate-y-2 transition-all duration-300">
                  <Image 
                    src={caregiver}
                    alt="Caregiver"
                    className="object-cover h-full w-full"
                    priority
                    fill
                  />
                </div>

                {/* Card 2 */}
                <div className="min-h-[380px] rounded-3xl w-[260px] flex-shrink-0 overflow-hidden shadow-lg transform hover:-translate-y-2 transition-all duration-300">
                  <Image 
                    src={caregiver}
                    alt="Caregiver"
                    className="object-cover h-full w-full"
                    priority
                    fill
                  />
                </div>

                {/* Card 3 */}
                <div className="min-h-[380px] rounded-3xl w-[260px] flex-shrink-0 overflow-hidden shadow-lg transform hover:-translate-y-2 transition-all duration-300">
                  <Image 
                    src={caregiver}
                    alt="Caregiver"
                    className="object-cover h-full w-full"
                    priority
                    fill
                  />
                </div>

                {/* Card 4 */}
                <div className="min-h-[380px] rounded-3xl w-[260px] flex-shrink-0 overflow-hidden shadow-lg transform hover:-translate-y-2 transition-all duration-300">
                  <Image 
                    src={caregiver}
                    alt="Caregiver"
                    className="object-cover h-full w-full"
                    priority
                    fill
                  />
                </div>

                {/* Card 5 */}
                <div className="min-h-[380px] rounded-3xl w-[260px] flex-shrink-0 overflow-hidden shadow-lg transform hover:-translate-y-2 transition-all duration-300">
                  <Image 
                    src={caregiver}
                    alt="Caregiver"
                    className="object-cover h-full w-full"
                    priority
                    fill
                  />
                </div>
              </div>
            </motion.div>
          </div>
                        
              {/* CTA Button */}
            <div className="absolute bottom-25 left-0 right-0 flex justify-center items-center">
            <Link href="/services">
              <div className="px-12 py-4 text-[18px] w-150 font-bold bg-blue-600 hover:bg-blue-700 rounded-full text-white shadow-lg transition duration-300 ease-in-out transform hover:scale-105 text-center">
              We are Ready to Serve You
              </div>
            </Link>
            </div>
        </section>

        {/* Helping Hand Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left Content */}
              <div className="lg:w-1/2 reveal reveal-left">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  Extending a Helping Hand<br />
                  with Compassion and Care
                </h2>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  We deliver tailored support with empathy and kindness, ensuring your loved ones receive the 
                  best possible care. Our team is dedicated to fostering comfort, security, and well-being.
                </p>
              </div>
              
              {/* Right Content - Service Cards */}
              <div className="lg:w-1/2 reveal reveal-right">
                {/* Header with See All Services Button */}
                <div className="flex justify-end mb-6">
                  <Link href="/services">
                    <Button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                      See All Services
                    </Button>
                  </Link>
                </div>
                
                {/* Service Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1 - Enhance Quality of Life */}
                  <div className="bg-blue-600 rounded-2xl p-6 text-white text-center hover:bg-blue-700 transition-colors duration-300 hover-lift">
                    <h3 className="text-xl font-bold mb-4">Enhance Quality of Life</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      Improve clients' physical, emotional, and social well-being with personalized care, requirements and preferences.
                    </p>
                  </div>
                  
                  {/* Card 2 - Promote Independence */}
                  <div className="bg-blue-600 rounded-2xl p-6 text-white text-center hover:bg-blue-700 transition-colors duration-300 hover-lift">
                    <h3 className="text-xl font-bold mb-4">Promote Independence</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      To help clients maintain daily routines with professional support.
                    </p>
                  </div>
                  
                  {/* Card 3 - Ensure Reliable Support */}
                  <div className="bg-blue-600 rounded-2xl p-6 text-white text-center hover:bg-blue-700 transition-colors duration-300 hover-lift">
                    <h3 className="text-xl font-bold mb-4">Ensure Reliable Support</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      To provide consistent and trustworthy care during tough times.
                    </p>
                  </div>
                  
                  {/* Card 4 - Foster Community & Connection */}
                  <div className="bg-blue-600 rounded-2xl p-6 text-white text-center hover:bg-blue-700 transition-colors duration-300 hover-lift">
                    <h3 className="text-xl font-bold mb-4">Foster community &Connection</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      To reduce isolation through companionship and pet care.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-16 bg-black text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal">
              Welcome To The Community Of Care Crew
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold mb-6 reveal" style={{ animationDelay: '0.2s' }}>
              Consistent Care Constant Comfort
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto mb-8 reveal" style={{ animationDelay: '0.4s' }}>
              Discover how our commitment to care made all difference and brings smiles on thousand faces
            </p>
          </div>
        </section>

        {/* Our Services Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
              <div className="mb-6 md:mb-0">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 reveal">
                  Our Services
                </h2>
                <p className="text-gray-600 max-w-lg reveal" style={{ animationDelay: '0.2s' }}>
                  Lorem ipsum dolor sit amet consectetur, iaculis tellus aliquam fringilla 
                  velit magna aliquet. Amet auctor egestas mattis aliquet.
                </p>
              </div>
              <div className="reveal" style={{ animationDelay: '0.4s' }}>
                <Link href="/services">
                  <Button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold hover-lift">
                    Book a Service
                  </Button>
                </Link>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Service Card 1 - With Image */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift reveal">
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src="/images/placeholders/alzheimer-care.jpg" 
                    alt="Alzheimer's and Dementia Care" 
                    className="w-full h-full object-cover hover-scale"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x200/e5e7eb/6b7280?text=Alzheimer+Care';
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Alzheimer's and Dementia Care
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    Lorem ipsum dolor sit amet consectetur, id vel rhoncus tristique sagittis. Dignissim pellentesque a
                  </p>
                  <Link href="/services/alzheimer-care" className="text-blue-600 font-medium text-sm hover:underline btn-pulse">
                    Know More →
                  </Link>
                </div>
              </div>

              {/* Service Card 2 - Placeholder */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift reveal" style={{ animationDelay: '0.1s' }}>
                <div className="h-48 bg-blue-100 flex items-center justify-center">
                  <div className="text-blue-400 text-6xl">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-16 h-16">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 7.5L13.5 7L10.5 4C9.9 3.4 9 3.4 8.4 4L6 6.4C5.4 7 5.4 7.9 6 8.5L7 9.5L7 15C7 15.6 7.4 16 8 16S9 15.6 9 15L9 10L10.5 8.5L12 10V15C12 15.6 12.4 16 13 16S14 15.6 14 15L14 9.5L15 7.5Z"/>
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Alzheimer's and Dementia Care
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    Lorem ipsum dolor sit amet consectetur, id vel rhoncus tristique sagittis. Dignissim pellentesque a
                  </p>
                  <Link href="/services/alzheimer-care" className="text-blue-600 font-medium text-sm hover:underline btn-pulse">
                    Know More →
                  </Link>
                </div>
              </div>

              {/* Service Card 3 - Placeholder */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift reveal" style={{ animationDelay: '0.2s' }}>
                <div className="h-48 bg-purple-100 flex items-center justify-center">
                  <div className="text-purple-400 text-6xl">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-16 h-16">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM16.5 10C17.3 10 18 10.7 18 11.5S17.3 13 16.5 13S15 12.3 15 11.5S15.7 10 16.5 10ZM7.5 10C8.3 10 9 10.7 9 11.5S8.3 13 7.5 13S6 12.3 6 11.5S6.7 10 7.5 10Z"/>
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Alzheimer's and Dementia Care
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    Lorem ipsum dolor sit amet consectetur, id vel rhoncus tristique sagittis. Dignissim pellentesque a
                  </p>
                  <Link href="/services/alzheimer-care" className="text-blue-600 font-medium text-sm hover:underline btn-pulse">
                    Know More →
                  </Link>
                </div>
              </div>

              {/* Service Card 4 - Placeholder */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift reveal" style={{ animationDelay: '0.3s' }}>
                <div className="h-48 bg-green-100 flex items-center justify-center">
                  <div className="text-green-400 text-6xl">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-16 h-16">
                      <path d="M9.5 15.5L12 13L14.5 15.5L13 17H11L9.5 15.5ZM12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM12 7C13.11 7 14 7.89 14 9V11H10V9C10 7.89 10.89 7 12 7Z"/>
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Alzheimer's and Dementia Care
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    Lorem ipsum dolor sit amet consectetur, id vel rhoncus tristique sagittis. Dignissim pellentesque a
                  </p>
                  <Link href="/services/alzheimer-care" className="text-blue-600 font-medium text-sm hover:underline btn-pulse">
                    Know More →
                  </Link>
                </div>
              </div>

              {/* Service Card 5 - Placeholder */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift reveal" style={{ animationDelay: '0.4s' }}>
                <div className="h-48 bg-orange-100 flex items-center justify-center">
                  <div className="text-orange-400 text-6xl">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-16 h-16">
                      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Alzheimer's and Dementia Care
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    Lorem ipsum dolor sit amet consectetur, id vel rhoncus tristique sagittis. Dignissim pellentesque a
                  </p>
                  <Link href="/services/alzheimer-care" className="text-blue-600 font-medium text-sm hover:underline btn-pulse">
                    Know More →
                  </Link>
                </div>
              </div>

              {/* Service Card 6 - Placeholder */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift reveal" style={{ animationDelay: '0.5s' }}>
                <div className="h-48 bg-pink-100 flex items-center justify-center">
                  <div className="text-pink-400 text-6xl">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-16 h-16">
                      <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/>
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Alzheimer's and Dementia Care
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    Lorem ipsum dolor sit amet consectetur, id vel rhoncus tristique sagittis. Dignissim pellentesque a
                  </p>
                  <Link href="/services/alzheimer-care" className="text-blue-600 font-medium text-sm hover:underline btn-pulse">
                    Know More →
                  </Link>
                </div>
              </div>

              {/* Service Card 7 - Placeholder */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift reveal" style={{ animationDelay: '0.6s' }}>
                <div className="h-48 bg-indigo-100 flex items-center justify-center">
                  <div className="text-indigo-400 text-6xl">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-16 h-16">
                      <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Alzheimer's and Dementia Care
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    Lorem ipsum dolor sit amet consectetur, id vel rhoncus tristique sagittis. Dignissim pellentesque a
                  </p>
                  <Link href="/services/alzheimer-care" className="text-blue-600 font-medium text-sm hover:underline btn-pulse">
                    Know More →
                  </Link>
                </div>
              </div>

              {/* Service Card 8 - Placeholder */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift reveal" style={{ animationDelay: '0.7s' }}>
                <div className="h-48 bg-teal-100 flex items-center justify-center">
                  <div className="text-teal-400 text-6xl">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-16 h-16">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12C17 14.76 14.76 17 12 17S7 14.76 7 12S9.24 7 12 7S17 9.24 17 12ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z"/>
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Alzheimer's and Dementia Care
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    Lorem ipsum dolor sit amet consectetur, id vel rhoncus tristique sagittis. Dignissim pellentesque a
                  </p>
                  <Link href="/services/alzheimer-care" className="text-blue-600 font-medium text-sm hover:underline btn-pulse">
                    Know More →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* App Promotion Section */}
                {/* App Promotion Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              {/* Left Side - Phone Mockup */}
              <div className="lg:w-1/2 flex justify-center lg:justify-start">
                <div className="relative w-80 sm:w-96">
                  {/* Phone Frame */}
                  <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl">
                    <div className="bg-white rounded-[2.5rem] overflow-hidden">
                      {/* Phone Screen Content */}
                      <div className="relative h-[600px] bg-gradient-to-b from-blue-50 to-white">
                        {/* Status Bar */}
                        <div className="flex justify-between items-center px-6 py-3 text-sm">
                          <span className="font-medium">9:41</span>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-2 bg-black rounded-sm"></div>
                            <div className="w-6 h-3 border border-black rounded-sm">
                              <div className="w-4 h-2 bg-black rounded-sm m-0.5"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Profile Header */}
                        <div className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-bold">MS</span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Hello,</p>
                              <p className="font-semibold text-lg">Mathew Smith!</p>
                            </div>
                          </div>
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="px-6 mb-6">
                          <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center gap-3">
                            <div className="w-4 h-4 text-gray-400">🔍</div>
                            <span className="text-gray-500">Search Services</span>
                          </div>
                        </div>
                        
                        {/* Service Icons */}
                        <div className="px-6 mb-6">
                          <div className="grid grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg mb-2 mx-auto flex items-center justify-center">
                                <span className="text-blue-600">👤</span>
                              </div>
                              <span className="text-xs text-gray-600">Care</span>
                            </div>
                            <div className="text-center">
                              <div className="w-12 h-12 bg-green-100 rounded-lg mb-2 mx-auto flex items-center justify-center">
                                <span className="text-green-600">🏠</span>
                              </div>
                              <span className="text-xs text-gray-600">Home</span>
                            </div>
                            <div className="text-center">
                              <div className="w-12 h-12 bg-purple-100 rounded-lg mb-2 mx-auto flex items-center justify-center">
                                <span className="text-purple-600">💊</span>
                              </div>
                              <span className="text-xs text-gray-600">Health</span>
                            </div>
                            <div className="text-center">
                              <div className="w-12 h-12 bg-pink-100 rounded-lg mb-2 mx-auto flex items-center justify-center">
                                <span className="text-pink-600">➕</span>
                              </div>
                              <span className="text-xs text-gray-600">More</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Upcoming Services */}
                        <div className="px-6 mb-6">
                          <h3 className="font-semibold mb-3">Upcoming Services</h3>
                          <div className="bg-blue-500 rounded-xl p-4 text-white">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full"></div>
                              <div>
                                <p className="font-medium">Romian Wilson</p>
                                <p className="text-sm opacity-80">Home Care Service</p>
                              </div>
                            </div>
                            <p className="text-xs opacity-80 mb-2">Today at 3:00 PM</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs">Service in progress</span>
                              <button className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full">See All</button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Most Popular */}
                        <div className="px-6">
                          <h3 className="font-semibold mb-3">Most Popular</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">Dwan Smith</p>
                                <p className="text-xs text-gray-600">Elder Care</p>
                              </div>
                              <button className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs">Book Service</button>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">Chrish Butler</p>
                                <p className="text-xs text-gray-600">Home Care</p>
                              </div>
                              <button className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs">Book Service</button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Top Service Provider */}
                        <div className="absolute bottom-4 left-6 right-6">
                          <div className="bg-blue-500 rounded-xl p-4 text-white text-center">
                            <p className="font-semibold mb-1">Top Service Provider</p>
                            <div className="flex justify-center gap-2">
                              <span>⭐⭐⭐⭐⭐</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Content */}
              <div className="lg:w-1/2 text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600 mb-6 reveal">
                  Download Our App
                </h2>
                <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto lg:mx-0 reveal" style={{ animationDelay: '0.2s' }}>
                  Lorem ipsum dolor sit amet consectetur. Dolor condimentum ornare 
                  adipiscing tristique. Gravida scelerisque ut urna vestibulum habitant 
                  consequat elementum quis. Felis iaculis porttitor eu morbi in
                </p>
                
                {/* What You Get on App */}
                <div className="mb-8 reveal" style={{ animationDelay: '0.4s' }}>
                  <h3 className="text-xl font-bold text-black mb-6">What You Get on App</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-black">Lorem ipsum dolor sit amet consectetur.</p>
                        <p className="text-sm text-gray-600">Pharetra rhoncus fames commodo ut e</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-black">Lorem ipsum dolor sit amet consectetur.</p>
                        <p className="text-sm text-gray-600">Pharetra rhoncus fames</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-black">Lorem ipsum dolor sit amet consectetur.</p>
                        <p className="text-sm text-gray-600">Pharetra rhoncus fames commodo ut e</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-black">Lorem ipsum dolor sit amet consectetur.</p>
                        <p className="text-sm text-gray-600">Pharetra rhoncus fames</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Download Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start reveal" style={{ animationDelay: '0.6s' }}>
                  <button className="flex items-center justify-center gap-3 bg-black text-white rounded-lg px-6 py-3 hover:bg-gray-800 transition-colors hover-lift">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5C18.44 20.04 18.13 20.54 17.79 21.01C17.32 21.67 16.93 22.08 16.64 22.22C16.21 22.46 15.75 22.6 15.26 22.64C14.9 22.64 14.47 22.54 13.97 22.33C13.46 22.12 13 22.02 12.58 22.02C12.13 22.02 11.64 22.12 11.11 22.33C10.57 22.54 10.16 22.65 9.87 22.66C9.42 22.69 8.96 22.53 8.5 22.18C8.17 21.82 7.76 21.4 7.27 20.9C6.74 20.35 6.3 19.73 5.95 19.04C5.57 18.31 5.38 17.6 5.38 16.91C5.38 16.15 5.55 15.5 5.88 14.96C6.16 14.5 6.54 14.15 7.01 13.91C7.48 13.67 7.99 13.54 8.54 13.53C8.74 13.53 9 13.58 9.33 13.67C9.66 13.76 9.88 13.81 9.99 13.81C10.08 13.81 10.35 13.75 10.81 13.63C11.24 13.52 11.62 13.47 11.94 13.48C12.75 13.52 13.39 13.78 13.85 14.26C13.19 14.67 12.87 15.28 12.87 16.08C12.87 16.75 13.11 17.31 13.58 17.75C13.8 17.96 14.05 18.12 14.32 18.23C14.32 18.5 14.32 18.76 14.32 19.01L18.71 19.5ZM14.25 11.09C14.25 11.53 14.08 11.94 13.74 12.32C13.32 12.78 12.81 13.05 12.26 13.01C12.25 12.94 12.24 12.86 12.24 12.78C12.24 12.35 12.42 11.91 12.77 11.54C12.95 11.35 13.18 11.19 13.46 11.06C13.74 10.93 14 10.86 14.24 10.85C14.25 10.93 14.25 11.01 14.25 11.09Z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs opacity-80">Download on the</div>
                      <div className="text-lg font-semibold">App Store</div>
                    </div>
                  </button>
                  
                  <button className="flex items-center justify-center gap-3 bg-black text-white rounded-lg px-6 py-3 hover:bg-gray-800 transition-colors hover-lift">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12.001L3.609 22.186C3.312 21.998 3.123 21.667 3.123 21.281V2.719C3.123 2.333 3.312 2.002 3.609 1.814ZM20.623 11.001C21.056 11.001 21.414 11.359 21.414 11.792C21.414 12.225 21.056 12.583 20.623 12.583H14.792L11.001 8.792L14.792 5.001H20.623C21.056 5.001 21.414 5.359 21.414 5.792C21.414 6.225 21.056 6.583 20.623 6.583H16.168L13.792 9.001L16.168 11.418H20.623Z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs opacity-80">GET IT ON</div>
                      <div className="text-lg font-semibold">Google Play</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
                {/* Service Provider Registration Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 reveal">
                Become a Service Provider
              </h2>
              <p className="text-gray-600 max-w-lg reveal" style={{ animationDelay: '0.2s' }}>
                Lorem ipsum dolor sit amet consectetur. Iaculis tellus aliquam fringilla 
                velit magna aliquet. Amet auctor egestas mattis aliquet.
              </p>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 mb-16">
              {/* Left Side - Image */}
              <div className="lg:w-1/2 flex justify-center lg:justify-start reveal reveal-left">
                <div className="relative w-full max-w-md">
                  <img 
                    src="/images/placeholders/service-provider.jpg" 
                    alt="Service Provider" 
                    className="w-full h-auto rounded-2xl shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/500x400/f3f4f6/6b7280?text=Service+Provider';
                    }}
                  />
                </div>
              </div>
              
              {/* Right Side - Content */}
              <div className="lg:w-1/2 reveal reveal-right">
                <div className="space-y-8">
                  {/* Earn More */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 7.5L13.5 7L10.5 4C9.9 3.4 9 3.4 8.4 4L6 6.4C5.4 7 5.4 7.9 6 8.5L7 9.5L7 15C7 15.6 7.4 16 8 16S9 15.6 9 15L9 10L10.5 8.5L12 10V15C12 15.6 12.4 16 13 16S14 15.6 14 15L14 9.5L15 7.5Z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black mb-2">Earn More</h3>
                      <p className="text-gray-600">Set your prices as you want</p>
                    </div>
                  </div>

                  {/* Simple Onboarding */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM11.003 16L18.073 8.929L16.659 7.515L11.003 13.172L8.174 10.343L6.76 11.757L11.003 16Z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black mb-2">Simple Onboarding</h3>
                      <p className="text-gray-600">Set your prices as you want</p>
                    </div>
                  </div>

                  {/* Build Your Reputation */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2ZM12 15.4L16.76 18.16L15.95 12.61L20.33 8.69L14.68 8.06L12 3.1L9.32 8.06L3.67 8.69L8.05 12.61L7.24 18.16L12 15.4Z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black mb-2">Build Your Reputation</h3>
                      <p className="text-gray-600">Set your prices as you want</p>
                    </div>
                  </div>
                </div>

                {/* Register Button */}
                <div className="mt-8">
                  <Link href="/auth/provider-register">
                    <Button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold hover-lift">
                      Register as a Provider
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Blue Section */}
            <div className="bg-blue-600 rounded-2xl p-8 lg:p-12 text-white reveal" style={{ animationDelay: '0.4s' }}>
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Left Content */}
                <div className="lg:w-2/3">
                  <h3 className="text-2xl lg:text-3xl font-bold mb-6">Why to Choose Us</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white">Flexible scheduling that works around your availability</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white">Competitive pay rates with weekly payments</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white">Professional development and training opportunities</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white">Support from our dedicated provider success team</span>
                    </div>
                  </div>
                </div>

                {/* Right Image */}
                <div className="lg:w-1/3 flex justify-center">
                  <div className="relative w-full max-w-xs">
                    <img 
                      src="/images/placeholders/caregiver-team.jpg" 
                      alt="Caregiver Team" 
                      className="w-full h-auto rounded-xl"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300x250/ffffff/6b7280?text=Caregiver+Team';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 reveal">
                FAQs
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto reveal" style={{ animationDelay: '0.2s' }}>
                Lorem ipsum dolor sit amet consectetur, id vel rhoncus tristique sagittis. Dignissim pellentesque s
              </p>
            </div>

            {/* Category Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12 reveal" style={{ animationDelay: '0.4s' }}>
              <button className="px-6 py-3 bg-purple-100 text-purple-700 rounded-full font-medium hover:bg-purple-200 transition-colors">
                Service
              </button>
              <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
                Payment
              </button>
              <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
                Primary
              </button>
              <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
                Ask Questions
              </button>
            </div>

            {/* FAQ Items */}
            <div className="max-w-4xl mx-auto space-y-6">
              {/* FAQ Item 1 - Featured */}
              <div className="bg-purple-50 rounded-2xl p-6 reveal" style={{ animationDelay: '0.6s' }}>
                <h3 className="text-xl font-bold text-black mb-3">
                  Lorem ipsum dolor sit amet consectetur. Luctus vitae ?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Lorem ipsum dolor sit amet consectetur. Ligula mauris faucibus hac scelerisque velit. Facilisis imperdiet lacus sed turpis 
                  sollicitudin mauris eu tellus consequat.
                </p>
              </div>

              {/* FAQ Item 2 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow reveal" style={{ animationDelay: '0.7s' }}>
                <h3 className="text-xl font-bold text-black mb-3">
                  Lorem ipsum dolor sit amet consectetur. Luctus vitae ?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Lorem ipsum dolor sit amet consectetur. Ligula mauris faucibus hac scelerisque velit. Facilisis imperdiet lacus sed turpis 
                  sollicitudin mauris eu tellus consequat.
                </p>
              </div>

              {/* FAQ Item 3 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow reveal" style={{ animationDelay: '0.8s' }}>
                <h3 className="text-xl font-bold text-black mb-3">
                  Lorem ipsum dolor sit amet consectetur. Luctus vitae ?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Lorem ipsum dolor sit amet consectetur. Ligula mauris faucibus hac scelerisque velit. Facilisis imperdiet lacus sed turpis 
                  sollicitudin mauris eu tellus consequat.
                </p>
              </div>

              {/* FAQ Item 4 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow reveal" style={{ animationDelay: '0.9s' }}>
                <h3 className="text-xl font-bold text-black mb-3">
                  Lorem ipsum dolor sit amet consectetur. Luctus vitae ?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Lorem ipsum dolor sit amet consectetur. Ligula mauris faucibus hac scelerisque velit. Facilisis imperdiet lacus sed turpis 
                  sollicitudin mauris eu tellus consequat.
                </p>
              </div>
            </div>

            {/* Explore More Link */}
            <div className="text-center mt-12 reveal" style={{ animationDelay: '1.0s' }}>
              <Link href="/faq" className="text-blue-600 font-medium text-lg hover:underline">
                Explore More...
              </Link>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-black text-white py-16">
          <div className="container mx-auto px-4 text-center reveal">
            <h2 className="text-3xl font-bold mb-6 animate-gradient-text">Ready to Get Started?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              Join thousands of satisfied clients who have found the perfect caregiving solution for their needs.
            </p>
            <Link href="/auth/register">
              <Button className="px-8 py-3 text-lg bg-white text-black hover:bg-gray-100 hover-lift btn-pulse animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
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