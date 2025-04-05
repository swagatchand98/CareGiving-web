'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Button from '@/components/common/Button';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

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
          <div className="container mx-auto px-4">
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
