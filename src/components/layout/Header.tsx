'use client';

import React from 'react';
import Link from 'next/link';
import Button from '../common/Button';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-black">
          Caregiving
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/services/browse" className="text-gray-600 hover:text-black">
            Services
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-black">
            About Us
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-black">
            Contact
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link href="/auth/login">
            <Button variant="secondary" className="px-6">Login</Button>
          </Link>
          <Link href="/auth/register">
            <Button className="px-6">Sign Up as User</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
