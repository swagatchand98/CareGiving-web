'use client';

import React from 'react';
import Link from 'next/link';

const PublicHeader: React.FC = () => {
  return (
    <header className="py-4 px-6 md:px-12 lg:px-16">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-blue-600 text-2xl font-bold">
            Logo
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-12">
            <Link href="/" className="text-gray-800 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-800 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/services" className="text-gray-800 hover:text-blue-600 transition-colors">
              Services
            </Link>
            <Link href="/how-it-works" className="text-gray-800 hover:text-blue-600 transition-colors">
              How it Works
            </Link>
            <Link href="/faqs" className="text-gray-800 hover:text-blue-600 transition-colors">
              FAQs
            </Link>
          </nav>
          
          {/* Login Button */}
          <Link href="/auth/login" className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors">
            Login
          </Link>
        </div>

        <div className='h-[1px] w-full bg-gray-300 mt-3'></div>
      </div>
    </header>
  );
};

export default PublicHeader;
