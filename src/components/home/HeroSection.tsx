'use client';

import React from 'react';
import Link from 'next/link';
import Button from '../common/Button';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center">
      <div className="container mx-auto px-6 md:px-12 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Heading */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Bringing Joy to Your Home, <br />
              <span className="text-blue-600">One Smile at a Time</span>
            </h1>
            <div className="mt-8">
              <Link href="/services/browse">
                <Button className="px-8 py-3 text-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Right Column - Description */}
          <div>
            <p className="text-lg text-gray-700 mb-6">
              We Provide compassionate home services and caregiving solutions, delivering personalized care and support to families and individuals in need. We're dedicated to enhancing.
            </p>
          </div>
        </div>
      </div>
      
      {/* Dark Blue Service Cards Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#001233] min-h-[30vh] rounded-t-[30px] flex items-center">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Service Cards would go here */}
          </div>
          
          {/* CTA Button */}
          <div className="flex justify-center mt-8">
            <Link href="/services/browse">
              <Button className="px-12 py-4 text-lg bg-blue-600 hover:bg-blue-700 rounded-full">
                We are Ready to Serve You
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
